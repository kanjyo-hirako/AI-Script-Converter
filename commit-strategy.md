# Commit 策略 — 3天 MVP

## 原则

- 每个 commit 可独立编译、运行，不留半成品
- commit message 使用中文，格式：`类型: 简述`
- 类型约定：`feat`（功能）、`fix`（修复）、`chore`（工程配置）、`refactor`（重构）、`style`（样式）、`docs`（文档）

---

## Day 1：项目搭建 + 核心功能

### 已完成

- [x] `chore: 初始化项目骨架（Vite + Vue 3 + Express + Tailwind）`

### 上午

- [ ] `feat: 实现 SettingsPanel 组件（API Key、模型选择、自定义 URL）`
- [ ] `feat: 实现 useSettings composable（localStorage 持久化配置）`
- [ ] `feat: 实现 NovelInput 组件（文本粘贴 + 文件上传 + 字数统计）`
- [ ] `feat: 实现 fileParser（支持 .txt 和 .docx 解析）`

### 下午

- [ ] `feat: 实现 chapterSplitter 分章算法（正则匹配中文章节标题）`
- [ ] `feat: 实现 ChapterSplitter 组件（章节列表展示 + 预览）`
- [ ] `feat: 实现后端 /api/convert 路由（AI 调用 + JSON 解析）`
- [ ] `chore: 补充错误处理和请求校验`

---

## Day 2：剧本展示 + 编辑

### 上午

- [ ] `feat: 集成 Monaco Editor（YAML 语法高亮 + 代码折叠）`
- [ ] `feat: 实现 YamlEditor 组件（双向绑定 + 只读/编辑模式切换）`
- [ ] `feat: 实现 ScreenplayViewer 组件（转换状态 + 导出 .yaml 文件）`

### 下午

- [ ] `feat: 实现 CharacterPanel 组件（角色列表 + YAML 位置高亮）`
- [ ] `feat: 实现 SceneNavigator 组件（场景列表 + 跳转定位）`
- [ ] `refactor: 整合 App.vue 三栏布局（导航 + 主工作区 + 侧边栏）`

---

## Day 3：联调 + 优化 + 测试

### 上午

- [ ] `feat: 实现 useConversion composable（逐章调用 + 进度追踪 + 错误重试）`
- [ ] `feat: 实现 YAML Schema 校验（yaml 解析 + ajv 校验）`
- [ ] `chore: 配置 Vite 开发代理，完成前后端联调`
- [ ] `test: 端到端测试（5000字小说 → 分章 → 生成 → 编辑 → 导出）`

### 下午

- [ ] `fix: 完善错误处理（API Key 无效、网络超时、格式异常）`
- [ ] `style: Tailwind 样式美化 + Loading 动画 + 响应式适配`
- [ ] `docs: 编写 schema-spec.md（YAML Schema 定义 + 示例）`
- [ ] `docs: 编写 README.md（项目介绍 + 快速开始 + 模型列表）`

---

## 备注

- 如果某个 commit 涉及多个文件，确保整体可运行再提交
- 遇到阻塞问题可以调整顺序，但每个 commit 保持原子性
- Day 3 的 `fix` 和 `style` 可以根据实际情况合并为一个 commit
