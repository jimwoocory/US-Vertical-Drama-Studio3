# US Vertical Drama Studio 3 Lite

**中文快速说明｜方案 B：中式爽剧节奏 + 美式竖屏故事逻辑（V0.2.0）**

本仓库是独立的 **ChatGPT / Codex Skills 插件源码**，用于把简短创意或获授权的故事整理成美国社会逻辑可信、冲突强烈、英文对白可表演的短剧草稿。它**不是**视频生成软件、独立网页平台，也**不代表**插件已经安装到你的 ChatGPT 或 Codex 账号。

**三个项目的区别：** 旧 **USVDS V11** 是复杂的多阶段生产方法论；**USVDS2** 是独立 TypeScript 平台重构；**USVDS3 Lite** 是本仓库的轻量写作插件，三者不共用发布版本，也不会在本仓库修改旧项目。

**一次创作入口：** 用户写一句故事想法 → `STORY_AND_EPISODES` 内部先完成有开端、发展、结局的完整故事，再输出分集地图。作者可以指定前三集必有或禁止的情节；**没有指定时不能凭空编造作者要求**。重大角色选择必须把观众需要知道的目标、动机、得失和代价安排在选择发生前或当下；第一至第三集均须有明确冲突、反转和局部回报。后续英文剧本、导演交接只在用户明确要求时进入。

**已验证：** Node 结构和反例校验、原创测试数据、repo 本地 marketplace 可被隔离 Codex 环境发现、发行 ZIP 内容结构。**未验证：** 用户账号实际安装、真实视频生成、可信人工批准；所有产物仍为 `DRAFT_ONLY`，制作审批仍为 `BLOCKED`。

---

USVDS3 Lite is a repository-local writing Skills plugin for Chinese fast-payoff drama adapted to plausible US settings and performable English dialogue. Release source: **0.2.0**. It produces reviewable text drafts; no app UI, media provider, rendering or production approval is included.

## Keep the projects distinct

| Project | Role | Boundary |
|---|---|---|
| V11 | Earlier broad multi-stage Skills workflow. | Separate project; this repository does not replace or modify it. |
| Studio2 | Separate TypeScript application/rewrite project: [US-Vertical-Drama-Studio2](https://github.com/jimwoocory/US-Vertical-Drama-Studio2). | Not this lightweight plugin. |
| Studio3 Lite | This independent authoring plugin and offline artifact checker: [US-Vertical-Drama-Studio3](https://github.com/jimwoocory/US-Vertical-Drama-Studio3). | No application, renderer, providers, or production system. |

## Workflows

Six focused Skills route one requested scope: `IDEA`, `ADAPT_SOURCE`, `STORY_ONLY`, `STORY_AND_EPISODES`, `SCRIPT_ONLY`, `SCRIPT_REVIEW`, `DIRECTOR_HANDOFF`, or `PROMPT_ONLY`. Chinese is used for author-facing outline and stage direction; dialogue is natural, performable English. The workflow distinguishes on-camera dialogue, OS (internal voice) and VS (off-frame voice).

`STORY_ONLY` ends after a full beginning-to-end story. `STORY_AND_EPISODES` is one user step: finish the story, record canon revision/digest and provenance, then map episodes. It preserves any EP01–EP03 author locks supplied by the author, without inventing absent constraints. Every major choice gets an audience-knowledge beat at or before the choice with actor, goal, motive, cost and both tradeoffs. Front-three episodes carry major hooks, payoffs and reversals. Human review decides whether those beats actually work.

An original, synthetic fictional small-town hotel example is provided in [the six-episode JSON](examples/cedar-inn-project.json) and [screenplay/director handoff](examples/cedar-inn-handoff.md). Its EP01–EP03 locks are explicitly fictional illustrative user requirements, not real author instructions. The older minimal structural fixture remains at [synthetic-project.json](examples/synthetic-project.json) and has no audience knowledge nodes.

For authorized source adaptation, record the user's supplied rights basis, exact scope and provenance. L0 transfers directly; L1 is a minimal functional equivalent; L2 and canon changes require an author decision proposal. The workflow cannot verify rights. No user script, real person, credential or outside media is bundled.

## Install and use

The source includes portable root `plugin.json` and compatibility `.codex-plugin/plugin.json`. The intended repo-scoped marketplace manifest is `.agents/plugins/marketplace.json`, with local source `./`, marketplace `usvds3-dev`, policy `AVAILABLE` / `ON_INSTALL`, category `Creative`. A marketplace makes the source discoverable; it does not mean the plugin was installed or enabled. The user must choose install in the supported host if desired. This release is **source-only**; no installer is run by build or verification.

Use the Skills from a compatible ChatGPT/Codex host after explicit installation, or open the relevant `skills/*/SKILL.md` and follow its workflow. Host installation/loading has not been executed or claimed here. No user-level `~/.codex` files, hooks or MCP configuration are changed.

## Offline commands

Requires Node.js 22 or newer; there are no package dependencies and these commands need no network.

```powershell
npm test
npm run check:example
npm run check:story
npm run verify:package
npm run verify
npm run build:zip
```

`verify` runs tests, both passing examples and package checks. `build:zip` writes an ignored `dist/` release archive with manifests, skills, linked docs, `package.json`, the offline checker and test fixtures, so the README npm validation commands work after unzip. To inspect a deliberate negative fixture, run `node tools/checkup.mjs test/fixtures/invalid-approval.json`; a nonzero result is expected.

## Validation limits

The checker validates JSON shape, stable IDs/references, story digest, declared episode beat order, EP01–EP03 lock mapping, major-decision knowledge references/chronology (including knowledge from an earlier episode), and matching scene `beatEvidence` structure (`ACTION`, `DIALOGUE`, or `ON_SCREEN_TEXT` plus non-empty depiction). This is structural only: it does **not** interpret depictions or infer missing major choices, judge whether evidence truly informs viewers, assess meaningful tradeoffs, US plausibility, legal/rights status, natural English, acting quality or media. Those require human semantic review. The artifact remains `DRAFT_ONLY`; `productionApproval` stays `BLOCKED` (ND-001) and `mediaExecuted` stays false.

License: **TBD**. Repository availability does not grant rights to source works.
