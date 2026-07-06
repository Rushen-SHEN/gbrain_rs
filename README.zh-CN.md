# GBrain

你的 AI 智能体很聪明，但记性不好。GBrain 给它一个大脑。

由 Y Combinator 总裁兼 CEO 打造，用于运行他真实的 AI 智能体。生产环境大脑驱动他的 OpenClaw 与 Hermes 部署：**17,888 页、4,383 人、723 家公司**，21 个 cron 任务自主运行，12 天建成。智能体在你睡觉时摄入会议、邮件、推文、语音通话和原创想法。它丰富遇到的每一个人和公司。它修复引用、在夜间整合记忆。你醒来时，大脑比睡前更聪明。

大脑会自我连线。每次写入页面都会提取实体引用并创建类型化链接（`attended`、`works_at`、`invested_in`、`founded`、`advises`），零 LLM 调用。混合搜索。自连线知识图谱。结构化时间线。反向链接加权排序。问「谁在 Acme AI 工作？」或「Bob 本季度投了什么？」——向量搜索单独做不到的事，它能答。与同类方案并排基准测试：在 240 页 Opus 生成的富文本语料上，gbrain 达到 **P@5 49.1%、R@5 97.9%**，比关闭图谱的变体 **P@5 高 31.4 点**，与 ripgrep-BM25 + 纯向量 RAG 优势相当。图谱层与 v0.12 提取质量共同拉开差距。完整 BrainBench 记分卡与语料在兄弟仓库 [gbrain-evals](https://github.com/garrytan/gbrain-evals)。

GBrain 是这些模式的泛化版。34 个技能。30 分钟安装。你的智能体干活。Garry 的个人智能体越变越聪明，你的也会。

**v0.25.0 新功能 — BrainBench-Real（会话捕获，贡献者可选）：** 在 shell 中设置 `GBRAIN_CONTRIBUTOR_MODE=1` 后，经 MCP、CLI 或 subagent 工具桥接的每次真实 `query` + `search` 调用都会被捕获（PII 已脱敏）到 `eval_candidates` 表。用 `gbrain eval export` 快照，用 `gbrain eval replay` 对你的代码变更重放。返回三个数字：捕获与当前检索 slug 的平均 Jaccard@k、top-1 稳定性、延迟 Δ。**生产用户默认关闭**——不会意外积累数据。 walkthrough：[docs/eval-bench.md](docs/eval-bench.md)。NDJSON 线格式：[docs/eval-capture.md](docs/eval-capture.md)。

> **约 30 分钟得到完整可用的大脑。** 数据库 2 秒就绪（PGLite，无需服务器）。你只需回答 API 密钥相关问题。

> **LLM：** 获取 [`llms.txt`](llms.txt) 文档地图，或 [`llms-full.txt`](llms-full.txt) 一次拉取内联核心文档。**智能体：** 从 [`AGENTS.md`](AGENTS.md) 开始（Claude Code 用 [`CLAUDE.md`](CLAUDE.md)）。

> **English:** [README.md](README.md)

## 安装

### 在智能体平台上（推荐）

GBrain 设计为由 AI 智能体安装和运维。若尚未运行智能体：

- **[OpenClaw](https://openclaw.ai)** … 在 [Render 部署 AlphaClaw](https://render.com/deploy?repo=https://github.com/chrysb/alphaclaw)（一键，8GB+ RAM）
- **[Hermes Agent](https://github.com/NousResearch/hermes-agent)** … 在 [Railway 部署](https://github.com/praveen-ks-2001/hermes-agent-template)（一键）

粘贴到你的智能体：

```
Retrieve and follow the instructions at:
https://raw.githubusercontent.com/garrytan/gbrain/master/INSTALL_FOR_AGENTS.md
```

即可。智能体会克隆仓库、安装 GBrain、配置大脑、加载 34 个技能、配置定时任务。你回答几个 API 密钥问题。约 30 分钟。

若智能体不会自动读 `AGENTS.md`，先指向该文件：
`https://raw.githubusercontent.com/garrytan/gbrain/master/AGENTS.md` 是非 Claude 智能体的操作协议（安装、阅读顺序、信任边界、常见任务）。完整文档地图用同 URL 根下的 `llms.txt`。

### 独立 CLI（无智能体）

```bash
git clone https://github.com/garrytan/gbrain.git && cd gbrain && bun install && bun link
gbrain init                     # 本地大脑，2 秒就绪
gbrain import ~/notes/          # 索引你的 markdown
gbrain query "what themes show up across my notes?"
```

**请勿使用 `bun install -g github:garrytan/gbrain`。** Bun 在全局安装时会阻止顶层 postinstall 钩子，schema 迁移不会运行，CLI 首次打开 PGLite 时会以 `Aborted()` 中止。请用上面的 `git clone + bun install && bun link`。见 [#218](https://github.com/garrytan/gbrain/issues/218)。

```
3 results (hybrid search, 0.12s):

1. concepts/do-things-that-dont-scale (score: 0.94)
   PG's argument that unscalable effort teaches you what users want.
   [Source: paulgraham.com, 2013-07-01]

2. originals/founder-mode-observation (score: 0.87)
   Deep involvement isn't micromanagement if it expands the team's thinking.

3. concepts/build-something-people-want (score: 0.81)
   The YC motto. Connected to 12 other brain pages.
```

### MCP 服务器（Claude Code、Cursor、Windsurf）

GBrain 通过 stdio 暴露 30+ MCP 工具：

```json
{
  "mcpServers": {
    "gbrain": { "command": "gbrain", "args": ["serve"] }
  }
}
```

添加到 `~/.claude/server.json`（Claude Code）、Settings > MCP Servers（Cursor）或你客户端的 MCP 配置。

## 部署配置

上游 `main` 是通用云优先参考路径。本 fork/分支并排保留两种运维配置。配置指南见 [`docs/guides/deployment-profiles.md`](docs/guides/deployment-profiles.md)。

- `Macmini` = 本地优先，Ollama `bge-m3` 嵌入（`1024d`）+ `llamacpp:qwen3.5-35b` 做 chat/扩展
- `MacbookPro-Work` = 混合路径，本地 Ollama `bge-m3` 嵌入（`1024d`）+ 云端 LLM 做 chat/扩展

公开文档规则：主机专属设置保持增量且脱敏。勿提交密钥，勿把两种配置合并成一条机器专属路径。

### 远程 MCP + OAuth 2.1（ChatGPT、Claude Desktop、Cowork、Perplexity）

`gbrain serve --http` 启动生产级 OAuth 2.1 服务器，内嵌管理面板。零外部基础设施。主流 AI 客户端可连接，每个请求有 scope，每个操作有日志。

```bash
# 启动 HTTP 服务器（首次启动打印 admin bootstrap token）
gbrain serve --http --port 3131

# 打开管理面板，粘贴 bootstrap token，注册客户端
open http://localhost:3131/admin

# 公网暴露（设置 --public-url 使 OAuth issuer 匹配）
ngrok http 3131 --url your-brain.ngrok.app
gbrain serve --http --port 3131 --public-url https://your-brain.ngrok.app

# ChatGPT 等 OAuth 客户端也可连接：
claude mcp add gbrain -t http https://your-brain.ngrok.app/mcp -H "Authorization: Bearer TOKEN"
```

从 `/admin` 面板注册 OAuth 客户端——点击 **Register client**，选 scope，在 reveal 模态框中保存仅显示一次的凭据。也可通过 `oauthProvider.registerClientManual(...)` 和 `gbrain auth register-client` CLI 编程注册。

- **MCP SDK 的 OAuth 2.1** — client credentials（机器对机器：Perplexity、Claude）、authorization code + PKCE（浏览器：ChatGPT）、refresh token 轮换、撤销、受保护资源元数据。可选动态客户端注册 `--enable-dcr`（DCR redirect_uris 须为 `https://` 或 loopback，RFC 6749 §3.1.2.1）。
- **Scope 化操作** — 30 个操作标记 `read | write | admin`。`sync_brain` 与 `file_upload` 为 `localOnly`，HTTP 拒绝。
- **React 管理面板** — 7 个屏幕编译进二进制（~65KB gzip）。实时 SSE 活动流、智能体表、凭据 reveal、可过滤请求日志、每客户端配置导出。
- **旧版 bearer token 仍可用** — v0.26 前 `gbrain auth create` 的 token 仍以 `read+write+admin` 认证。v0.22.7 的简单 `src/mcp/http-transport.ts` 路径仍编译以兼容旧调用方；v0.26+ 部署用 OAuth 感知的 `serve-http.ts`。

各客户端指南：[`docs/mcp/`](docs/mcp/DEPLOY.md)。加固默认、环境变量与威胁模型：[SECURITY.md](SECURITY.md)。

### 与 GStack 配合使用

若你的工程智能体运行在 [GStack](https://github.com/garrytan/gstack) 上，让 gbrain 做代码查找，替代 grep+read。Cathedral II（v0.21.0）提供调用图边与两阶段检索——智能体沿符号图行走而非逐行扫文件时，`/investigate`、`/review`、`/plan-eng-review`、`/office-hours` 均受益。

五个「魔法时刻」命令：

```bash
gbrain code-callers searchKeyword           # 谁调用此符号？
gbrain code-callees searchKeyword           # 此符号调用什么？
gbrain code-def BrainEngine                 # X 定义在哪？
gbrain code-refs BrainEngine                # 所有引用点
gbrain query "how does N+1 handling work" --near-symbol BrainEngine.searchKeyword --walk-depth 2
```

五个命令在非 TTY 上自动输出 JSON（gh-CLI 约定），GStack subagent 通过 bash 调用时可干净解析。运行 `gbrain sources add <repo> --strategy code` 索引仓库后，智能体的 brain-first 查找覆盖代码，不仅是 markdown。（[Cathedral II 发布说明](CHANGELOG.md#0210---2026-04-25)）

## 34 个技能

GBrain 随附 34 个技能，由 `skills/RESOLVER.md` 组织（或 OpenClaw 的 `AGENTS.md`——v0.19 起两种文件名均支持）。解析器告诉智能体任何任务该读哪个技能。v0.25.1 新增 9 个研究向技能（`book-mirror` 旗舰加 8 个配对）；见下方「研究与 synthesis」一节。

[技能文件即代码。](https://x.com/garrytan/status/2042925773300908103) 它们是完成知识工作最有力的方式。技能文件是编码整个工作流的 fat markdown：何时触发、检查什么、如何与其他技能链式、质量门槛。智能体读技能并执行。技能也可调用 GBrain 内 bund 的确定性 TypeScript（搜索、导入、嵌入、同步），不该交给 LLM 判断的部分。[薄 harness、胖技能](docs/ethos/THIN_HARNESS_FAT_SKILLS.md)：智能在技能里，不在运行时。

### 始终开启

| 技能 | 作用 |
|------|------|
| **signal-detector** | 每条消息触发。并行 spawn 廉价模型捕获原创思考与实体提及。大脑自动复利。 |
| **brain-ops** | 任何外部 API 前先查大脑。读-丰富-写循环，让每次回复更聪明。 |

### 内容摄入

| 技能 | 作用 |
|------|------|
| **ingest** | 薄路由。检测输入类型并委托给对应摄入技能。 |
| **idea-ingest** | 链接、文章、推文变 brain 页，含分析、作者 people 页与交叉链接。 |
| **media-ingest** | 视频、音频、PDF、书、截图、GitHub 仓库。转录、实体提取、反向链接传播。 |
| **meeting-ingestion** | 转录变 brain 页。每位与会者被丰富。每家公司有时间线条目。 |
| **voice-note-ingest** | 语音笔记逐字保留——精确措辞，从不 paraphrase。按内容路由到 originals/concepts/people/companies/ideas/personal/voice-notes。 |
| **article-enrichment** | 原始文章 dump 变结构化页：执行摘要、逐字引用、关键洞察、为何重要。 |

### 研究与 synthesis（v0.25.1）

| 技能 | 作用 |
|------|------|
| **book-mirror** | 旗舰。给智能体一本书，得到个性化双栏逐章分析。左栏保留章节实际内容；右栏用大脑里你的话把每个想法映射到生活。20 章书约 $6（Opus）。可与可信运行时 `gbrain book-mirror` CLI 配对。 |
| **strategic-reading** | 通过**单一**问题透镜读书/文章/案例。输出：应用 playbook（做/避免/留意）与短中长期建议。 |
| **concept-synthesis** | 将数千 concept stub 去重成分层 intellectual map（T1 Canon 到 T4 Riff）。追溯多年笔记中想法如何演化。 |
| **perplexity-research** | 大脑增强的 web 研究。把大脑上下文发给 Perplexity，聚焦**新** vs 已知。输出：Executive Summary + Key New Developments + Confirming Signals + Contradictions or Updates + Recommended Brain Updates + Citations。 |
| **archive-crawler** | 个人文件归档通用归档员（Dropbox / Backblaze / Gmail 导出 / 硬盘 dump）。除非 `gbrain.yml` 设置 `archive-crawler.scan_paths:` 否则**拒绝**运行。默认安全围栏。 |
| **academic-verify** | 追溯研究声明：发表 → 方法 → 原始数据 → 独立复现。经 perplexity-research；输出 verdict（verified / partial / unverifiable / misattributed / retracted）。 |
| **brain-pdf** | 经 gstack `make-pdf` 二进制将任意 brain 页渲染为出版级 PDF。剥离 frontmatter、 sanitize emoji、应用 running header。 |

### 大脑运维

| 技能 | 作用 |
|------|------|
| **enrich** | 分层丰富（Tier 1/2/3）。创建/更新 person/company 页，含 compiled truth 与时间线。 |
| **query** | 3 层搜索 + synthesis 与引用。说「大脑没有 X 的信息」而非 hallucinate。 |
| **maintain** | 定期健康：陈旧页、孤儿、死链、引用审计、反向链接强制、标签一致。v0.23 增加 dream cycle 的 synthesize + patterns 阶段——夜间对话转录变 reflections、originals 与 25 年模式。 |
| **citation-fixer** | 扫描缺失或格式错误的引用。修复为标准格式。 |
| **repo-architecture** | 新 brain 文件放哪。决策协议：主语决定目录，非格式。 |
| **publish** | 分享 brain 页为密码保护 HTML。零 LLM 调用。 |
| **data-research** | 参数化 YAML recipe 的结构化数据研究。从邮件提取 investor update、费用、公司指标。 |

### 运维

| 技能 | 作用 |
|------|------|
| **daily-task-manager** | 任务生命周期，优先级 P0-P3。存为可搜索 brain 页。 |
| **daily-task-prep** | 晨间准备：日历前瞻 + 每位与会者 brain 上下文、开放线程、任务回顾。 |
| **cron-scheduler** | 调度错峰（5 分钟偏移）、静默时段（时区感知 + 唤醒 override）、幂等。 |
| **reports** | 带时间戳报告与关键词路由。「最新 briefing 是什么？」即时找到。 |
| **cross-modal-review** | 第二模型质量门。拒绝路由：一模型拒绝则静默切换。 |
| **webhook-transforms** | 外部事件（SMS、会议、社交提及）转 brain 页并实体提取。 |
| **testing** | 验证每个技能有带 frontmatter 的 SKILL.md、manifest 覆盖、resolver 覆盖。 |
| **skill-creator** | 按 conformance 标准创建新技能。对现有技能做 MECE 检查。 |
| **skillify** | 「skillify it!」元技能。编排 10 步循环，让失败变 durable 技能：`gbrain skillify scaffold` 搭 stub，写真实逻辑，`gbrain skillify check` + `gbrain check-resolvable` 门禁。 |
| **skillpack-check** | 智能体可读的 gbrain 健康报告。CI 退出码；JSON 调试。Cron 友好。 |
| **smoke-test** | 8 项重启后健康检查 + 自动修复（Bun、CLI、DB、worker、Zod CJS、gateway、API key、brain repo）。用户测试放 `~/.gbrain/smoke-tests.d/*.sh`。 |
| **minion-orchestrator** | 单技能背景工作。Shell 任务经 `gbrain jobs submit shell`（运维/CLI，MCP 阻止受保护名）；LLM subagent 经 `gbrain agent run`。父子 DAG、`child_done` inbox、worker 重启后持久。 |

### 身份与设置

| 技能 | 作用 |
|------|------|
| **soul-audit** | 6 阶段访谈生成 SOUL.md（智能体身份）、USER.md（用户画像）、ACCESS_POLICY.md（4 层隐私）、HEARTBEAT.md（运维节奏）。 |
| **setup** | 自动配置 PGLite 或 Supabase。首次导入。GStack 检测。 |
| **migrate** | 从 Obsidian、Notion、Logseq、markdown、CSV、JSON、Roam 通用迁移。 |
| **briefing** | 每日 briefing：会议上下文、活跃 deal、引用跟踪。 |

### 约定

`skills/conventions/` 中的横切规则：
- **quality.md** … 引用、反向链接、notability 门、来源归属
- **brain-first.md** … 任何外部 API 前 5 步查找
- **model-routing.md** … 哪任务用哪模型
- **test-before-bulk.md** … 批量操作前先测 3-5 项
- **cross-modal.yaml** … 审查对与拒绝路由链

## 工作原理

```
信号到达（会议、邮件、推文、链接）
  -> 信号检测器并行捕获想法 + 实体（不阻塞）
  -> Brain-ops：先查大脑（gbrain search, gbrain get）
  -> 带完整上下文回复
  -> 写入：用新信息 + 引用更新 brain 页
  -> 自动链接：每次写入提取类型关系（零 LLM）
  -> 同步：gbrain 索引变更供下次查询
```

每轮增加知识。会议后智能体丰富 person 页。下次提到此人，已有上下文。差距日复复利。

系统自行变聪明。实体丰富自动升级：提及一次的人得 stub 页（Tier 3）。3 次跨源提及后 web + 社交丰富（Tier 2）。会议或 8+ 次提及后全 pipeline（Tier 1）。大脑学会谁重要，无需告知。确定性分类器经 fail-improve 循环随时间改进：记录每次 LLM fallback 并从失败生成更好 regex。`gbrain doctor` 显示轨迹：「intent 分类器：87% 确定性，第 1 周从 40% 上升。」

> 「30 分钟后我和 Jordan 的会议，帮我准备」
> … 拉 dossier、共同历史、近期活动、开放线程

> 「关于羞耻与创始人表现的关系，我说过什么？」
> … 搜**你的**思考，不是互联网

## Minions：sub-agent 不会再丢活

内置于 brain 的 durable、Postgres 原生任务队列。每个长跑智能体任务现在是 job：gateway 重启后仍存活、流式进度、可暂停/恢复/中途 steer、出现在 `gbrain jobs list`。除现有 brain 外零基础设施。

### 生产数字

个人 OpenClaw 部署：一个 Render 容器。Supabase Postgres 持 45,000 页 brain。19 个 cron 按计划触发。真实 gateway 负载。任务：从外部 API 拉一个月社交帖子并端到端 ingest 为结构化页。

|              | Minions   | `sessions_spawn`               |
|---           |---        |---                             |
| 墙钟时间     | **753ms** | **>10,000ms**（gateway 超时）   |
| Token 成本   | **$0.00** | 每次约 ~$0.03                  |
| 成功率       | **100%**  | **0%**（甚至无法 spawn）       |
| 内存/job     | ~2 MB     | ~80 MB                         |

19 个 cron 负载下，sub-agent spawn 过不了 10 秒 gateway 墙。Minions 不到一秒、零 token 完成。**规模：** 36 个月 19,240 帖，单 bash 循环，约 15 分钟，$0.00。Sub-agent：最好约 9 分钟，约 $1.08 token，约 40% spawn 失败。**实验室：** 耐久 ∞（SIGKILL 中途，10/10  rescued），吞吐约 10×，fan-out 约 21× 无失败墙，内存约 400× 更少。

完整基准：[gbrain-evals](https://github.com/garrytan/gbrain-evals/tree/main/docs/benchmarks)。

### 路由规则

> **确定性**（同输入 → 同步骤 → 同输出）→ **Minions**
> **判断**（输入需评估或决策）→ **Sub-agent**

拉帖子、解析 JSON、写 brain 页、跑 sync——确定性。$0 token、重启存活、毫秒级。分拣 inbox、评估会议优先级、冷邮件是否值得回——判断。Sub-agent 真正擅长的。`minion_mode: pain_triggered`（默认）自动路由。

### 修复了什么

六大日常痛点——spawn 风暴、无响应智能体、遗忘 dispatch、gateway 中途崩溃、失控孙任务、调试 soup——都属于「用推理模型做确定性工作」的错。Minions 不犯这错：`max_children` 上限、`timeout_ms` + AbortSignal、`child_done` inbox、完整 `parent_job_id`/`depth`/每 job 转录、Postgres 耐久 + stall 检测、递归 CTE 级联取消。还有幂等键、附件校验、`removeOnComplete`、`gbrain jobs smoke` 半秒证明安装。

```bash
gbrain jobs smoke                        # 验证安装
gbrain jobs submit sync --params '{}'    # 提交后台 job
gbrain jobs stats                        # 健康面板
gbrain jobs supervisor --concurrency 4   #  canonical：自动重启 worker（仅 Postgres）
gbrain jobs work --concurrency 4         # 裸 worker（无崩溃恢复——优先 supervisor）
```

`gbrain jobs supervisor` 用指数退避在崩溃后保活 worker、原子 PID 锁、结构化审计事件于 `~/.gbrain/audit/supervisor-*.jsonl`、`start --detach` / `status --json` / `stop` 供智能体调用。容器内作 PID 1；systemd 主机上是 `gbrain-worker.service` 子进程。完整部署：[`docs/guides/minions-deployment.md`](docs/guides/minions-deployment.md)。

读 [`skills/minion-orchestrator/SKILL.md`](skills/minion-orchestrator/SKILL.md) 了解父子 DAG、fan-in 收集、经 inbox steer。

**Minions 对后台工作不是比 sub-agent 好一点，是类别不同。** 753ms vs gateway 超时。$0 vs token。100% vs 无法 spawn。若智能体定时做确定性工作，现在跑 Minions。

### 健康检查与自愈

Minions 自 v0.11.1 为 canonical——每次 `gbrain upgrade` 自动跑迁移（schema → smoke → prefs → host 重写 → 环境感知 autopilot 安装）。若要手动验证或把 cron 接到晨间 briefing：

```bash
gbrain doctor                    # 半迁移？大声 banner + 非零退出
gbrain skillpack-check --quiet    # CI 门控退出 0/1/2
gbrain skillpack-check | jq       # 完整 JSON：{healthy, summary, actions[], doctor, migrations}
```

有问题时 `actions[]` 给出确切命令。更深排查：[`docs/guides/minions-fix.md`](docs/guides/minions-fix.md)。

把 gateway cron 迁到 Minions（确定性脚本、每次 fire 零 LLM token）：[`docs/guides/minions-shell-jobs.md`](docs/guides/minions-shell-jobs.md)。

## Durable agents：`gbrain agent`（v0.15）

Subagent 运行现在能扛崩溃。OpenClaw 中途挂？Worker 重启后 reclaim 并从最后 committed turn 重放。50 分片 fan-out，一片崩溃——aggregator 仍在所有子 job 终态后 claim 并写 mixed-outcome 摘要。工具调用两阶段账本（`pending` → `complete | failed`），replay 靠结构安全而非希望。

```bash
# 提交单 subagent 运行
gbrain agent run "summarize my last 10 journal pages"

# N 个 prompt fan-out 到 N 个子 subagent + 1 aggregator
gbrain agent run "analyze every page" \
  --fanout-manifest manifests/pages.json \
  --subagent-def analyzer

# 跟踪运行中 job（每 turn heartbeat + 完成时完整转录）
gbrain agent logs 1247 --follow --since 5m
```

耐久是重点：每个 Anthropic turn 提交到 `subagent_messages`，每个工具调用到 `subagent_tool_executions`。Worker kill、OpenClaw 崩溃、超时——均可恢复。Host repo（你的 OpenClaw 等）经 `GBRAIN_PLUGIN_PATH` + `gbrain.plugin.json` manifest 自带 subagent 定义：见 [`docs/guides/plugin-authors.md`](docs/guides/plugin-authors.md)。Worker 需 `ANTHROPIC_API_KEY`。

## Skillify：说「skillify it!」，bug 结构上无法复发

OpenClaw 遇到新失败。你在对话里修一次。你说「skillify it!」
修复永久化：带 trigger 的 SKILL.md、带测试的确定性脚本、智能体每日重评的路由 fixture、防止输出漂移的 filing audit。十项。每项必填。bug 无法复发。

Hermes 等框架在后台自动建技能。可以，直到你不知道智能体 shipped 什么。清单 decay。测试 drift。Resolver 条目 stale。半年后是不透明堆，没人读过、测过、不确定还能用。GBrain 同样能力，但人在环，每步是可跑命令。

### 四个动词（v0.19）

```bash
# 1. 一次 scaffold 新技能 5 个 stub 文件。
gbrain skillify scaffold webhook-verify \
  --description "verify ngrok webhooks" \
  --triggers "verify the webhook,check tunnel" \
  --writes-pages --writes-to people/,companies/

# 2. 用真实逻辑 + 测试替换 SKILLIFY_STUB 哨兵。
$EDITOR skills/webhook-verify/scripts/webhook-verify.mjs
$EDITOR test/webhook-verify.test.ts

# 3. 跑 10 项审计：SKILL.md、脚本、单元 + E2E、LLM eval、resolver、trigger eval、
#    check-resolvable 门、filing。
gbrain skillify check skills/webhook-verify/scripts/webhook-verify.mjs

# 4. 验证整棵树：可达性、MECE 重叠、DRY、路由缺口、filing audit、
#    SKILLIFY_STUB 哨兵（仍有则失败）。
gbrain check-resolvable              # 警告 advisory，错误 block
gbrain check-resolvable --strict     # 警告也 block（CI 可选）
```

幂等重跑。`--force` 再生 stub 但**从不**重复 resolver 行。Scaffold 不到 2 秒。真实工作（规则、脚本、测试）才是耗时；其余是 CLI 写的样板。

### `gbrain routing-eval` — 抓用户真实命中的路由缺口

任意技能旁放 `routing-eval.jsonl` fixture。每行 `{intent, expected_skill, ambiguous_with?}`。`gbrain check-resolvable` 默认跑结构层；`gbrain routing-eval` 作专用 CI 动词。`--llm` 为未来 LLM tie-break 占位；本版 stderr 提示并仅跑结构层。误匹配、未匹配、tautological fixture（intent 抄 trigger）均 surfaced 为具体 advisory 与 file:line。

### 在你的 OpenClaw 上工作，不限 gbrain 仓库

v0.19 让 `gbrain check-resolvable` 接受 `AGENTS.md` 与 `RESOLVER.md`，在 skills 目录或上一级（OpenClaw workspace 根布局）。缺 `manifest.json` 时从 `skills/*/SKILL.md` 遍历自动 derive。设 `OPENCLAW_WORKSPACE=~/your-openclaw/workspace` 即可：

```bash
export OPENCLAW_WORKSPACE=~/your-openclaw/workspace
gbrain check-resolvable --verbose
# 自动检测：workspace 根 AGENTS.md，107 技能从 SKILL.md  walk derive，
# 15 unreachable 错误，108 advisory 警告（重叠与缺口）。
```

真实 OpenClaw 首次运行：102 中 15 unreachable——约 15% 树是暗的。essay 里「智能体永远到不了的技能」footgun，现可见。

### `gbrain skillpack install` — 25 个 curated 技能装进 OpenClaw

gbrain 随附技能是 curated bundle。依赖闭包安装（共享 convention 一并）、每文件 diff 保护（本地编辑无 `--overwrite-local` 不覆盖）、文件锁串行并发安装、AGENTS.md 原子 managed-block 更新可见 gbrain 写了什么。

```bash
gbrain skillpack list                          # 25 curated 技能
gbrain skillpack install brain-ops             # 一技能 + 共享 convention
gbrain skillpack install --all                 # 完整 bundle
gbrain skillpack install brain-ops --dry-run   # 预览；不写
gbrain skillpack diff brain-ops                # bundle vs 本地
```

重跑安全。AGENTS.md managed-block  marker 让多次单技能 install 累积行而非互相覆盖。fence 内 receipt 注释（`<!-- gbrain:skillpack:manifest cumulative-slugs="..." -->`）跨 run 跟踪 gbrain 安装了什么。仅 `install --all` 会 prune；单技能 install 从不删未安装的。fence 内手加行 reinstall 保留，stderr 提示智能体调查。

**Skillify 让技能树扛住六个月复利。** 读 [`skills/skillify/SKILL.md`](skills/skillify/SKILL.md) 完整 10 项清单与反模式。

## 存储分层：bulk 内容不进 git（v0.22.11）

brain 超过 10 万文件、机器生成 bulk（推文、文章、转录）成 size 驱动时，声明哪些目录进 git、哪些仅 DB。

```yaml
# brain 仓库根 gbrain.yml
storage:
  db_tracked:
    - people/
    - companies/
    - deals/
  db_only:
    - media/x/
    - media/articles/
    - meetings/transcripts/
```

`gbrain sync` 自动管理 `db_only` 路径的 `.gitignore`。`gbrain export --restore-only --repo .` 从 DB 补缺失文件（容器重启、新 clone、误 rm）。`gbrain storage status` 显示 tier  breakdown。

完整指南：[docs/storage-tiering.md](docs/storage-tiering.md)。

## 数据接入

GBrain 随 integration recipe，智能体替你配置。每个 recipe 说明要什么凭据、如何验证、注册什么 cron。

| Recipe | 需要 | 作用 |
|--------|------|------|
| [Public Tunnel](recipes/ngrok-tunnel.md) | — | MCP + 语音固定 URL（ngrok Hobby $8/月） |
| [Credential Gateway](recipes/credential-gateway.md) | — | Gmail + Calendar |
| [Voice-to-Brain](recipes/twilio-voice-brain.md) | ngrok-tunnel | 电话变 brain 页（Twilio + OpenAI Realtime） |
| [Email-to-Brain](recipes/email-to-brain.md) | credential-gateway | Gmail 到实体页 |
| [X-to-Brain](recipes/x-to-brain.md) | — | Twitter 时间线 + 提及 + 删除 |
| [Calendar-to-Brain](recipes/calendar-to-brain.md) | credential-gateway | Google Calendar 到可搜索日页 |
| [Meeting Sync](recipes/meeting-sync.md) | — | Circleback 转录到 brain 页含与会者 |

**数据研究 recipe** 从邮件提取结构化数据到 tracked brain 页。内置 investor update（MRR、ARR、runway、headcount）、费用跟踪、公司指标。`gbrain research init` 自建。

运行 `gbrain integrations` 看状态。

## GBrain + GStack

[GStack](https://github.com/garrytan/gstack) 是引擎。GBrain 是 mod。

- **[GStack](https://github.com/garrytan/gstack)** = 编码技能（ship、review、QA、investigate、office-hours、retro）。70,000+ star，日活开发者 30,000+。智能体在自身上编码时用 GStack。
- **GBrain** = 其他一切技能（brain ops、信号检测、摄入、丰富、cron、报告、身份）。智能体记忆、思考、运维时用 GBrain。
- **`hosts/gbrain.ts`** = 桥。让 GStack 编码技能编码前先查 brain。

`gbrain init` 检测 GStack 是否安装并报告 mod 状态。没有则告知如何获取。

## 架构

```
┌──────────────────┐    ┌───────────────┐    ┌──────────────────┐
│   Brain Repo     │    │    GBrain     │    │    AI Agent      │
│   (git)          │    │  (retrieval)  │    │  (read/write)    │
│                  │    │               │    │                  │
│  markdown files  │───>│  Postgres +   │<──>│  29 skills       │
│  = source of     │    │  pgvector     │    │  define HOW to   │
│    truth         │    │               │    │  use the brain   │
│                  │<───│  hybrid       │    │                  │
│  human can       │    │  search       │    │  RESOLVER.md     │
│  always read     │    │  (vector +    │    │  routes intent   │
│  & edit          │    │   keyword +   │    │  to skill        │
│                  │    │   RRF)        │    │                  │
└──────────────────┘    └───────────────┘    └──────────────────┘
```

仓库是 system of record。GBrain 是检索层。智能体经两者读写。人类永远优先——编辑任意 markdown，`gbrain sync` 拾取变更。

## 知识模型

每页遵循 compiled truth + timeline 模式：

```markdown
---
type: concept
title: Do Things That Don't Scale
tags: [startups, growth, pg-essay]
---

Paul Graham's argument that startups should do unscalable things early on.
The key insight: the unscalable effort teaches you what users actually
want, which you can't learn any other way.

---

- 2013-07-01: Published on paulgraham.com
- 2024-11-15: Referenced in batch W25 kickoff talk
```

`---` 之上：**compiled truth**。当前最佳理解。新证据改变图景时重写。之下：**timeline**。仅追加证据链。只增不改。

## 知识图谱

页面不只是文本。对人、公司、概念的每次提及成为结构化图中的类型化链接。大脑自我连线。

```
写提及 Alice 与 Acme AI 的会议页
  -> 自动链接从内容提取实体 ref（零 LLM）
  -> 推断类型：会议页 + person ref => `attended`
                   「X 的 CEO」模式        => `works_at`
                   「invested in」         => `invested_in`
                   「advises」「advisor」  => `advises`
                   「founded」「co-founded」=> `founded`
  -> 协调 stale 链接：编辑移除内容中不再存在的链接
  -> 反向链接让连接良好的实体在搜索中排名更高
```

```bash
gbrain graph-query people/alice --type attended --depth 2
# 返回 Alice 见过谁（传递闭包）
```

图谱回答向量搜索不能答的：「谁在 Acme AI 工作？」「Bob 投了什么？」「Alice 与 Carol 的连接？」。一条命令回填现有 brain：

```bash
gbrain extract links --source db        # 连线现有 29K 页
gbrain extract timeline --source db     # 从 markdown timeline 提取 dated 事件
```

然后问图谱问题或看搜索排名改善。与 ripgrep-BM25、纯向量 RAG（同 embedder）、关闭图谱的 gbrain 并排：240 页 Opus 富文本语料上 **P@5 49.1%、R@5 97.9%**，比 hybrid-nograph **P@5 +31.4 点**。隔离贡献：v0.11→v0.12 同代码库同输入 P@5 22.1% → 49.1%，类型化链接提取质量 load-bearing。完整记分卡与可复现语料：[gbrain-evals](https://github.com/garrytan/gbrain-evals)。

## 搜索

混合搜索：向量 + 关键词 + RRF 融合 + 多查询扩展 + 4 层 dedup。

```
Query
  -> Intent 分类器（entity? temporal? event? general?）
  -> 多查询扩展（Claude Haiku）
  -> 向量搜索（HNSW cosine）+ 关键词（tsvector）
  -> RRF 融合：score = sum(1/(60 + rank))
  -> Cosine 重打分 + compiled truth boost
  -> 4 层 dedup + compiled truth 保证
  -> Results
```

仅关键词漏概念匹配。仅向量漏精确短语。RRF 两者兼得。搜索质量可基准、可复现：`gbrain eval --qrels queries.json` 测 P@k、Recall@k、MRR、nDCG@k。部署前 A/B 测配置变更。

## 为何有效：多策略协同

大脑不是一招鲜。每个检索问题经约 20 种确定性技术分层叠加。单点不 magic；赢在各层互补。

```
Question
  │
  ├─ INGESTION（每次 put_page）
  │    ├─ 递归 markdown 分块（或 semantic / LLM-guided）
  │    ├─ 编辑时 embedding 缓存失效
  │    └─ 幂等导入（content-hash dedup）
  │
  ├─ GRAPH EXTRACTION（auto-link 后置，零 LLM）
  │    ├─ 实体 ref regex（markdown 链接 + bare slug）
  │    ├─ 代码 fence 剥离（代码块内无假阳性 slug）
  │    ├─ 类型推断级联（FOUNDED → INVESTED → ADVISES → WORKS_AT）
  │    ├─ 页面角色先验（partner-bio 语言 → invested_in）
  │    ├─ 页内 dedup（同 target 坍缩为一链接）
  │    ├─ Stale 链接协调（编辑移除 dropped ref）
  │    └─ 多类型链接约束（同一人可 works_at 且 advises）
  │
  ├─ SEARCH PIPELINE（每次 query）
  │    ├─ Intent 分类器（entity / temporal / event / general — 自动路由）
  │    ├─ 多查询扩展（Haiku 改述问题 3 种）
  │    ├─ 向量搜索（OpenAI embedding 上 HNSW cosine）
  │    ├─ 关键词（Postgres tsvector + websearch_to_tsquery）
  │    ├─ Source-aware 排序（curated 目录 SQL 层 outrank chat/daily swamp）
  │    ├─ Hard-exclude（test/ archive/ attachments/ .raw/ 检索前过滤）
  │    ├─ Reciprocal Rank Fusion（score = sum 1/(60+rank) 跨两者）
  │    ├─ Cosine 重打分（chunk 对实际 query embedding 重排）
  │    ├─ Compiled-truth boost（assessment outrank timeline 噪声）
  │    ├─ Backlink boost（连接良好实体排名更高）
  │    └─ Source-aware dedup（每页保证一 CT chunk）
  │
  ├─ GRAPH TRAVERSAL（关系查询）
  │    ├─ 带环Prevent 的递归 CTE（visited-array 检查）
  │    ├─ 类型过滤边（--type works_at, attended 等）
  │    ├─ 方向控制（in / out / both）
  │    └─ 深度上限（远程 MCP ≤10；DoS 防护）
  │
  └─ AGENT WORKFLOW（图谱 confident hybrid）
       ├─ 图谱 query 优先（高精度类型答案）
       ├─ 图谱空则 grep fallback
       └─ 图谱命中在 top-K 优先（更好 P@K 与 R@K）
```

BrainBench v1 语料端到端（240 富文本页，PR #188 前后）：

| 指标                  | PR #188 前 | PR #188 后 | Δ           |
|-------------------------|------------|------------|-------------|
| **Precision@5**         | 39.2%      | **44.7%**  | **+5.4 pts**|
| **Recall@5**            | 83.1%      | **94.6%**  | **+11.5 pts**|
| Top-5 正确              | 217        | 247        | **+30**     |
| 仅图谱 F1（消融）       | 57.8%（grep）| **86.6%** | **+28.8 pts**|

另 5 项正交能力检查（身份解析、时间查询、10K 页规模性能、畸形输入鲁棒性、MCP 操作契约）。均通过。完整报告：[gbrain-evals](https://github.com/garrytan/gbrain-evals)。

要点：每种技术处理其他遗漏的输入类。向量漏精确 slug ref；关键词抓住。关键词漏概念；向量抓住。RRF 取两者最佳。Compiled-truth boost 让 assessment 高于 timeline 噪声。Auto-link 连线图谱，backlink boost 抬高连接良好实体。图谱遍历答搜索 alone 不能答的。智能体 precision 图谱优先、recall keyword fallback。**全确定性、全协同、全可测。**

## 语音

拨电话号码。AI 接听。知道谁打来，从 brain 拉完整上下文，像真懂你的世界的人一样回应。通话结束出现 brain 页：转录、实体检测、交叉引用。

<p align="center">
  <img src="docs/images/voice-client.png" alt="Voice client connected" width="300" />
</p>

> [看视频](https://x.com/garrytan/status/2043022208512172263)

语音 recipe 随 GBrain 发货：[Voice-to-Brain](recipes/twilio-voice-brain.md)。WebRTC 浏览器标签零配置。真实号码可选。

## 引擎架构

```
CLI / MCP Server
     （薄包装，相同 operations）
              |
      BrainEngine interface（可插拔）
              |
     +--------+--------+
     |                  |
PGLiteEngine       PostgresEngine
  （默认）          （Supabase）
     |                  |
~/.gbrain/           Supabase Pro（$25/月）
brain.pglite         Postgres + pgvector
embedded PG 17.5

     gbrain migrate --to supabase|pglite
         （双向迁移）
```

PGLite：嵌入式 Postgres，无服务器，零配置。brain 长大（1000+ 文件、多设备）时 `gbrain migrate --to supabase` 迁移一切。

## 文件存储

Brain repo 会积累二进制。GBrain 三阶段迁移：

```bash
gbrain files mirror <dir>       # 复制到云，本地不动
gbrain files redirect <dir>     # 本地换 .redirect 指针
gbrain files clean <dir>        # 删指针，仅云
gbrain files restore <dir>      # 全量下载（撤销）
```

存储后端：S3 兼容（AWS、R2、MinIO）、Supabase Storage 或本地。

## 命令

```
SETUP
  gbrain init [--supabase|--url]        创建 brain（默认 PGLite）
  gbrain migrate --to supabase|pglite   双向引擎迁移
  gbrain upgrade                        自更新 + 功能发现

PAGES
  gbrain get <slug>                     读页（模糊 slug 匹配）
  gbrain put <slug> [< file.md]         写/更新（自动版本）
  gbrain delete <slug>                  删页
  gbrain list [--type T] [--tag T]      列表过滤

SEARCH
  gbrain search <query>                 关键词（tsvector）
  gbrain query <question>              混合（向量 + 关键词 + RRF）

IMPORT
  gbrain import <dir> [--no-embed] [--workers N]
                                        导入 markdown（幂等）
  gbrain sync [--repo <path>] [--workers N]
                                        Git 到 brain 增量同步
                                        （>100 文件 diff Postgres 自动 4 worker 并行）
  gbrain export [--dir ./out/]          导出 markdown

FILES
  gbrain files list|upload|sync|verify  文件存储操作

EMBEDDINGS
  gbrain embed [<slug>|--all|--stale]   生成/刷新 embedding

LINKS + GRAPH
  gbrain link|unlink|backlinks          交叉引用管理
  gbrain extract links|timeline|all     从现有页批量回填
                                        （--source db|fs, --type, --since, --dry-run）
  gbrain graph-query <slug>             类型遍历（--type T --depth N
                                        --direction in|out|both）

JOBS（Minions）
  gbrain jobs submit <name> [--params JSON] [--follow]  提交后台 job
  gbrain jobs list [--status S] [--queue Q]             列表过滤
  gbrain jobs get|cancel|retry|delete <id>              生命周期
  gbrain jobs prune [--older-than 30d]                  清理完成/dead job
  gbrain jobs stats                                     健康面板
  gbrain jobs smoke                                     一键健康检查
  gbrain jobs work [--queue Q] [--concurrency N]        启动 worker 守护

SKILLS（v0.19）
  gbrain skillify scaffold <name>       创建 5 stub + 幂等 resolver 行
  gbrain skillify check [path]          10 项技能审计
  gbrain skillpack list                 打印 bundle 中 25 curated 技能
  gbrain skillpack install <name>       复制一技能 + 共享 convention 到目标
  gbrain skillpack install --all        安装完整 curated bundle
  gbrain skillpack diff <name>          每文件 diff：bundle vs 目标 workspace
  gbrain check-resolvable [--strict]    Resolver 审计（可达性、MECE、DRY、路由、filing、
                                        SKILLIFY_STUB）。接受 RESOLVER.md 或 AGENTS.md。
  gbrain routing-eval [--llm] [--json]  fixture 上 intent→skill 路由准确度

ADMIN
  gbrain doctor [--json] [--fast]       健康检查（resolver、skills、DB、embedding）
  gbrain doctor --fix [--dry-run]       自动修复 DRY 违规（内联规则委托到 convention）
  gbrain doctor --locks                 列出 idle-in-tx backend（57014 诊断，仅 Postgres）
  gbrain stats                          Brain 统计
  gbrain serve                          MCP 服务器（stdio）
  gbrain serve --http [--port 3131]     HTTP MCP + OAuth 2.1 + 管理面板
                                        [--token-ttl 3600] [--enable-dcr]
                                        [--public-url URL] [--log-full-params]
  gbrain auth create|list|revoke|test   旧版 bearer token 管理
  gbrain auth register-client <name>    注册 OAuth 2.1 客户端
        --grant-types client_credentials,authorization_code
        --scopes "read write admin"
  gbrain auth revoke-client <client_id> 撤销 OAuth 2.1 客户端（FK CASCADE  purge
                                        活跃 token + auth code）
  # OAuth 2.1 客户端也可从 /admin 面板或 oauthProvider.registerClientManual() 注册。
  gbrain integrations                   Integration recipe 面板
  gbrain sources list|add|remove|...    多源 brain 管理（v0.18）
  gbrain dream [--dry-run] [--phase N]  8 阶段维护循环（lint→backlinks→sync→synthesize
                                        →extract→patterns→embed→orphans）。v0.23 增 synthesize +
                                        patterns：转录 → reflections + 跨会话主题。
  gbrain dream --input <file>           临时转录 synthesis（隐含 --phase synthesize）
  gbrain dream --date YYYY-MM-DD        单日 synthesis；--from/--to 回填范围
  gbrain check-backlinks check|fix      反向链接强制
  gbrain lint [--fix]                   LLM artifact 检测
  gbrain repair-jsonb [--dry-run]       修复 v0.12.0 双编码 JSONB（Postgres）
  gbrain orphans [--json] [--count]     零入站 wikilink 的页
  gbrain transcribe <audio>             转录音频（Groq Whisper）
  gbrain research init <name>           Scaffold 数据研究 recipe
  gbrain research list                  可用 recipe
```

运行 `gbrain --help` 看完整参考。

## 起源

我在配置 [OpenClaw](https://openclaw.ai) 智能体时开了 markdown brain repo。每人一页、每公司一页，上 compiled truth、下 timeline。一周内：10,000+ 文件、3,000+ 人、13 年日历、280+ 会议转录、300+ 捕获想法。

智能体在我睡觉时运行。Dream cycle 扫描每次对话、丰富缺失实体、修 broken 引用、整合记忆。我醒来大脑比睡前更聪明。

本仓库技能是这些模式的泛化。手建 11 天的东西，作为 30 分钟安装的 mod 发货。

## 文档

**给智能体：**
- **[skills/RESOLVER.md](skills/RESOLVER.md)** … 从这里开始。技能分发器。
- [各技能文件](skills/) … 28 套独立说明（curated `gbrain skillpack install` bundle 含 25 个）
- [GBRAIN_SKILLPACK.md](docs/GBRAIN_SKILLPACK.md) … 旧版参考架构
- [Getting Data In](docs/integrations/README.md) … Integration recipe 与数据流
- [GBRAIN_VERIFY.md](docs/GBRAIN_VERIFY.md) … 安装验证

**给人：**
- [GBRAIN_RECOMMENDED_SCHEMA.md](docs/GBRAIN_RECOMMENDED_SCHEMA.md) … Brain repo 目录结构
- [Thin Harness, Fat Skills](docs/ethos/THIN_HARNESS_FAT_SKILLS.md) … 架构哲学
- [ENGINES.md](docs/ENGINES.md) … 可插拔引擎接口

**参考：**
- [GBRAIN_V0.md](docs/GBRAIN_V0.md) … 完整产品 spec
- [CHANGELOG.md](CHANGELOG.md) … 版本历史

**基准：**
- [gbrain-evals](https://github.com/garrytan/gbrain-evals) … BrainBench，兄弟仓库：eval harness、语料、记分卡、4-adapter 对比。依赖 gbrain；不与 gbrain 一并安装。

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。`bun run test` 跑并行单元测试快循环（Mac 开发机约 85s，3700+ 测试）或 `bun run verify` 作 push 前门（privacy + jsonb + progress + test-isolation + wasm + admin-build + typecheck）。完整本地 CI 门（gitleaks + unit + Docker 内 29 个 E2E，与 GH Actions 相同）用 `bun run ci:local` … 或聚焦分支迭代用 `bun run ci:local:diff`。

若做检索或 search/embedding/ranking 表面，在 shell rc 设 `GBRAIN_CONTRIBUTOR_MODE=1`，用 `gbrain eval replay` 对真实捕获 query 快照门控变更——dev loop 见 [`docs/eval-bench.md`](docs/eval-bench.md)。捕获对生产用户**默认关**（无意外数据积累）；env var 是贡献者 opt-in。

欢迎 PR：新 enrichment API、性能优化、额外引擎后端、按 `skills/skill-creator/SKILL.md` conformance 的新技能。

## 许可证

MIT
