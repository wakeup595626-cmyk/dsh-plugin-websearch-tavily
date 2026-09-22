/**
 * Tavily-backed web search provider for the DSH web seam.
 *
 * Tavily (https://tavily.com) is a search API built for AI agents: it returns
 * structured `results[]` with title/url/content/published_date. This provider
 * registers under the stable id `tavily-search` and talks to
 * `POST https://api.tavily.com/search` with bearer auth.
 *
 * Credential resolution (per search, never retained):
 *   1. literal `apiKey` in the plugin config (patch layer)
 *   2. `credentials.resolve(TAVILY_API_KEY)` — the dedicated reference
 *   3. `credentials.resolve(DEEPSEEK_API_KEY)` — fallback for keys the user
 *      already stored through the old "Web search" settings field
 *   4. `$TAVILY_API_KEY` process environment
 *
 * The fallback (3) exists because the existing Web search UI card writes the
 * API key under `DEEPSEEK_API_KEY`; it keeps the user's already-entered key
 * working without asking them to re-enter it.
 */
const PROVIDER_ID = "tavily-search";
const DEFAULT_BASE_URL = "https://api.tavily.com/search";
const DEFAULT_API_KEY_ENV = "TAVILY_API_KEY";
const USER_AGENT = "deepseek-harness/0.1.0";

/** Minimal stand-in for the `@deepseek-ai/dsh-web` WebError the seam uses. */
class WebError extends Error {
  constructor(message, code, opts) {
    super(message, opts);
    this.name = "WebError";
    this.code = code;
  }
}

function isAbortError(error) {
  return (error instanceof DOMException && error.name === "AbortError") || error?.name === "AbortError";
}

class TavilySearchProvider {
  id = PROVIDER_ID;

  constructor(resolveOptions) {
    this.resolveOptions = resolveOptions;
  }

  available() {
    const options = this.resolveOptions();
    // Cheap local check only; actual credential presence is resolved at search time.
    return (options.apiKey?.length > 0 || options.resolveApiKey !== void 0) && URL.canParse(options.baseURL);
  }

  async search(request, signal) {
    const options = this.resolveOptions();
    const apiKey = await this.apiKey(options, signal);
    if (signal?.aborted === true) throw new WebError("Tavily search aborted", "WEB_ABORTED");

    const body = {
      query: request.query,
      search_depth: options.searchDepth,
      max_results: Math.min(Math.max(1, request.maxResults ?? options.maxResults), 20),
      topic: options.topic,
      ...(options.includeAnswer ? { include_answer: true } : {})
    };

    let response;
    try {
      response = await fetch(options.baseURL, {
        method: "POST",
        redirect: "error",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
          accept: "application/json",
          "user-agent": USER_AGENT
        },
        body: JSON.stringify(body),
        ...(signal !== void 0 ? { signal } : {})
      });
    } catch (error) {
      if (signal?.aborted === true || isAbortError(error)) throw new WebError("Tavily search aborted", "WEB_ABORTED");
      throw new WebError(`Tavily search request failed: ${String(error)}`, "WEB_PROVIDER_ERROR");
    }

    if (!response.ok) {
      let detail = "";
      try {
        const parsed = await response.json();
        detail = typeof parsed === "object" && parsed !== null ? (parsed.detail ?? parsed.message ?? String(parsed.error ?? "")) : "";
      } catch {
        // non-JSON error body; fall through with status-only message
      }
      const suffix = detail && detail.length > 0 ? `: ${String(detail).slice(0, 300)}` : "";
      throw new WebError(`Tavily API error (HTTP ${response.status})${suffix}`, "WEB_PROVIDER_ERROR");
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      if (signal?.aborted === true || isAbortError(error)) throw new WebError("Tavily search aborted", "WEB_ABORTED");
      throw new WebError("Tavily returned an unprocessable response body", "WEB_PROVIDER_ERROR");
    }

    const results = Array.isArray(data.results) ? data.results : [];
    const seen = new Set();
    const sources = [];
    for (const item of results) {
      if (!item || typeof item.url !== "string" || item.url.length === 0) continue;
      let url;
      try { url = new URL(item.url); } catch { continue; }
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      if (url.username || url.password) continue;
      if (seen.has(url.href)) continue;
      seen.add(url.href);
      sources.push({
        url: url.href,
        ...(typeof item.title === "string" && item.title.length > 0 ? { title: item.title } : {}),
        ...(typeof item.content === "string" && item.content.length > 0 ? { snippet: item.content } : {}),
        ...(typeof item.published_date === "string" && item.published_date.length > 0 ? { publishedAt: item.published_date } : {})
      });
    }
    if (sources.length === 0) {
      throw new WebError("Tavily returned no valid HTTP search results", "WEB_PROVIDER_ERROR");
    }
    return {
      ...(typeof data.answer === "string" && data.answer.length > 0 ? { content: data.answer } : {}),
      sources,
      truncated: false
    };
  }

  async apiKey(options, signal) {
    if (signal?.aborted === true) throw new WebError("Tavily search aborted", "WEB_ABORTED");
    if (options.apiKey !== void 0 && options.apiKey.length > 0) return options.apiKey;

    let resolved;
    try {
      resolved = await options.resolveApiKey?.();
    } catch (error) {
      if (signal?.aborted === true || isAbortError(error)) throw new WebError("Tavily search aborted", "WEB_ABORTED");
      throw new WebError(`Tavily search credential resolution failed: ${String(error)}`, "WEB_PROVIDER_ERROR");
    }
    if (resolved !== void 0 && resolved.length > 0) return resolved;
    throw new WebError(`Tavily search has no API key for "${options.apiKeyEnv ?? DEFAULT_API_KEY_ENV}"; store it through the credentials service (the Web search settings field) or set $TAVILY_API_KEY`, "WEB_PROVIDER_CREDENTIAL_MISSING");
  }
}

function resolveOptions(ctx, config) {
  const apiKeyEnv = config.apiKeyEnv ?? DEFAULT_API_KEY_ENV;
  const literalApiKey = config.apiKey !== void 0 && config.apiKey.length > 0 ? config.apiKey : void 0;
  return {
    ...(literalApiKey === void 0 ? {} : { apiKey: literalApiKey }),
    resolveApiKey: async () => {
      const credentials = ctx.get("credentials");
      if (credentials !== void 0) {
        const read = async (ref) => {
          try {
            const resolved = await credentials.resolve(ref);
            return resolved?.value;
          } catch {
            return void 0;
          }
        };
        const primary = await read(apiKeyEnv);
        if (primary !== void 0 && primary.length > 0) return primary;
        if (apiKeyEnv !== "DEEPSEEK_API_KEY") {
          const fallback = await read("DEEPSEEK_API_KEY");
          if (fallback !== void 0 && fallback.length > 0) return fallback;
        }
      }
      const ambient = process.env[apiKeyEnv];
      return ambient !== void 0 && ambient.length > 0 ? ambient : void 0;
    },
    apiKeyEnv,
    baseURL: config.baseURL ?? DEFAULT_BASE_URL,
    searchDepth: config.searchDepth ?? "basic",
    maxResults: Number.isInteger(config.maxResults) && config.maxResults > 0 ? config.maxResults : 5,
    topic: config.topic ?? "general",
    includeAnswer: config.includeAnswer === true
  };
}

/** Register the Tavily search provider with the web seam. */
function apply(ctx, config = {}) {
  ctx.web.registerSearchProvider(new TavilySearchProvider(() => resolveOptions(ctx, config)));
}

export { apply };
export const name = "web-search-tavily";
export const inject = ["web"];