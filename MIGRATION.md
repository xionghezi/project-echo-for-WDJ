# Project Echo 独立 Workers 迁移记录

日期：2026-10-27。基线：GitHub `xionghezi/project-echo-for-WDJ` 的 `9ad9d37`。

本次修改提交到原 GitHub 仓库的迁移分支供审阅，不发布网站，不改原 GPT Sites 正式站点。未读取或复制生产答卷，未登录 Cloudflare，未写入真实凭据或 Token。迁移到自己的账号所需资源标识尚未提供；所有答卷读取默认关闭。

## 保留的职责和行为

前端：`app/page.tsx`、`app/globals.css`、`app/components/Companion.tsx`、`lib/survey.ts`、`lib/gestures.ts`、`app/admin/AdminDashboard.tsx` 未修改。问卷版本仍为 `2026-10-27.release1`，13题、共享规则、草稿键、试填隔离、核对修改、正式提交状态不变。

后端：Worker 先清理旧身份头和做访问控制；管理页面和导出各自再次授权。受访者提交接口负责重新校验及重试去重；Drizzle/D1保存答卷。数据库 schema、SQL迁移、CSV 内容格式和统计口径不变。

认证：Access负责登录及签发令牌；服务端只用受信团队的公钥验证令牌，不相信裸身份头。验证成功还需匹配管理员邮箱并打开读取开关。开关关闭时真实管理员也读不到答卷。session只返回布尔验证结果，供管理员在不开答卷权限时验收。

构建：保留 Vinext beta.5 的自定义 fetch-handler 和 RSC/SSR 接入；按该版本发布包中的官方配置构建为 `dist/server/wrangler.json` 和 `dist/client`，不盲用最新初始化器，不更换框架。

## 修改和新增文件，逐个解释

| 文件 | 改动与原因 |
| --- | --- |
| `.gitignore` | 排除本地部署配置、环境变量、密钥、CSV、数据库、备份、测试产物与独立 pnpm store。 |
| `.openai/hosting.json` | 删除。原文件只有 DB/R2 声明；独立 Wrangler 取代它，原站点未被访问或修改。 |
| `vite.config.ts` | 保留 Vinext/RSC/SSR 组合；去掉 sites()、mockAuth、connectorPreview 和托管配置导入；选用本地 Wrangler 配置或无 ID 的本地模板。 |
| `worker/index.ts` | 保留该版本 vinext/server/fetch-handler；移除 CONNECTORS 注入，改在框架前执行身份头清理、授权和缓存保护。 |
| `wrangler.jsonc` | 新增独立 Worker 模板。DB 绑定保留，不写数据库 ID；关闭 workers.dev、预览网址和管理员读取。 |
| `deploy-config.example.json` | 新增空值资源配置示例，不包含账号、邮箱或秘密实际值。 |
| `scripts/cloudflare-config.mjs` | 验证账号、D1 ID、域名、Access 团队/AUD和布尔读取开关，拒绝原占位 ID；生成 DB 和自定义域名配置。 |
| `scripts/configure-cloudflare.mjs` | 从被忽略的 deploy-config.local.json 生成被忽略的 wrangler.local.json；不处理 Token/密码。 |
| `scripts/deploy.mjs` | 仅接受可选 --dry-run；验证配置、重新生产构建、核对产物，再调用官方 Wrangler 部署命令，防止误用过期构建。 |
| `scripts/local-state.mjs` | 统一短路径本地 D1 状态位置，可由 ECHO_LOCAL_STATE 配置，避免 Windows SQLite 长路径故障。 |
| `scripts/local.mjs` | 跨平台本地迁移/生产预览命令，始终显式 --local，统一状态目录。 |
| `scripts/test-worker.mjs` | 建立临时本地 D1、应用迁移、启动产物、选择空闲端口并跑接口测试；退出后校验路径再清理临时数据库。 |
| `lib/admin.ts` | 替换旧身份头比较：jose RS256验签、受限团队 JWKS、issuer/audience/有效期/必需字段、管理员邮箱、默认关闭开关。 |
| `lib/request-guard.ts` | 新增 Worker 前置保护。删除 oai 身份头，拒绝 /admin*、/api/export* 的未授权请求；私密路径强制 no-store。 |
| `app/chatgpt-auth.ts` | 删除不再存在的 Sites ChatGPT 登录/退出/回调实现，未留下不安全兼容入口。 |
| `app/admin/page.tsx` | 去掉 Sites 登录跳转；服务端独立复核 Access 管理员和读取开关，才渲染后台。 |
| `app/api/export/route.ts` | 保留正式/历史版本过滤、统计与 CSV；查询 D1 前 await 授权；显式动态、私密且不可缓存。 |
| `app/api/session/route.ts` | 只返回 authenticatedAdmin/canManage 两个布尔值，支持在读取关闭时验证真实 Access 身份；显式动态/no-store。 |
| `app/api/responses/route.ts` | 正式保存、校验、版本和去重逻辑保留；早期拒绝时以 16KB 上限清理请求体，修复本地连续请求 503。 |
| `cloudflare-env.d.ts` | 新增 Access 团队、AUD、读取开关类型，保留 DB/管理员邮箱，移除未使用的 R2 类型。 |
| `db/index.ts` | 保留 cloudflare:workers + Drizzle；错误提示改为独立 D1 配置，不再要求 Sites 控制平面。 |
| `package.json` | 构建改为官方 Vite、预览改为本地 Wrangler；增加检查/测试/配置/部署脚本，加入精确 jose 版本，删除连接器工具专用依赖。 |
| `pnpm-lock.yaml` | 锁定 jose 6.1.3，删除已不用的 json-rpc-2.0/raw-body 依赖树；框架版本不变。 |
| `pnpm-workspace.yaml` | 保留供应链策略，将 Sites 环境变量 store 路径换成独立 .pnpm-store。 |
| `tests/interaction.test.mjs` | 保留手势测试，移除会把伪造旧身份头当成授权的旧测试；新认证测试取代它。 |
| `tests/auth.test.mjs` | 新增真实内存RSA签名测试、伪造头/算法/签名/受众/签发者/时间/字段/JWKS故障测试，以及 Worker 路径和缓存保护测试。 |
| `tests/config.test.mjs` | 新增真实 ID 必填、占位拒绝、账号/域名/AUD/读取开关及备用入口测试，使用纯合成配置。 |
| `tests/worker.integration.mjs` | 新增本地生产构建+真实D1接口测试，验证三类提交、重试、冲突、非法请求和所有私密导出默认拒绝。 |
| `README.md` | 更新架构和身份说明；提供Windows安装、本地检查、真实D1/Access配置、dry-run、分阶段部署与回退命令。 |
| `RELEASE_CHECKS.md` | 改为本次迁移的实际检查记录，区分本地验证与尚未进行的线上验收。 |
| `MIGRATION.md` | 本逐文件迁移说明、前后端边界、验证证据与未完成事项。 |

## 删除的未使用 Sites 支持文件，逐个解释

删除前已搜索引用：这些文件只支持已移除的 Sites/连接器链路，问卷没有业务调用；删除后类型检查和构建通过。没有删问卷 UI 或数据库迁移。

| 文件 | 删除原因 |
| --- | --- |
| `scripts/vite/sites-vite-plugin.ts` | Sites 构建元数据、mock auth 和控制平面插件。 |
| `scripts/vite/sites-vite-plugin.LICENSE` | 随被删除插件附带的专用许可副本；没有继续复用该插件代码。 |
| `scripts/vite/connector-preview-plugin.mjs` | 未使用的 Sites 连接器预览 Vite 插件。 |
| `scripts/tool-environment.mjs` | Sites 特定工具环境设置。 |
| `scripts/sites-env.sh` | Sites shell 环境包装。 |
| `scripts/sites-env.mjs` | Sites Node 环境包装。 |
| `scripts/run-framework.mjs` | 按 Sites execution profile 分流的框架包装；独立 Vite 脚本取代。 |
| `scripts/pnpm-install.mjs` | Sites pnpm 安装包装；标准冻结锁文件安装取代。 |
| `scripts/npm-install.mjs` | Sites npm 安装包装；项目继续使用锁定 pnpm。 |
| `scripts/install-pnpm.sh` | Sites shell 安装入口；Windows 直接用 pnpm。 |
| `scripts/install-ci.sh` | Sites shell CI 安装逻辑。 |
| `scripts/install-ci.mjs` | Sites CI 安装包装。 |
| `scripts/execution-profile.mjs` | Sites managed-linux/portable 特定判断。 |
| `scripts/connector-preview/worker.mjs` | 未使用的连接器预览辅助 Worker。 |
| `scripts/connector-preview/protocol.mjs` | 辅助 Worker 预览协议。 |
| `scripts/connector-preview/host-binding.mjs` | 本机连接器预览桥。 |
| `scripts/connector-preview/connector-preview-session.mjs` | 预览会话及 JSON-RPC 通道。 |
| `scripts/build-verified.sh` | 依赖 Sites 环境和 GNU timeout 的构建包装；vite build 取代。 |
| `lib/connectors.ts` | 问卷未调用的 Sites 连接器入口。 |
| `lib/connector-preview.d.ts` | 已移除预览绑定的声明。 |
| `lib/connector-errors.mts` | 未使用的连接器错误恢复实现。 |
| `lib/connector-contract.mts` | 未使用的 Sites 连接器协议和能力描述。 |
| `lib/connector-context.ts` | 仅服务 Sites CONNECTORS 的请求上下文。 |
| `components/connector-error.tsx` | 没有被问卷使用的连接器错误 UI。 |

## 本次实际验证

| 检查 | 结果与边界 |
| --- | --- |
| `pnpm typecheck` | 通过。 |
| `pnpm test` | 17/17 通过，包含原问卷/手势/CSV与新增认证/配置测试。RSA私钥仅在测试进程内存生成。 |
| `pnpm build` | 通过，真实生成该版本的 Cloudflare Worker 配置与客户端资源。保留上游 Vinext 的 INEFFECTIVE_DYNAMIC_IMPORT 优化警告，无构建失败。 |
| `pnpm test:integration` | 4/4 通过。临时本地 D1 上三类经历各保存一次，相同答案重试去重，不同答案不覆盖；非法请求被拒绝；管理/RSC/正式历史统计和CSV对匿名/伪造头均拒绝。 |
| 浏览器草稿 | 正式第1题选择后进入第2题，刷新后显示继续填写，恢复到第2题。 |
| 浏览器试填 | 从空答案逐题完成12道选择题、跳过选填第13题，核对页13行、完成页成功；再进入正式草稿仍停留原第2题且该题未选。 |
| UI与题目保留 | Git对比确认首页、样式、组件、13题定义与版本均无改动。 |
| 独立部署配置 | 单元测试验证DB名称、缺ID/原占位ID拒绝、默认关闭读取、禁用备用入口。真实账号配置尚未提供，未对真实账号执行dry-run。 |
| 生产数据 | 未访问原Sites数据库；测试只使用合成数据。 |

Windows 本地 Workers 启动时，沙箱限制了 esbuild 对父目录的扫描。测试与预览经本机权限执行成功；仍只绑定127.0.0.1、使用临时/本地D1。为解决Windows深路径SQLite错误，本地状态改用统一短路径。没有降低生产认证。

## 尚未执行和交接条件

- 需要你自己的Cloudflare账号ID、D1真实ID、新自定义域名、Access团队域名和应用AUD。资源ID通过被忽略的本地配置提供，源码不虚构ID。
- 未创建Cloudflare资源、执行远程SQL、上传Worker、设置真实邮箱或进行真实Access登录。
- 必须依README先部署读取关闭版本，通过真实管理员/非管理员、伪造头和所有入口验证后，才能手动开启读取。上线后授权统计/CSV成功路径仍需验收。
- 本次没有重新做真实手机、微信内置浏览器或大陆网络测试；不沿用原站点的线上验证结论。
- 未迁移历史答卷。新域名不会继承旧域名浏览器草稿；新D1不会自动含旧站数据。
- Git忽略规则不能清除已跟踪敏感文件；本次公开基线中未发现实际答卷、邮箱密码或Token，生成的源码交付包也排除了状态/导出/配置/凭据文件。

Windows PowerShell的完整可执行命令与填写位置见 [README第7节](README.md#7-独立-cloudflare-workers-部署windows-powershell)。本地试填截图在交付目录的 `preview-complete.png`。
