# 🎵 Music Master

> AI 驱动的纯前端音乐创作平台 — 一键生成原创音乐、歌词翻唱与 AI 歌词创作

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| 🎼 **AI 音乐生成** | 输入描述和歌词,几秒生成完整音乐作品 (支持 URL / Hex 双输出格式) |
| ✍️ **AI 歌词创作** | 6 个内置风格模板,支持写完整歌曲 / 编辑续写两种模式 |
| 🔄 **翻唱处理** | 上传音频文件或粘贴 URL,自动提取歌词并生成新翻唱版本 |
| 📁 **NCM 解密** | 原生支持网易云 `.ncm` 加密格式,直接转 base64 上传 |
| 🎨 **10 套主题** | 温暖 / 清新 / 赛博朋克 / 商务 / 卡通 / 极简 / 复古 / 暗黑 / 浅绿 / 动物森友会 |
| 📱 **响应式** | 桌面三栏布局 + 移动端 Tab Bar 切换,断点 768px |
| 🌓 **明暗模式** | 全局主题切换,持久化到 localStorage |

---

## 🚀 快速开始

### 环境要求

- Node.js **≥ 18**
- npm / pnpm / yarn (任一)
- 一份 **MiniMax API Key** — [在此申请](https://platform.minimaxi.com/user-center/basic-information/interface-key)

### 安装与启动

```bash
# 1. 克隆仓库
git clone <repo-url> && cd music-master

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
# → 浏览器打开 http://localhost:5173

# 4. 在页面上点击右上角 "API Key" 按钮,填入你的 MiniMax API Key
```

### 构建生产版本

```bash
npm run build      # 输出到 dist/
npm run preview    # 本地预览构建产物
npm run lint       # ESLint 检查
```

---

## 🏗️ 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React 18 + Vite 6 |
| 语言 | TypeScript 5.6 (strict mode) |
| 样式 | Tailwind CSS 3 + 内联样式 (支持动态主题) |
| UI 组件 | Radix UI (Dialog / Select / Slider / Switch) + 自研 |
| 状态管理 | Zustand 5 + `persist` 中间件 (localStorage) |
| 图标 | Lucide React |
| 外部组件 | `animal-island-ui` (动物森友会主题时使用) |
| API | MiniMax 音乐 / 歌词 / 翻唱 接口 |

---

## 📂 项目结构

```
src/
├── App.tsx                    # 应用根 + 桌面/移动端布局分发
├── main.tsx                   # React 入口
├── index.css                  # 全局样式 + Tailwind 入口
│
├── components/
│   ├── AudioResultPanel.tsx   # 浮动播放面板(桌面)
│   ├── StyleSelector.tsx      # 风格选择器(对话框形式)
│   ├── cover/                 # 翻唱模块
│   ├── lyrics/                # 歌词模块
│   ├── music/                 # 音乐生成模块
│   ├── layout/                # 布局组件(Header / Sidebar / 移动端)
│   └── ui/                    # 通用 UI 组件(Button / Dialog / Select / Toast / ...)
│
├── hooks/                     # 自定义 React Hooks
│   ├── useMusicGeneration.ts  # 音乐生成
│   ├── useLyricsGeneration.ts # 歌词生成
│   ├── useCoverPreprocess.ts  # 翻唱预处理
│   ├── useCoverGeneration.ts  # 翻唱生成
│   ├── useAsyncAction.ts      # 通用异步 Action 包装(含竞态/卸载保护)
│   ├── useResponsive.ts       # 视口断点检测
│   └── useToast.ts            # Toast 状态管理
│
├── stores/
│   └── appStore.ts            # Zustand 全局 store + 持久化配置
│
└── lib/
    ├── api.ts                 # MiniMax API 封装 + ApiError 类
    ├── ncm.ts                 # NCM 文件解密 (AES-128-ECB + RC4)
    └── utils.ts               # cn() 等工具
```

---

## 🔌 API 集成

所有接口位于 `https://api.minimaxi.com`,通过 `Authorization: Bearer {API_KEY}` 鉴权。

| 接口 | 端点 | 用途 |
|------|------|------|
| 音乐生成 | `POST /v1/music_generation` | 生成原创音乐 |
| 歌词生成 | `POST /v1/lyrics_generation` | AI 写歌词 / 编辑续写 |
| 翻唱预处理 | `POST /v1/music_cover_preprocess` | 提取原曲特征 + 歌词 |

> 完整接口规范见 [docs/api-reference.md](./docs/api-reference.md)

### 安全性说明

⚠️ **API Key 不写入 localStorage**。出于安全考虑,Key 仅保留在内存中,刷新页面后需重新输入。详见 `src/stores/appStore.ts` 的 `partialize` 与 `merge` 配置。

---

## 🧠 关键设计

### 1. 异步 Action 复用模式

所有 4 个 API hook(`useMusicGeneration` / `useLyricsGeneration` / `useCoverPreprocess` / `useCoverGeneration`)都基于通用 `useAsyncAction` hook,内置:

- ✅ Loading / error 状态管理
- ✅ 竞态保护(`runIdRef` 守卫,新请求自动作废旧结果)
- ✅ 卸载保护(`mountedRef`,防止 setState after unmount)
- ✅ 统一错误格式化(`getApiErrorMessage`)

### 2. 主题系统

`appStore.ts` 中定义 `Style` 联合类型与 `styleColors` 调色板。组件通过订阅 `style` 字段实现响应式重渲染,所有颜色统一从 `styleColors[style]` 读取。`animal` 主题会切换至 `animal-island-ui` 组件。

### 3. Blob URL 生命周期管理

`appStore.setAudioResult` / `clearAudioResult` 自动 `URL.revokeObjectURL` 旧 blob,防止内存泄漏。组件卸载时亦有兜底清理。

### 4. NCM 解密

`src/lib/ncm.ts` 实现完整的 NCM 协议解析:

- AES-128-ECB 解密 RC4 密钥
- NCM 修改版 RC4 PRGA 解密音频流
- 自动嗅探 MP3 / FLAC / WAV / OGG 容器
- 大文件采用分块 + `Uint8Array` 直接解码,避免 `String.fromCharCode(...chunk)` 的内存爆问题

---

## 🛠️ 开发规范

### 代码风格

- **不可变数据**: 使用展开运算符创建新对象,禁止 mutation
- **类型安全**: 公共 API / Hooks / Props 必须有显式类型,避免 `any`
- **错误处理**: 统一使用 `ApiError` 类,边界处 try/catch
- **早返回**: 减少嵌套,优先 early return

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: 新功能
fix:  修复 bug
refactor: 重构(无功能变更)
docs: 文档
chore: 杂项
```

---

## 📚 文档

- [产品需求文档](./docs/PRD.md) — 功能与 UI 规范
- [API 接口文档](./docs/api-reference.md) — MiniMax 接口完整规范

---

## 🐛 已知问题

- NCM 大文件解密扫描的 O(N×M) 算法仍有性能压力
- 桌面端多 panel 同开时 main 卡片压缩到 33% 较窄

详见 [issues](../../issues)。

---

## 📄 License

[MIT](./LICENSE) © 2026 Music Master Contributors
