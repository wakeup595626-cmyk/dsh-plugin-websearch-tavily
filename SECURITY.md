# 安全政策

## 报告安全问题

如果发现安全漏洞，请不要在公开 Issue 中直接披露细节。请使用 GitHub 的私密漏洞上报功能（仓库 Security 页面 → Report a vulnerability），并附上：受影响版本、最小复现步骤、脱敏后的证据（不要附带真实 API Key）。维护者确认并修复后，再决定是否公开披露。

## 安全边界

本插件为 DeepSeek Harness 的 web seam 提供 Tavily 联网搜索。除调用 Tavily 搜索接口所需的 API Key 外，插件不收集、不上传你的搜索内容；API Key 保存在本机配置或凭据中。若你认为存在密钥外泄或数据外发，请按上述方式上报。
