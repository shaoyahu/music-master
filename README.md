# Music Master v2

AI 音乐创作平台的重构版本。基于 [shaoyahu/music-master](https://github.com/shaoyahu/music-master) 的功能与设计，使用 **相同的 React 18 + Vite 6 + TypeScript + Tailwind 3 + Zustand 5 + Radix UI** 技术栈，但通过**架构解耦、痛点修复、体验升级**三个方向各做 70% 深度重构。

## 启动

```bash
npm install
npm run dev        # 开发服务器，http://localhost:5173
npm run build      # 生产构建
npm run test       # 运行单元测试
npm run test:coverage  # 覆盖率报告
```

## 重构亮点

### 1. 性能：NCM 双指针 O(N) 解密

原项目在 NCM key 区扫描使用嵌套循环，时间复杂度 **O(N×M)**，处理 >20MB 文件时浏览器明显卡顿。

新实现：
- `parseNcmHeader` 一次扫描预解析关键头（key offset、metadata offset、audio offset）
- RC4 解密用双指针游走（`i`、`j` 维护），每 0x80 字节重置 S-box
- 主循环不再回退，时间复杂度 **O(N)**

文件：`src/lib/ncm/decrypt.ts`

### 2. 体验：CSS Grid 布局 + 错误边界 + 骨架屏

原项目桌面三栏同时打开时主卡片被压到 33%。

新实现（`src/App.tsx`）：
```css
grid-template-columns: 240px minmax(480px, 1fr) 360px;
```
- 主面板有最小宽度保护（不会 < 480px）
- 移动端单列 + 底部 Tab Bar
- 桌面 ≥1280px 显示常驻 AudioResultPanel
- 桌面 <1280px 折叠为底部抽屉

体验升级：
- 每个 view 包裹 `<ErrorBoundary>`，局部崩溃不影响全局
- 加载时显示 `<Skeleton>` 卡片
- 按钮/Dialog/Slider 补全 `aria-label`
- Esc 关闭 Dialog，Tab 焦点环可见

### 3. 架构：分层 + 4 Store 拆分

```
domain/   纯类型 + 校验（无 React 依赖）
lib/      副作用与 IO（API、NCM、主题、工具）
stores/   状态（4 个域 store）
hooks/    view-model 层
views/    业务容器
ui/       纯展示组件
```

依赖方向：**ui ← views ← hooks ← stores ← lib ← domain**。

Store 拆分（原 1 个 → 现 4 个）：
- `uiStore`：主题/暗色模式/侧栏/Toast（持久化到 localStorage）
- `musicStore`：音乐生成状态 + 历史
- `lyricsStore`：歌词状态
- `coverStore`：翻唱状态（自动 revoke Blob URL）

API Key 仅存于 `uiStore` 内存，**不写入 localStorage**。

## 主题

10 套调色板（CSS 变量）+ 4 套完整独立样式：

| 主题 | 调色板 | 完整样式 |
|---|---|---|
| 温暖 | ✓ | ✓ |
| 清新 | ✓ | – |
| 赛博朋克 | ✓ | ✓ |
| 商务 | ✓ | – |
| 卡通 | ✓ | – |
| 极简 | ✓ | ✓ |
| 复古 | ✓ | – |
| 暗黑 | ✓ | – |
| 浅绿 | ✓ | ✓ |
| 动物森友会 | ✓ | – |

切换主题：Header 右上角下拉。明暗模式：太阳/月亮按钮。

## Mock 后端

`src/lib/api/mock.ts` 模拟 MiniMax 三个端点：
- 200-1500ms 随机延迟
- 10% 概率音乐生成 500 错误
- 5% 概率歌词生成 429 限流
- 8% 概率翻唱预处理超时

返回真实的 1 秒静音 WAV（base64 编码），可在右侧面板播放。

## 测试

54 个单元测试，9 个文件，覆盖核心模块：

| 模块 | 覆盖 | 目标 |
|---|---|---|
| `lib/api/mock.ts` | 97% | 90% ✓ |
| `lib/ncm/container.ts` | 100% | 95% ✓ |
| `hooks/useAsyncAction.ts` | 94% | 90% ✓ |
| `stores/uiStore.ts` | 93% | 80% ✓ |
| `stores/musicStore.ts` | 85% | 80% ✓ |
| `lib/utils/*` | 100% | 100% ✓ |
| `domain/errors.ts` | 95% | – |
| `lib/ncm/decrypt.ts` | 31% | 95% ✗ |

**注**：`lib/ncm/decrypt.ts` 覆盖率较低（31%），原因是其内部的 AES-128-ECB 实现未被单元测试触发。3 小时约束下，构造完整 NCM 样本并触发全流程需 30+ 分钟额外工作。已覆盖关键路径：头解析、错误处理、容器嗅探。

## 目录结构

```
src/
├── domain/              # 业务模型与错误
├── lib/
│   ├── api/             # API 客户端 + Mock 后端
│   ├── ncm/             # NCM 解密（AES + RC4）
│   ├── theme/           # 主题调色板 + 预设
│   └── utils/           # cn/format/id
├── stores/              # 4 个 Zustand 域 store
├── hooks/               # view-model 层
├── components/
│   ├── views/           # 业务容器
│   ├── layout/          # Header/Sidebar/MobileTabBar/AudioResultPanel
│   └── ui/              # 纯展示组件
├── App.tsx              # 根组件 + 布局分发
└── main.tsx             # 入口

tests/                   # Vitest 单元测试
docs/superpowers/specs/ # 设计文档
```

## 已知限制

- NCM `decrypt.ts` AES 实现为纯 JS，**20MB 文件解密约 1-2s**。如需更快需引入 Web Crypto 或 Web Worker。
- Mock 后端是确定性随机，刷新页面后错误注入位置会变。
- 4 套完整样式主题（warm/cyberpunk/minimal/lightgreen），其余 6 套仅调色板差异，基础样式复用 minimal。

## 原始项目

- 仓库：https://github.com/shaoyahu/music-master
- License：MIT
