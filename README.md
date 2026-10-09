# US Vertical Drama Studio 3 Lite（USVDS3 Lite）

**一句话：把中式爽剧的快节奏与强回报，轻量改编成美国社会逻辑可信、英语自然可演的竖屏剧草稿。**

> 先看清项目：V11、Studio2、Studio3 是三个不同项目；本仓库只对应 Studio3 Lite。

| 项目 | 它是什么 | 与本仓库的关系 |
|---|---|---|
| **V11** | 旧版、丰富的多阶段 Skills 流程，覆盖故事、分集、剧本、导演及制作交接。 | **保留原样，不在此仓库修改或替代。** |
| **Studio2** | [US-Vertical-Drama-Studio2](https://github.com/jimwoocory/US-Vertical-Drama-Studio2)：TypeScript 全平台重写项目。 | **独立平台项目，不是 Lite 插件；这里不推测或声称它的已安装插件标识。** |
| **Studio3** | [US-Vertical-Drama-Studio3](https://github.com/jimwoocory/US-Vertical-Drama-Studio3)：本仓库的 Studio3 Lite。方案 B：把中式爽剧节奏适配到可信的美国人物、关系和社会环境。 | **插件 ID：`us-vertical-drama-studio3-lite`；版本 `0.1.0`；所有产物均为 `DRAFT_ONLY`。** |

## Studio3 Lite 做什么

- 采用最小 **L0/L1/L2** 改编：L0 原逻辑可成立时直接迁移；L1 优先保留情绪承诺、因果选择与回报，只调整必要的制度、资源、职业、家庭关系或道具；涉及核心设定变化的 L2 必须先作为提案交作者决定。
- 一次用户步骤可以规划**完整故事，再生成分集地图**；在规划前登记作者对 **EP01–EP03** 的关键剧情锁定，并保留可追溯引用和独立审查意见。
- 剧本目标是自然、可表演的英语对白；声音标记区分 **OS（角色内心独白）**与 **VS（画外声音）**，并与画面内对白分开。
- 提供轻量导演交接，整理可见动作、镜头/段落及文字视频提示词。另附离线结构检查器。
- **不提供应用 UI 或视频渲染**：不生成视频、不调用模型，也不自动执行后期制作。

## 适用边界

- 这是写作与交接草稿工作流，不是制作系统。内容和审查意见仅供作者判断；即使作者接受某个故事提案，也不代表制作审批。`productionApproval` 固定为 `BLOCKED`，关联 **ND-001**：可信审批运行时尚不可用。
- 使用他人来源前，用户必须拥有适用于目标改编的权利或许可，并明确授权范围；工作流记录用户声明的权利依据和来源，不提供法律判断，也不会验证权利真伪。请勿提交未获授权的材料。
- 导演交接可整理表演、调度和剪辑节奏。若改动剧情选择、揭示或结局，应回到作者审批流程。
- 检查器只检查 JSON 结构、引用关系及明确约束；它不能判断美国社会逻辑、英语自然度、表演质量、来源权利，也不能证明任何视频已生成或质量合格。仍须人工审阅。
- 仓库不包含真实来源剧本、媒体、私人资料、授权文件或生成媒体；跨项目素材需有明确许可来源。

## 快速开始

本仓库提供插件源文件，不代表已经安装到 ChatGPT 应用或其他宿主。请使用兼容 Agent Skills 的宿主按其支持的流程加载；当前没有声称已安装 ChatGPT 应用插件。也可以在支持 Skills 的会话中引用 `skills/*/SKILL.md`。

可参考以下中文指令，每次提交一个任务：

1. **授权来源改编：**“ADAPT_SOURCE。我拥有所附短篇的改编权，只授权使用我提供的梗概。保留女主公开反转和最终和解；先列 L0/L1 场景映射，把需要 L2 的改动单独列出供我决定。”
2. **完整故事加分集：**“STORY_AND_EPISODES。先记录我的 EP01–EP03 锁定要求：EP01 她拒绝篡改值班记录；EP02 主管当众归咎于她；EP03 她拿出带时间戳的门卡记录。然后先规划完整故事，再生成 8 集分集地图，并提供可追溯编号和独立审查意见。”
3. **剧本交导演：**“DIRECTOR_HANDOFF。把我提供的草稿整理为因果清晰、可见可拍的动作，以及每段一条英文视频提示词。保留剧情与设定；任何设定变更另列作者提案。标明对白、OS、VS、音效和后期责任；不要生成媒体。”

第二条中的酒店前台情节是虚构示例。请替换为原创构思或已获授权的素材。

## 离线检查

需要 Node.js 22 或更新版本；无需安装依赖，无需网络访问。

```sh
npm test
npm run check:example
node tools/checkup.mjs test/fixtures/invalid-approval.json
```

最后一条是故意设置的无效审批负例，应以非零状态退出并报告问题代码。检查器是结构契约检查工具，不是执行引擎，也不代替人工评估剧情可信度、英语或来源权利。`ADAPT_SOURCE` 的来源引用只核对声明的 ID 和授权范围，不验证法律权利。

故事摘要是 UTF-8 稳定 JSON 的小写 SHA-256：递归排序对象键、保持数组顺序，仅从 story 对象顶层排除 `digest`。摘要只能检测内容是否相对摘要发生变化，不能证明作者身份、来源或权利。示例将此规则锁定为 schema version 1，并提供已计算的摘要。

Codex 兼容清单中的 `skills: "./skills/"` 相对于插件根目录解析，因此保留该路径。实际宿主安装/加载尚未测试。

## English summary

USVDS3 Lite is a draft-only, offline-checkable light adaptation workflow. It targets Chinese-style fast payoffs in credible US settings, with natural English dialogue, EP01–03 author locks, OS/VS distinctions, and a lightweight director handoff. It has no app UI, model calls, or video rendering.

## 许可与来源权利

License: **TBD**. Public availability does not grant unlimited reuse. Confirm rights for source works and review repository licensing before redistributing contributions.
