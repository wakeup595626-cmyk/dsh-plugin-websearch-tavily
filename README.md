# dsh-plugin-websearch-tavily

**中文** | [English](README.en.md)

为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的 web seam 提供 **Tavily 联网搜索能力**。

以稳定 id `tavily-search` 注册一个联网搜索 provider，并通过随包提供的 `cordis.patch.yml` 把它设为该 profile 的默认搜索 provider。

- 调用 `POST https://api.tavily.com/search`（bearer 认证），返回 Tavily 结构化的 `results[]`（title、url、content、published_date）——这种结构正是为 AI agent 设计的。
- 凭据**按次解析、绝不保存**，顺序为：插件 config 中的字面量 `apiKey` — `credentials.resolve(TAVILY_API_KEY)` — 兜底 `credentials.resolve(DEEPSEEK_API_KEY)`。
- 从 profile 中移除该 bundle，即可同时撤销 provider 注册与默认搜索设置。

## 安装

```sh
dsh plugin --profile web add github:wakeup595626-cmyk/dsh-plugin-websearch-tavily
```

## 使用

1. 获取 Tavily API Key（免费额度约每月 1000 次基础搜索）。
2. 通过插件 config 传入，或让 host 能解析到 `TAVILY_API_KEY`。
3. 像平常一样向 agent 提问需要联网搜索的内容。

## 环境要求

- 已安装 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
- 你自己的 Tavily API Key

## 第三方声明

本插件在运行时调用 Tavily 搜索 API，需要你自己的 API Key，并受 Tavily 服务条款约束。包内不含任何第三方代码。

详见 [THIRD_PARTY_NOTICES.zh.md](THIRD_PARTY_NOTICES.zh.md)（[English](THIRD_PARTY_NOTICES.md)）。

## 社区与支持

- 通过 [GitHub Issues](https://github.com/wakeup595626-cmyk/dsh-plugin-websearch-tavily/issues) 报告问题与提问。
- 为你自己的插件仓库添加 [`dsh-plugin`](https://github.com/topics/dsh-plugin) 话题，便于被发现。
- 在 [awesome-dsh-plugin.com](https://awesome-dsh-plugin.com) 浏览更广阔的插件生态。

## 参与贡献

参见 [CONTRIBUTING.zh.md](CONTRIBUTING.zh.md)（[English](CONTRIBUTING.md)）。

## 引用

```bibtex
@misc{dsh-plugin-websearch-tavily,
  title={dsh-plugin-websearch-tavily},
  author={wakeUp595626-cmyk},
  year={2026},
  publisher={GitHub},
  howpublished={\url{https://github.com/wakeup595626-cmyk/dsh-plugin-websearch-tavily}},
}
```

## 许可证

[MIT](LICENSE)
