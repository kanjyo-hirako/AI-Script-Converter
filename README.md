# AI-Script-Converter

> **AI 小说转剧本工具** — 将中文小说自动转换为结构化 YAML 剧本<br/>视频放在了https://www.bilibili.com/video/BV1w4Et6PEX7/?vd_source=011d6d3e114c910e814e18d028fb90d3访问即可

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-6.7-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/OpenAI_SDK-Compatible-412991?logo=openai&logoColor=white" alt="OpenAI SDK" />
</p>

---

## 项目总述

AI-Script-Converter 是一个基于 AI 的中文小说转剧本工具。用户只需粘贴小说文本或上传文件，系统即可自动识别章节结构，通过大语言模型逐章转换为符合行业标准的结构化剧本，并提供可视化编辑、格式化预览和多格式导出能力。

**核心流程：** 粘贴小说 → 智能分章 → AI 逐章生成 → 编辑与预览 → 多格式导出

**实现方式：** 前端采用 Vue 3 + TypeScript 构建单页应用，通过五步向导（输入 → 分章 → 生成 → 编辑 → 设置）引导用户完成整个转换流程。后端使用 Express.js 搭建 API 代理层，通过 OpenAI SDK 兼容接口对接国内主流大模型平台（DeepSeek、通义千问、Moonshot 等），逐章发送文本并累积角色和场景信息，最终输出结构化 JSON，前端将其转为 YAML 格式供编辑和导出。

**项目亮点：**

- **多平台模型兼容** — 统一使用 OpenAI SDK 接口格式，只需切换 baseURL 即可对接不同模型平台，支持 SiliconFlow、DeepSeek、通义千问、Moonshot、智谱及任意自定义兼容服务
- **智能分章与手动调整** — 自动识别中文章节标题，支持自定义正则分隔符适配非标准格式，可勾选跳过、合并相邻章节、展开查看全文
- **断点续传与取消控制** — 多章转换过程中支持随时取消，失败后从断点继续而非从头重跑，已完成的结果始终保留
- **双视图编辑体验** — 内置 Monaco YAML 编辑器提供完整代码编辑能力，同时提供标准剧本格式化预览（场景标题、角色名、对话、转场等专业排布），支持一键切换
- **多格式导出与导入** — 支持导出 YAML、Fountain（编剧标准纯文本格式）、PDF（浏览器打印），并支持导入已有 YAML 恢复编辑状态
- **快速配置体验** — 未配置 API Key 时点击生成自动弹出配置弹窗，无需跳转设置页；生成完成后自动跳转编辑页面
- **P3RE 风格欢迎动画** — 受 Persona 3 Reload 启发的开场动画，搭配粒子背景，提升视觉体验

---

## 功能特性

### 核心功能

- **小说输入** — 支持直接粘贴文本或上传 `.txt` / `.docx` 文件，实时字数统计
- **智能分章** — 自动识别中文章节标题（第X章/回/节/卷），支持自定义正则分隔符
- **AI 转换** — 逐章调用大语言模型，累积角色和场景信息，生成结构化剧本
- **YAML 编辑** — 内置 Monaco Editor，支持语法高亮、代码折叠、行跳转
- **格式化预览** — 按标准剧本格式渲染（场景标题、角色名、对话、转场），支持 YAML / 格式化双 tab 切换
- **角色面板** — 自动提取角色列表（主角/配角/龙套），点击跳转到 YAML 对应位置
- **场景导航** — 场景列表展示，支持快速定位到编辑器

### 分章调整

- **自定义分隔符** — 输入正则表达式匹配非标准章节格式（如 `^\d+\.` 或 `^Chapter \d+`）
- **章节勾选** — 勾选/取消特定章节，跳过不需要转换的部分
- **合并章节** — 一键合并相邻章节
- **展开全文** — 查看完整章节内容，不再限于 200 字预览
- **全选/全不选** — 快捷操作按钮

### 转换控制

- **断点续传** — 转换失败后重试时从失败章节继续，已完成的结果保留不丢失
- **取消转换** — 转换过程中可随时取消，已处理章节的结果保留
- **进度追踪** — 实时显示当前转换章节进度
- **快速配置** — 未配置 API Key 时，点击「生成剧本」自动弹出配置弹窗，无需跳转设置页

### 导出与导入

- **多格式导出** — 支持 `.yaml`、`.fountain`（编剧标准纯文本格式）、`.pdf`（打印对话框）
- **YAML 导入** — 导入之前导出的 YAML 文件，恢复编辑状态

### 支持的 AI 模型平台

| 平台 | 默认模型 |
|------|----------|
| SiliconFlow | DeepSeek-V4-Flash |
| DeepSeek | deepseek-chat |
| 通义千问 | qwen-plus |
| Moonshot (Kimi) | moonshot-v1-32k |
| 智谱 (ChatGLM) | glm-4 |
| 自定义 | 兼容 OpenAI API 的任意服务 |

---

## 项目结构

```
Script-Converter/
├── client/                      # 前端 (Vue 3 + Vite)
│   ├── public/
│   │   ├── welcome/             # 欢迎页 (P3RE 风格开场动画)
│   │   │   ├── index.html
│   │   │   ├── css/style.css
│   │   │   ├── img/waves/       # 波浪 SVG 动画素材
│   │   │   └── assset/          # 视频背景素材
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── NovelInput.vue       # 小说输入组件
│   │   │   ├── ChapterSplitter.vue  # 分章组件 (支持手动调整)
│   │   │   ├── ConvertPanel.vue     # 转换控制面板 (含断点续传)
│   │   │   ├── SettingsModal.vue    # API Key 快速配置弹窗
│   │   │   ├── ScreenplayViewer.vue # 剧本查看器 (YAML + 格式化预览)
│   │   │   ├── FormattedPreview.vue # 标准剧本格式化预览
│   │   │   ├── YamlEditor.vue       # Monaco YAML 编辑器
│   │   │   ├── CharacterPanel.vue   # 角色面板
│   │   │   ├── SceneNavigator.vue   # 场景导航
│   │   │   ├── ParticlesBg.vue      # 粒子背景动画
│   │   │   └── SettingsPanel.vue    # 设置面板
│   │   ├── composables/
│   │   │   ├── useConversion.ts     # 转换流程 (含断点续传/取消)
│   │   │   └── useSettings.ts       # 设置持久化
│   │   ├── lib/
│   │   │   ├── chapterSplitter.ts   # 分章算法 (支持自定义正则)
│   │   │   ├── fileParser.ts        # 文件解析 (txt/docx)
│   │   │   └── fountainExporter.ts  # Fountain 格式导出
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── style.css
│   ├── vite.config.ts
│   └── package.json
│
├── server/                      # 后端 (Express + TypeScript)
│   └── src/
│       ├── index.ts             # 服务入口
│       ├── routes/
│       │   └── convert.ts       # POST /api/convert 路由
│       └── services/
│           ├── ai.ts            # OpenAI SDK 调用封装
│           └── promptBuilder.ts # Prompt 构建
│
├── shared/                      # 前后端共享代码
│   ├── types.ts                 # TypeScript 类型定义
│   └── providers.ts             # 模型平台配置
│
├── docs/
│   └── schema-spec.md           # YAML 剧本 Schema 规范
│
└── package.json                 # npm workspaces 根配置
```

---

## 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** >= 9

### 安装

```bash
# 克隆项目
git clone git@github.com:kanjyo-hirako/AI-Script-Converter.git
cd AI-Script-Converter

# 安装依赖 (npm workspaces 自动处理所有子包)
npm install
```

### 启动开发服务器

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:client    # 前端 → http://localhost:5173
npm run dev:server    # 后端 → http://localhost:3001
```

### 构建

```bash
npm run build
```

---

## 使用流程

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  1.输入  │ →  │  2.分章  │ →  │  3.生成  │ →  │  4.编辑  │ →  │  5.设置  │
│ 粘贴/上传│    │ 手动调整 │    │ AI 转换  │    │ YAML/预览│    │ 模型配置 │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

1. **输入** — 粘贴小说文本或上传 `.txt` / `.docx` 文件
2. **分章** — 自动识别章节，支持自定义分隔符、合并、勾选跳过
3. **生成** — 点击生成，未配置 API Key 时自动弹出配置弹窗；支持取消和断点续传
4. **编辑** — YAML 编辑器与格式化预览双 tab 切换，支持导出 YAML / Fountain / PDF
5. **设置** — 配置 API Key、选择模型平台

---

## YAML 剧本 Schema

转换输出遵循结构化 Schema，详见 [docs/schema-spec.md](docs/schema-spec.md)。

```yaml
screenplay:
  meta:          # 剧本元信息 (标题、作者、类型等)
  characters:    # 角色列表 (id、name、role 等)
  locations:     # 地点列表 (INT/EXT 类型)
  scenes:        # 场景列表
    - id: S01
      heading: "INT. 咖啡馆 - 夜晚"
      content:
        - type: action        # 动作描写
        - type: dialogue      # 对话 (含角色ID和括号注释)
        - type: transition    # 转场
        - type: note          # 编导注释
```

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Composition API |
| 构建工具 | Vite 6 |
| 类型系统 | TypeScript |
| 样式方案 | Tailwind CSS v4 |
| 代码编辑器 | Monaco Editor |
| 动画库 | Motion Vue (Inspira UI) |
| 后端框架 | Express.js |
| AI 调用 | OpenAI SDK (兼容多平台) |
| 包管理 | npm workspaces |

---

## 许可证

MIT
