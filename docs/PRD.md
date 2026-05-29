# 音乐生成器 产品需求文档

> **版本：** 1.0
> **更新日期：** 2026-05-21
> **状态：** 开发中

---

## 1. 产品概述

### 1.1 产品名称
音乐生成器

### 1.2 产品类型
纯前端 Web 应用

### 1.3 核心功能
一款 AI 驱动的音乐创作平台，支持用户通过文本描述生成原创音乐、AI 辅助歌词创作，以及通过上传音频或提供 URL 进行翻唱处理。

### 1.4 目标用户
- 音乐创作者和爱好者
- 需要原创音乐的内容创作者
- 寻找歌词灵感的词作者
- 探索翻唱变体的音乐人

---

## 2. 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 + Vite |
| 语言 | TypeScript |
| 样式 | Tailwind CSS + 内联样式 |
| UI 组件库 | shadcn/ui |
| 状态管理 | Zustand（支持 localStorage 持久化）|
| 图标 | Lucide React |
| API | MiniMax APIs |

### 2.1 API 集成
- **音乐生成：** `POST /v1/music_generation`
- **歌词生成：** `POST /v1/lyrics_generation`
- **翻唱预处理：** `POST /v1/music_cover_preprocess`

---

## 3. UI/UX 规范

### 3.1 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│ 顶部导航栏 (固定高度 56px)                                    │
│ [🎵 Logo] [标题]              [☀️/🌙 主题] [🎨 风格选择]   │
├──────────┬────────────────────────────────────────────────┤
│ 侧边导航  │  主内容区域                                      │
│ (80px)   │                                                 │
│           │  ┌────────────────────┐ ┌─────────────────┐   │
│ [🎵]     │  │   音乐生成卡片     │ │   歌词生成卡片   │   │
│ [🔄]     │  │      (2/3)        │ │     (1/3)      │   │
│ [🎤]     │  │                   │ │   (可展开)      │   │
│           │  └────────────────────┘ └─────────────────┘   │
│           │                                                 │
└──────────┴────────────────────────────────────────────────┘
```

### 3.2 导航说明

| 图标 | 标签 | 功能 |
|------|------|------|
| 🎵 | 音乐 | 切换到音乐生成选项卡 |
| 🔄 | 翻唱 | 切换到翻唱处理选项卡 |
| 🎤 | 歌词 | 展开/收起歌词面板（与主内容并排显示）|

### 3.3 视觉设计

#### 3.3.1 主题系统
- **明暗模式：** 头部切换按钮控制，影响整个应用
- **风格主题：** 三种视觉风格，影响全局颜色配置

#### 3.3.2 风格配色方案

| 风格 | 主色调 | 渐变背景 | 深色模式背景 |
|------|--------|----------|--------------|
| 温暖自然 | #e87d1e (橙色) | linear-gradient(135deg, #f97316, #ea580c) | rgba(50,50,50,0.95) |
| 清新自然 | #22c55e (绿色) | linear-gradient(135deg, #22c55e, #16a34a) | rgba(30,50,40,0.95) |
| 赛博朋克 | #8b5cf6 (紫色) | linear-gradient(135deg, #8b5cf6, #06b6d4) | rgba(30,25,60,0.95) |

#### 3.3.3 字体规范
- **字体族：** 系统默认字体
- **标题：** 24px，粗体
- **正文：** 14-15px
- **辅助文字：** 11-13px

#### 3.3.4 间距规范
- **容器内边距：** 24px
- **卡片内边距：** 24px
- **元素间距：** 20px
- **圆角：** 卡片 12px，输入框 8px，按钮 14px

---

## 4. 功能规格

### 4.1 音乐生成

**组件文件：** `src/components/music/MusicGenerator.tsx`

#### 4.1.1 输入字段

1. **歌曲描述** - 必填
   - 文本输入框
   - 占位符："例如：抒情的流行音乐，关于梦想和坚持..."
   - 验证：生成前必须填写

2. **歌词** - 可选（纯音乐模式隐藏）
   - 多行文本框，高度 140px
   - 支持结构标签：[Intro]、[Verse]、[Pre-Chorus]、[Chorus]、[Hook]、[Bridge]、[Outro]、[Solo]、[Instrumental]、[Reprise]
   - "📖 查看示例" 按钮展开帮助面板

3. **纯音乐开关** - 位于歌词输入框上方
   - 开关控件
   - 开启时：隐藏歌词输入框
   - 默认：关闭（启用歌词）

4. **音频设置**
   - **格式：** MP3、WAV、PCM（默认：MP3）
   - **采样率：** 16000、24000、32000、44100 Hz（默认：44100）
   - **比特率：** 32、64、128、256 kbps（默认：256）

#### 4.1.2 操作按钮

1. **🤖 AI 帮我写歌词** - 无需填写歌曲描述即可点击
   - 打开歌词面板
   - 生成中显示加载状态

2. **🎵 开始生成音乐** - 需要填写歌曲描述
   - 渐变背景色跟随当前风格
   - 生成中显示加载动画

#### 4.1.3 输出
- 音频播放（通过生成的 URL 或 hex 转换）
- 时长显示
- 错误信息提示

---

### 4.2 歌词生成

**组件文件：** `src/components/lyrics/LyricsPanel.tsx`

#### 4.2.1 布局
- 展开时占 1/3 宽度，与主内容并排显示
- 可通过关闭按钮或切换模式收起

#### 4.2.2 输入
1. **描述** - 文本输入框
   - 用于描述歌词主题/风格

#### 4.2.3 输出
1. **生成的歌词** - 只读文本框
2. **应用到音乐生成** 按钮 - 将歌词应用到音乐生成

---

### 4.3 翻唱处理

**组件文件：** `src/components/cover/CoverProcessor.tsx`

#### 4.3.1 输入方式

1. **文件上传**
   - 点击或拖拽上传
   - 支持格式：MP3、WAV、FLAC
   - 时长要求：6 秒 - 6 分钟

2. **URL 输入**
   - 直接输入音频 URL
   - 点击"从 URL 预处理"按钮处理

#### 4.3.2 输出
1. **Feature ID** - 翻唱生成的内部引用
2. **提取的歌词** - 可编辑文本框

#### 4.3.3 待完成功能
- **生成翻唱版本** 按钮（界面已就绪，后端未连接）

---

### 4.4 主题与风格系统

**状态管理文件：** `src/stores/appStore.ts`

| 状态 | 类型 | 持久化 | 默认值 |
|------|------|--------|--------|
| isDark | boolean | 是 | false |
| style | 'warm' \| 'nature' \| 'cyberpunk' | 否 | 'warm' |
| apiKey | string | 是 | '' |
| mode | 'music' \| 'cover' | 是 | 'music' |
| lyricsPanelOpen | boolean | 否 | false |

---

## 5. API 规格

### 5.1 音乐生成

**接口：** `POST /v1/music_generation`

**请求参数：**
```typescript
{
  model?: string;
  title?: string;
  prompt: string;           // 必填
  lyrics?: string;          // 纯音乐时为空
  style?: string;
  tags?: string[];
  instrumental?: boolean;   // 默认 false
}
```

**响应参数：**
```typescript
{
  status: number;
  status_text: string;
  trace_id?: string;
  data?: {
    audio_url?: string;
    audio_hex?: string;     // 十六进制编码音频
    duration?: number;       // 秒
    title?: string;
  };
}
```

---

### 5.2 歌词生成

**接口：** `POST /v1/lyrics_generation`

**请求参数：**
```typescript
{
  mode: 'write_full_song' | 'edit';
  prompt?: string;
  lyrics?: string;
  title?: string;
}
```

**响应参数：**
```typescript
{
  status: number;
  status_text: string;
  data?: {
    lyrics?: string;
    title?: string;
  };
}
```

---

### 5.3 翻唱预处理

**接口：** `POST /v1/music_cover_preprocess`

**请求参数：**
```typescript
{
  audio_url?: string;       // 二选一
  audio_base64?: string;    // 二选一
}
```

**响应参数：**
```typescript
{
  status: number;
  status_text: string;
  data?: {
    feature_id?: string;
    lyrics?: string;
  };
}
```

---

## 6. 组件清单

### 6.1 UI 组件（shadcn/ui）

| 组件 | 用途 | 定制化 |
|------|------|--------|
| Button | 操作按钮 | 风格主题适配 |
| Select | 音频格式下拉框 | 通过 props 传递颜色 |
| Input | 文本输入 | - |
| Textarea | 歌词输入 | - |
| Dialog | 风格选择弹窗 | - |

### 6.2 业务组件

| 组件 | 文件路径 | 用途 |
|------|----------|------|
| MusicGenerator | `components/music/MusicGenerator.tsx` | 音乐创作表单 |
| CoverProcessor | `components/cover/CoverProcessor.tsx` | 翻唱处理表单 |
| LyricsPanel | `components/lyrics/LyricsPanel.tsx` | 歌词生成面板 |
| StyleSelector | `components/StyleSelector.tsx` | 风格选择弹窗 |

### 6.3 自定义 Hooks

| Hook | 用途 |
|------|------|
| useMusicGeneration | 音乐生成逻辑 |
| useLyricsGeneration | 歌词生成逻辑 |
| useCoverPreprocess | 翻唱预处理逻辑 |
| useApiKey | API Key 管理 |

---

## 7. 用户流程

### 7.1 创建原创音乐

1. 输入歌曲描述
2. （可选）开启"纯音乐"开关
3. （可选）点击"🤖 AI 帮我写歌词"获取灵感
4. （可选）编辑生成的歌词
5. 配置音频设置（格式、采样率、比特率）
6. 点击"🎵 开始生成音乐"
7. 等待生成完成
8. 播放/试听生成的音频

### 7.2 生成歌词

1. 点击"🤖 AI 帮我写歌词"
2. 在歌词面板输入歌词描述
3. 点击"生成歌词"
4. 查看生成的歌词
5. 点击"应用到音乐生成"使用

### 7.3 处理翻唱

1. 切换到"翻唱"选项卡
2. 上传音频文件或输入 URL
3. 等待预处理完成
4. 查看/编辑提取的歌词
5. （待完成）生成翻唱版本

---

## 8. 已知问题与待办

### 8.1 已知问题
- 风格选择弹窗未响应主题变化
- 部分内联样式硬编码（如翻唱处理头部图标背景）

### 8.2 待完成功能
- 音频播放界面及控制组件
- 翻唱生成接口对接
- 生成音乐分享功能
- 历史记录功能

---

## 9. 文件结构

```
src/
├── App.tsx                    # 主布局
├── main.tsx                   # 入口文件
├── index.css                 # Tailwind + 自定义样式
├── stores/
│   └── appStore.ts           # Zustand 状态管理
├── hooks/
│   ├── useMusicGeneration.ts # 音乐生成 Hook
│   ├── useLyricsGeneration.ts # 歌词生成 Hook
│   ├── useCoverPreprocess.ts # 翻唱预处理 Hook
│   └── useApiKey.ts         # API Key 管理 Hook
├── components/
│   ├── music/
│   │   ├── MusicGenerator.tsx
│   │   └── index.ts
│   ├── cover/
│   │   ├── CoverProcessor.tsx
│   │   └── index.ts
│   ├── lyrics/
│   │   ├── LyricsPanel.tsx
│   │   └── index.ts
│   ├── ui/                   # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── select.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   └── label.tsx
│   ├── StyleSelector.tsx     # 风格选择器
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── PlayerBar.tsx
└── lib/
    ├── api.ts                # API 调用函数
    └── utils.ts              # 工具函数
```

---

## 10. 附录

### 10.1 歌词结构标签参考

| 标签 | 含义 |
|------|------|
| [Intro] | 前奏 |
| [Verse 1/2] | 主歌 |
| [Pre-Chorus] | 预副歌 |
| [Chorus] | 副歌 |
| [Hook] | 记忆点 |
| [Bridge] | 桥段 |
| [Outro] | 尾奏 |
| [Solo] | 乐器独奏 |
| [Instrumental] | 纯器乐段落 |
| [Reprise] | 重复变奏 |

### 10.2 音频格式说明

| 格式 | 典型用途 | 压缩方式 |
|------|----------|----------|
| MP3 | 通用兼容 | 有损压缩 |
| WAV | 高品质 | 无压缩 |
| PCM | 原始音频数据 | 未压缩 |
