# AI-Script-Converter

> **AI 小说转剧本工具** — 将中文小说自动转换为结构化 YAML 剧本

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-6.7-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/OpenAI_SDK-Compatible-412991?logo=openai&logoColor=white" alt="OpenAI SDK" />
</p>

---

## 功能特性

### 核心功能

- **小说输入** — 支持直接粘贴文本或上传 `.txt` / `.docx` 文件
- **智能分章** — 自动识别章节标题，支持手动调整分章
- **AI 转换** — 调用大语言模型将小说文本转换为结构化剧本
- **YAML 编辑** — 内置 Monaco Editor，支持语法高亮和行跳转
- **角色面板** — 自动提取角色列表，点击可跳转到对应 YAML 位置
- **场景导航** — 场景列表展示，支持快速定位
- **导出功能** — 一键导出 `.yaml` 剧本文件

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
│   │   │   ├── ChapterSplitter.vue  # 分章组件
│   │   │   ├── ConvertPanel.vue     # 转换控制面板
│   │   │   ├── ScreenplayViewer.vue # 剧本查看器 (三栏布局)
│   │   │   ├── YamlEditor.vue       # Monaco YAML 编辑器
│   │   │   ├── CharacterPanel.vue   # 角色面板
│   │   │   ├── SceneNavigator.vue   # 场景导航
│   │   │   └── SettingsPanel.vue    # 设置面板
│   │   ├── composables/
│   │   │   ├── useConversion.ts     # 转换流程逻辑
│   │   │   └── useSettings.ts       # 设置持久化
│   │   ├── lib/
│   │   │   ├── chapterSplitter.ts   # 分章算法
│   │   │   └── fileParser.ts        # 文件解析 (txt/docx)
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
│ 粘贴/上传│    │ 自动分割 │    │ AI 转换  │    │ YAML 编辑│    │ 模型配置 │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

1. **输入** — 粘贴小说文本或上传文件
2. **分章** — 自动识别章节，可手动调整
3. **生成** — 选择 AI 平台，一键转换为剧本
4. **编辑** — 在 Monaco Editor 中查看和编辑 YAML 剧本
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
