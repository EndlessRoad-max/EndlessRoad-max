# 你好，我是 EndlessRoad-max

专注全栈开发，正在学习与实践 AI Agent。

我关注从页面交互、服务端逻辑到数据存储的完整开发过程，也喜欢追问技术背后的原理。在个人网站里，我记录学习笔记、问题的验证过程，以及实践中的思考。

[个人网站](https://endlessroad-max.github.io/) · [技术笔记](https://endlessroad-max.github.io/notes/)

## 技术方向

- **后端**：Java、Spring Boot、MyBatis、MySQL
- **前端**：HTML、CSS、JavaScript、Vue
- **缓存与消息**：Redis、RabbitMQ
- **Agent 学习与实践**：Python、模型 API、工具调用、会话管理、MCP

## 最近关注

- 前端交互、组件组织与前后端协作。
- Java 并发、数据库事务、缓存一致性与消息幂等。
- Agent 执行流程、上下文管理与异常处理。

## 公开贡献

<!-- contributions:start -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/contributions-dark.svg?v=b11a6110d955">
  <img src="assets/contributions.svg?v=b11a6110d955" alt="开源贡献：2 个 PR 已合并，参与 4 个仓库，3 个 PR 待合并" width="720">
</picture>

- [vercel-labs/skills #2768](https://github.com/vercel-labs/skills/pull/2768) — 已合并
  fix(api): preserve duplicate validation when renaming skills
- [vercel-labs/skills #2801](https://github.com/vercel-labs/skills/pull/2801) — 已合并
  fix(remove): preserve project skills during global removal
- [langgenius/dify #46869](https://github.com/langgenius/dify/pull/46869) — 待合并
  fix(agent-sdk): normalize tool results in event pages
- [langflow-ai/langflow #16524](https://github.com/langflow-ai/langflow/pull/16524) — 待合并
  fix(sdk): preserve session IDs in V1 run requests
- [langgenius/dify #46655](https://github.com/langgenius/dify/pull/46655) — 已关闭，未合并
  fix(dify-agent): honor stop conditions between buffered SSE events

<!-- contributions:end -->

### 已合并的修复

- **Skills · 全局删除的作用域隔离**：[PR #2801](https://github.com/vercel-labs/skills/pull/2801)。修复全局卸载技能时误删项目目录中同名技能的问题，在删除前按安装作用域筛选目标，并验证项目文件与锁文件得到保留。[维护者审阅](https://github.com/vercel-labs/skills/pull/2801#pullrequestreview-6083509004)。
- **Skills · 重命名后的重复校验**：[PR #2768](https://github.com/vercel-labs/skills/pull/2768)。区分技能的来源名称与安装别名，避免重命名绕过重复检查，或让唯一技能被错误拒绝。[维护者审阅](https://github.com/vercel-labs/skills/pull/2768#pullrequestreview-6083544619)。

两项均于 **2026-11-27** 由维护者 **antfu** 批准并合并；回归测试、类型检查、构建和端到端测试已通过。

### 已结束的缺陷跟进

- **Dify Agent SDK · SSE 取消与超时边界**：报告 [Issue #46654](https://github.com/langgenius/dify/issues/46654)，并提交初始修复 [PR #46655](https://github.com/langgenius/dify/pull/46655)。问题已于 2026-11-20 通过其他贡献者的 [PR #46733](https://github.com/langgenius/dify/pull/46733) 合并解决，Issue 已关闭；我的原 PR 以重复项关闭，未合并。
