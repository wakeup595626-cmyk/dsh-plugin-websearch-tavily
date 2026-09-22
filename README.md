# dsh-plugin-websearch-tavily

> **非官方插件。** 由社区开发者独立编写与维护，与 DeepSeek 官方（`@deepseek-ai/*` 包）无隶属关系，也未获其背书。`lib/` 已随仓库提交，开箱即用，无需构建步骤。

让 DeepSeek Harness（DSH）的**网页搜索**走 Tavily Search API。适用于手里有 Tavily 密钥、希望获得结构化联网搜索来源的场景。

## 一、准备工作

1. **一个 Tavily API Key**：去 https://tavily.com 注册（有免费额度，约 1000 次基础搜索/月），登录后在控制台复制你的 `tvly-...` 密钥。
   - 密钥是私人的，请自己注册，不要使用别人的密钥。
2. **pnpm 已安装并可用**：DSH 的插件命令依赖 pnpm。没有的话先运行：
   ```
   npm install -g pnpm
   ```

## 二、安装（推荐命令）

在终端里进入本压缩包解压后的目录，然后运行：

```bat
dsh plugin --profile web add "D:\完整路径\dsh-plugin-websearch-tavily"
```

（把路径换成你解压后的实际绝对路径；也可以直接 add 这个 `.tgz` 文件。）

这条命令会：
- 把插件装进 DSH 的 `web` 配置档案；
- 自动把它加入装配列表；
- 自动把默认网页搜索提供方切到 `tavily-search`。

## 三、填入密钥

打开 DSH 网页界面：

```
设置 → 插件 → 插件配置 → Web search → API Key
```

把你自己刚注册的 Tavily 密钥粘贴进去并保存。

（说明：该插件优先读取 `TAVILY_API_KEY`，其次会兼容读取你在这个旧“Web search”栏位保存的密钥，所以在这里填即可生效。）

## 四、验证

重启 DSH（或在 DSH 里让它重载插件），然后说一句：

> 搜索一下今天的重要科技新闻

如果返回了带**标题 + 链接 + 摘要**的多条来源，就说明成功了。

## 五、卸载 / 回滚

```bat
dsh plugin --profile web remove dsh-plugin-websearch-tavily
```

这会移除依赖并把它从装配列表里去掉，默认搜索提供方也会回到 DSH 内置的 DeepSeek 官方搜索。

## 常见问题

- **报 "pnpm not found"**：执行 `npm install -g pnpm` 后重试。
- **搜索报密钥错误**：检查上面第三步的密钥是否已保存，且是 `tvly-` 开头、状态有效。
- **聊天模型不受影响**：本插件只改网页搜索，不触碰任何聊天模型或聊天密钥。