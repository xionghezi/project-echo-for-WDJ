# Cloudflare Workers 迁移验证 · 2026-10-27

基线：9ad9d37。问卷版本：2026-10-27.release1。

- 类型检查通过；规则、手势、CSV、JWT安全和配置测试17/17通过。
- 生产构建通过，保持Vinext 1.0.0-beta.5 / Cloudflare Vite插件1.37.1 / Vite8.0.13 / Wrangler4.92.0。
- 临时本地D1 + 生产构建接口测试4/4通过：三类经历保存、重试去重、冲突不覆盖、非法请求拒绝、匿名及伪造身份头无管理/统计/CSV权限。
- 浏览器验证正式草稿刷新恢复到第2题；完整13题试填和13行核对、完成页通过；试填后原正式草稿保留，且本地预览D1无试填写入。
- 原首页、样式、问卷定义、版本、吉祥物、统计面板、SQL迁移未改。
- 管理员读取默认关闭；缺配置/无令牌/坏令牌/JWKS失败均拒绝；workers.dev和预览网址默认关闭。
- 未提供真实Cloudflare资源ID，因此未对真实账号执行dry-run或部署，未做真实Access登录和授权导出成功验收。
- 修改提交到原GitHub仓库的迁移分支供审阅；未发布、未改原Sites站点，未读取或迁移生产答卷；未写实际密码、Token或密钥。

构建仍显示上游Vinext的动态导入优化警告，不阻止构建。手机、微信和大陆网络表现未在本次迁移中重测。

逐文件改动见[MIGRATION.md](MIGRATION.md)，PowerShell命令和分阶段Access验证见[README.md](README.md)。真实管理员身份保护未通过前，禁止将adminAccessEnabled改为true。
