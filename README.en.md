# dsh-plugin-websearch-tavily

[中文](README.md) | **English**

A **Tavily-backed web search provider** for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web seam.

Registers a web search provider under the stable id `tavily-search` and selects it as the profile's default search provider through the bundled `cordis.patch.yml`.

- Calls `POST https://api.tavily.com/search` with bearer auth and returns Tavily's structured `results[]` (title, url, content, published_date) — a shape built for AI agents.
- Credentials are resolved **per search and never retained**, in this order: literal `apiKey` in the plugin config — `credentials.resolve(TAVILY_API_KEY)` — `credentials.resolve(DEEPSEEK_API_KEY)` as a fallback.
- Removing the bundle from the profile reverts both the provider registration and the default-provider change.

## Install

```sh
dsh plugin --profile web add github:wakeup595626-cmyk/dsh-plugin-websearch-tavily
```

## Usage

1. Obtain a Tavily API key (the free tier covers roughly 1000 basic searches per month).
2. Provide it via the plugin config or by exposing `TAVILY_API_KEY` to the host.
3. Ask the agent anything that requires a web search.

## Requirements

- A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) installation
- A Tavily API key of your own

## Third-party notices

This plugin talks to the Tavily search API at runtime, which requires your own API key and is governed by Tavily's terms of service. No third-party code is bundled.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Community and support

- Report bugs and ask questions through [GitHub Issues](https://github.com/wakeup595626-cmyk/dsh-plugin-websearch-tavily/issues).
- Add the [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic to your own plugin repository for discoverability.
- Browse the wider ecosystem at [awesome-dsh-plugin.com](https://awesome-dsh-plugin.com).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Citation

```bibtex
@misc{dsh-plugin-websearch-tavily,
  title={dsh-plugin-websearch-tavily},
  author={wakeUp595626-cmyk},
  year={2026},
  publisher={GitHub},
  howpublished={\url{https://github.com/wakeup595626-cmyk/dsh-plugin-websearch-tavily}},
}
```

## License

[MIT](LICENSE)
