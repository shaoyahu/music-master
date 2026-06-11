# Music Master 重构设计

**日期**: 2026-06-08
**项目**: `music-master` 重构
**目标仓库**: `shaoyahu/music-master` (MIT)
**目标目录**: `/Users/bytedance/code/self/mm-refactor/`
**运行时长约束**: ≤ 3 小时

## 1. 目标

将 music-master 项目从零独立重构到一个新目录，**性能、体验、架构三方向各做 70% 深度**，交付一个可独立运行、核心 70% 测试覆盖、有 README 的高质量前端应用。

## 2. 范围与非范围

### In Scope

- 从零 scaffold 一个 Vite + React 18 + TS 5.6 strict 项目
- 实现 4 个核心业务模块：AI 音乐生成、AI 歌词创作、翻唱处理、NCM 解密
- 修复原项目两个已知痛点：NCM 大文件 O(N×M) 性能、桌面三栏布局挤压
- 10 套调色板 + 4 套完整样式主题
- 桌面三栏 + 移动 Tab Bar 响应式布局
- Mock 后端（含错误注入、延迟模拟）
- Vitest 单元测试（核心 70% 覆盖）
- 体验升级：骨架屏、错误边界、aria 基础属性、键盘导航
- 视图与 UI 分层、4 个域 store 拆分
- README 文档

### Out of Scope

- 不初始化 git 仓库
- 不推送 GitHub
- 不接入真实 MiniMax API（仅 Mock）
- 不引入 animal-island-ui 主题组件库
- 不引入 Web Worker（性能 70% 而非 80%）
- 不做完整 80% 测试覆盖率（70% 目标）
- 不做 i18n
- 不做 PWA / 离线
- 不部署到 CDN

## 3. 架构

### 3.1 分层

```
domain/     纯类型 + 校验（无 React 依赖）
lib/        副作用与 IO（API、NCM、主题、工具）
stores/     状态（Zustand，4 个域 store）
hooks/      view-model 层（封装异步、副作用、订阅）
views/      业务容器（调 store + hook，编排 UI）
ui/         纯展示组件（零状态，props in / event out）
```

依赖方向：**ui ← views ← hooks ← stores ← lib ← domain**。无逆向依赖。

### 3.2 Store 拆分

| Store | 职责 | 持久化 |
|---|---|---|
| `uiStore` | 主题、暗色模式、侧栏开关、Toast 列表 | localStorage（部分字段） |
| `musicStore` | 当前生成参数、结果、历史 | 内存 |
| `lyricsStore` | 当前歌词、风格、续写历史 | 内存 |
| `coverStore` | 翻唱源、预处理结果、生成结果 | 内存（blob URL 自动 revoke） |

API Key 仅在 `uiStore` 内存中（不持久化）。

### 3.3 异步 Action 复用

保留 `useAsyncAction` hook（race protection via `runIdRef` + unmount guard via `mountedRef`），增加：
- 统一错误格式化（`getApiErrorMessage`）
- 错误码分类（`ValidationError`、`NetworkError`、`RateLimitError`）

## 4. 痛点修复方案

### 4.1 NCM 性能：O(N×M) → O(N)

**原问题**：原项目 key 区扫描 O(N×M)，NCM 文件 >20MB 时浏览器明显卡顿。

**新实现**：
- **双指针扫描**：维护 `i`、`j` 双指针，跳过已知不匹配区域，避免回退
- **关键头预索引**：在文件头 4KB 预解析 NCM 关键头（magic、key offset、key length），主循环使用预索引值
- **Web Crypto API**：用 `crypto.subtle.decrypt` 替代手写 AES（部分保持 RC4），性能与可维护性兼得
- **分块流式 API**：提供 `decryptStream(blob, onChunk)` 避免一次性 `await blob.arrayBuffer()` 占用堆

**预期性能提升**：20MB 文件解密从 8s+ → <2s（视机器）。

### 4.2 桌面布局挤压修复

**原问题**：桌面三栏同开时主卡片压到 33%。

**新实现**：
- **CSS Grid 替代 flex 嵌套**：
  ```css
  .app-grid {
    display: grid;
    grid-template-columns: 240px minmax(480px, 1fr) 360px;
  }
  @media (max-width: 1280px) {
    grid-template-columns: 200px minmax(420px, 1fr);
  }
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;  /* 移动单列 */
  }
  ```
- **主面板最小宽度保护**：`minmax(480px, 1fr)` 确保主面板不被挤到 < 480px
- **AudioResultPanel 改为可折叠**：>1280px 时常驻，<1280px 时收起为底部抽屉

## 5. Mock API 设计

`src/lib/api/mock.ts` 模拟 MiniMax 三个端点：

| 端点 | Mock 行为 | 错误注入 |
|---|---|---|
| `POST /v1/music_generation` | 200-1500ms 延迟，返回 base64 1s 静音 WAV | 10% 概率 500 错误 |
| `POST /v1/lyrics_generation` | 200-500ms，返回模板化歌词 | 5% 概率 429 限流 |
| `POST /v1/music_cover_preprocess` | 500-1000ms，返回元数据 | 8% 概率超时 |

Mock 切换通过 `import.meta.env.VITE_USE_MOCK` 控制（默认 true）。

## 6. 主题系统

- **10 套调色板**（CSS 变量）：warm / fresh / cyberpunk / business / cartoon / minimal / retro / dark / lightgreen / animal
- **4 套完整样式**（独立 CSS 类）：warm、cyberpunk、minimal、lightgreen
- **其余 6 套**：复用 minimal 基础样式 + 调色板变量切换（保证 10 套可切换、视觉上有差异，但不投入完整样式设计）

调色板通过 CSS 变量注入，主题切换 = 根 class 切换。

## 7. 测试策略

| 模块 | 覆盖目标 | 重点 |
|---|---|---|
| `lib/ncm/` | 95% | 解密正确性、性能、错误处理、容器嗅探 |
| `lib/api/` | 90% | Mock 行为、错误注入、错误码分类 |
| `hooks/useAsyncAction` | 90% | 竞态保护、卸载保护、错误传播 |
| `stores/` | 80% | 状态变更、partialize 行为、Blob URL 生命周期 |
| `utils/` | 100% | cn、format、id |

不测：组件快照、E2E 流程、UI 视觉。

## 8. 体验升级

- **骨架屏**：每个 view 加载时显示 Skeleton 卡片
- **错误边界**：每个 view 包裹 `<ErrorBoundary>`，错误信息可重置
- **aria 基础属性**：按钮、对话框、Slider、Switch 补全 aria-label/role
- **键盘导航**：Tab 顺序合理，焦点环可见，Esc 关闭 Dialog
- **加载状态文案**：生成中显示阶段文案（"解析中 → 生成中 → 合成中"）

## 9. 时间预算（≤3h）

| 阶段 | 任务 | 分配 |
|---|---|---|
| 0 | scaffold + 依赖安装 + 配置文件 | 15min |
| 1 | domain + lib/api mock + ncm 核心 | 50min |
| 2 | stores + hooks + ErrorBoundary + Skeleton | 35min |
| 3 | views + components（按业务模块） | 45min |
| 4 | 主题系统 + 布局修复 | 20min |
| 5 | Vitest 配置 + 4 套测试 | 25min |
| 6 | 冒烟测试 + build 验证 + README | 10min |

总计：200min ≈ 3.3h。**最坏情况**超时 20min 内可接受。

## 10. 风险与缓解

| 风险 | 概率 | 缓解 |
|---|---|---|
| NCM 真实样本缺失 | 中 | 用合成二进制构造测试样本覆盖单元测试 |
| 依赖安装慢 | 中 | 提前 `npm install` 在 scaffold 阶段跑 |
| 测试覆盖率不达标 | 中 | 优先保证 ncm 和 api 95%/90%，store 80% 灵活 |
| 主题切换视觉差异小 | 低 | 接受，调色板 + 4 套样式足够区分 |

## 11. 交付物

- `/Users/bytedance/code/self/mm-refactor/` 可独立运行的项目
- `npm install && npm run dev` 启动开发服务器
- `npm test` 运行单元测试
- `npm run build` 生产构建
- `README.md` 启动与架构说明
- 本 spec 文档
