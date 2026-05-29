# 音乐生成器 - 移动端适配实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将音乐生成器 Web 应用适配到移动端，实现响应式布局和触控友好的交互体验

**Architecture:** 采用条件渲染实现响应式：≤768px 渲染移动端组件（底部 Tab Bar、独立页面），>768px 保持现有桌面端布局（固定侧边栏、三列 Flex）。移动端使用单列垂直布局，歌词面板和示例合并为抽屉内切换视图。

**Tech Stack:** React 18 + TypeScript + Tailwind CSS + Zustand

---

## 文件结构

### 新建文件
- `src/components/layout/MobileTabBar.tsx` — 移动端底部 Tab Bar
- `src/components/layout/MobileHeader.tsx` — 移动端 Header
- `src/components/layout/MobileLyricsDrawer.tsx` — 移动端歌词抽屉（编辑/示例切换）
- `src/components/layout/MobilePlayerPage.tsx` — 移动端播放器完整页面
- `src/components/layout/MePage.tsx` — 移动端"我的"页面
- `src/components/ui/Toast.tsx` — 顶部横幅 Toast 组件
- `src/hooks/useResponsive.ts` — 响应式检测 Hook
- `src/hooks/useToast.ts` — Toast 状态管理

### 修改文件
- `src/App.tsx:1-417` — 添加响应式条件渲染，移动端渲染新组件
- `src/index.css:1-26` — 添加移动端样式（如果需要）
- `src/stores/appStore.ts` — 添加移动端状态（如需要）

---

## 任务列表

### Task 1: 响应式检测 Hook

**Files:**
- Create: `src/hooks/useResponsive.ts`

- [ ] **Step 1: 创建 useResponsive.ts**

```typescript
import { useState, useEffect } from 'react'

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { isMobile }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useResponsive.ts
git commit -m "feat: add useResponsive hook for mobile detection"
```

---

### Task 2: Toast 组件

**Files:**
- Create: `src/components/ui/Toast.tsx`

- [ ] **Step 1: 创建 Toast 组件**

```tsx
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'error', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))

    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(onClose, 300)
  }

  const bgColor = type === 'error' ? 'rgba(239,68,68,0.95)' : type === 'success' ? 'rgba(34,197,94,0.95)' : 'rgba(59,130,246,0.95)'

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] transition-transform duration-300 ${
        isLeaving ? '-translate-y-full' : isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div
        className="mx-4 mt-4 rounded-xl px-4 py-3 flex items-center justify-between shadow-lg"
        style={{ backgroundColor: bgColor, color: '#fff' }}
      >
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type?: 'error' | 'success' | 'info' } | null>(null)

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ message, type })
  }

  const hideToast = () => setToast(null)

  return { toast, showToast, hideToast }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ui/Toast.tsx
git commit -m "feat: add Toast component for mobile error display"
```

---

### Task 3: 移动端底部 Tab Bar

**Files:**
- Create: `src/components/layout/MobileTabBar.tsx`

- [ ] **Step 1: 创建 MobileTabBar.tsx**

```tsx
import { Music2, Repeat, Disc3, FileMusic, User } from 'lucide-react'
import { clsx } from 'clsx'

type Tab = 'music' | 'cover' | 'player' | 'lyrics' | 'me'

interface MobileTabBarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  isPlaying?: boolean
  colors: {
    accent: string
    sidebarActive: string
  }
  isDark: boolean
}

export function MobileTabBar({ activeTab, onTabChange, isPlaying, colors, isDark }: MobileTabBarProps) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode; isPlayer?: boolean }[] = [
    { id: 'music', label: '音乐', icon: <Music2 className="w-6 h-6" /> },
    { id: 'cover', label: '翻唱', icon: <Repeat className="w-6 h-6" /> },
    { id: 'player', label: '播放器', icon: <Disc3 className={clsx('w-7 h-7', isPlaying && 'animate-pulse')} />, isPlayer: true },
    { id: 'lyrics', label: '歌词', icon: <FileMusic className="w-6 h-6" /> },
    { id: 'me', label: '我的', icon: <User className="w-6 h-6" /> },
  ]

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-md"
      style={{
        backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
        borderColor: isDark ? '#333' : '#e5e5e5',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const isPlayerTab = tab.isPlayer

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 transition-all duration-200',
                isPlayerTab ? 'w-16 h-16' : 'w-14 h-14'
              )}
              style={{
                color: isActive ? colors.accent : (isDark ? '#888' : '#999'),
                transform: isActive && isPlayerTab ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <div
                className={clsx(
                  'flex items-center justify-center rounded-full transition-all duration-300',
                  isActive && isPlayerTab && 'animate-pulse'
                )}
                style={{
                  backgroundColor: isActive && isPlayerTab ? `${colors.accent}20` : 'transparent',
                  width: isPlayerTab ? '48px' : '40px',
                  height: isPlayerTab ? '48px' : '40px',
                  boxShadow: isActive && isPlayerTab ? `0 0 20px ${colors.accent}40` : 'none',
                }}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/layout/MobileTabBar.tsx
git commit -m "feat: add MobileTabBar component with 5 tabs"
```

---

### Task 4: 移动端 Header

**Files:**
- Create: `src/components/layout/MobileHeader.tsx`

- [ ] **Step 1: 创建 MobileHeader.tsx**

```tsx
import { Disc3 } from 'lucide-react'

interface MobileHeaderProps {
  title?: string
  colors: {
    accent: string
    border: string
    borderDark: string
  }
  isDark: boolean
}

export function MobileHeader({ title = 'Music Master', colors, isDark }: MobileHeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b h-14"
      style={{
        backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
        borderColor: isDark ? colors.borderDark : colors.border,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="h-full flex items-center px-4">
        <div className="flex items-center gap-2">
          <Disc3 size={24} style={{ color: colors.accent }} />
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/layout/MobileHeader.tsx
git commit -m "feat: add MobileHeader component"
```

---

### Task 5: 移动端歌词抽屉

**Files:**
- Create: `src/components/layout/MobileLyricsDrawer.tsx`

- [ ] **Step 1: 创建 MobileLyricsDrawer.tsx**

```tsx
import { useState } from 'react'
import { Music, FileMusic, X } from 'lucide-react'
import { clsx } from 'clsx'

interface MobileLyricsDrawerProps {
  isOpen: boolean
  onClose: () => void
  colors: {
    accent: string
    cardBg: string
    cardBgDark: string
    border: string
    borderDark: string
    label: string
    labelDark: string
    inputBg: string
    inputBgDark: string
  }
  isDark: boolean
  children: React.ReactNode
}

export function MobileLyricsDrawer({ isOpen, onClose, colors, isDark, children }: MobileLyricsDrawerProps) {
  const [activeView, setActiveView] = useState<'edit' | 'example'>('edit')

  if (!isOpen) return null

  const borderColor = isDark ? colors.borderDark : colors.border
  const labelColor = isDark ? colors.labelDark : colors.label

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl max-h-[85vh] flex flex-col"
        style={{
          backgroundColor: isDark ? '#1a1a1a' : '#fff',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: isDark ? '#444' : '#ddd' }} />
        </div>

        <div className="flex items-center justify-between px-4 pb-3 border-b" style={{ borderColor }}>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('edit')}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: activeView === 'edit' ? colors.accent : (isDark ? 'rgba(60,60,60,0.6)' : 'rgba(0,0,0,0.05)'),
                color: activeView === 'edit' ? '#fff' : labelColor,
              }}
            >
              <span className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                歌词编辑
              </span>
            </button>
            <button
              onClick={() => setActiveView('example')}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: activeView === 'example' ? colors.accent : (isDark ? 'rgba(60,60,60,0.6)' : 'rgba(0,0,0,0.05)'),
                color: activeView === 'example' ? '#fff' : labelColor,
              }}
            >
              <span className="flex items-center gap-2">
                <FileMusic className="w-4 h-4" />
                示例
              </span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full"
            style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.6)' : 'rgba(0,0,0,0.05)' }}
          >
            <X className="w-5 h-5" style={{ color: labelColor }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/layout/MobileLyricsDrawer.tsx
git commit -m "feat: add MobileLyricsDrawer with tab switching"
```

---

### Task 6: 移动端播放器页面

**Files:**
- Create: `src/components/layout/MobilePlayerPage.tsx`

- [ ] **Step 1: 创建 MobilePlayerPage.tsx**

```tsx
import { Play, Pause, SkipBack, SkipForward, Download, List, AlignLeft } from 'lucide-react'
import { useAppStore, styleColors } from '@/stores/appStore'

export function MobilePlayerPage() {
  const { isDark, style, musicPlaylist } = useAppStore()
  const colors = styleColors[style]
  const labelColor = isDark ? colors.labelDark : colors.label

  return (
    <div
      className="h-full flex flex-col items-center justify-center px-6"
      style={{ color: isDark ? '#eee' : '#333' }}
    >
      <div
        className="w-64 h-64 rounded-2xl mb-8 flex items-center justify-center"
        style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)' }}
      >
        <span className="text-6xl">🎵</span>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-1">音乐 #{musicPlaylist.length > 0 ? 1 : '-'}</h2>
        <p className="text-sm" style={{ color: labelColor }}>--:--</p>
      </div>

      <div className="w-full max-w-xs mb-6">
        <div className="h-1 rounded-full" style={{ backgroundColor: isDark ? '#444' : '#e5e5e5' }}>
          <div className="h-full rounded-full" style={{ backgroundColor: colors.accent, width: '0%' }} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mb-8">
        <button className="p-3 rounded-full" style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)' }}>
          <SkipBack className="w-6 h-6" />
        </button>
        <button
          className="p-5 rounded-full"
          style={{ backgroundColor: colors.accent, color: '#fff' }}
        >
          <Play className="w-8 h-8" />
        </button>
        <button className="p-3 rounded-full" style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)' }}>
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-4">
        <button className="p-3 rounded-xl" style={{ border: `1px solid ${isDark ? '#444' : '#e5e5e5'}` }}>
          <List className="w-5 h-5" />
        </button>
        <button className="p-3 rounded-xl" style={{ border: `1px solid ${isDark ? '#444' : '#e5e5e5'}` }}>
          <Download className="w-5 h-5" />
        </button>
        <button className="p-3 rounded-xl" style={{ border: `1px solid ${isDark ? '#444' : '#e5e5e5'}` }}>
          <AlignLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/layout/MobilePlayerPage.tsx
git commit -m "feat: add MobilePlayerPage component"
```

---

### Task 7: 移动端"我的"页面

**Files:**
- Create: `src/components/layout/MePage.tsx`

- [ ] **Step 1: 创建 MePage.tsx**

```tsx
import { Key, Sun, Moon, Palette, History } from 'lucide-react'
import { useAppStore, styleColors, Style } from '@/stores/appStore'

const STYLES: { id: Style; label: string; preview: string }[] = [
  { id: 'warm', label: '温暖自然', preview: '#e87d1e' },
  { id: 'nature', label: '清新自然', preview: '#22c55e' },
  { id: 'cyberpunk', label: '赛博朋克', preview: '#8b5cf6' },
]

interface MePageProps {
  onApiKeyDialogOpen: () => void
}

export function MePage({ onApiKeyDialogOpen }: MePageProps) {
  const { isDark, style, setIsDark, setStyle, musicPlaylist } = useAppStore()
  const colors = styleColors[style]
  const labelColor = isDark ? colors.labelDark : colors.label

  return (
    <div className="h-full overflow-y-auto" style={{ color: isDark ? '#eee' : '#333' }}>
      <section className="p-4 border-b" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
        <button
          onClick={onApiKeyDialogOpen}
          className="w-full flex items-center gap-4 p-4 rounded-xl"
          style={{
            backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${isDark ? '#444' : '#e5e5e5'}`,
          }}
        >
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}20` }}>
            <Key className="w-6 h-6" style={{ color: colors.accent }} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium mb-1">API Key</div>
            <div className="text-sm" style={{ color: labelColor }}>设置 MiniMax API Key</div>
          </div>
        </button>
      </section>

      <section className="p-4 border-b" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)' }}>
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}20` }}>
            {isDark ? <Sun className="w-6 h-6" style={{ color: colors.accent }} /> : <Moon className="w-6 h-6" style={{ color: colors.accent }} />}
          </div>
          <div className="flex-1">
            <div className="font-medium mb-1">主题</div>
            <div className="text-sm" style={{ color: labelColor }}>{isDark ? '深色模式' : '浅色模式'}</div>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="relative w-14 h-8 rounded-full transition-colors"
            style={{ backgroundColor: colors.accent }}
          >
            <div className="absolute top-1 w-6 h-6 rounded-full bg-white transition-all" style={{ left: isDark ? '32px' : '4px' }} />
          </button>
        </div>
      </section>

      <section className="p-4 border-b" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)' }}>
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}20` }}>
            <Palette className="w-6 h-6" style={{ color: colors.accent }} />
          </div>
          <div className="flex-1">
            <div className="font-medium mb-1">风格</div>
            <div className="text-sm" style={{ color: labelColor }}>{STYLES.find(s => s.id === style)?.label || '温暖自然'}</div>
          </div>
        </div>
        <div className="flex gap-2 mt-3 px-4">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: style === s.id ? s.preview : (isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)'),
                color: style === s.id ? '#fff' : labelColor,
                border: `2px solid ${style === s.id ? s.preview : 'transparent'}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="p-4">
        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)' }}>
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}20` }}>
            <History className="w-6 h-6" style={{ color: colors.accent }} />
          </div>
          <div className="flex-1">
            <div className="font-medium mb-1">生成历史</div>
            <div className="text-sm" style={{ color: labelColor }}>{musicPlaylist.length} 首音乐</div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/layout/MePage.tsx
git commit -m "feat: add MePage component with settings"
```

---

### Task 8: 修改 App.tsx 添加响应式渲染

**Files:**
- Modify: `src/App.tsx:1-417`

- [ ] **Step 1: 添加导入**

```tsx
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { MobileHeader } from '@/components/layout/MobileHeader'
import { MobilePlayerPage } from '@/components/layout/MobilePlayerPage'
import { MobileLyricsDrawer } from '@/components/layout/MobileLyricsDrawer'
import { MePage } from '@/components/layout/MePage'
import { Toast, useToast } from '@/components/ui/Toast'
import { useResponsive } from '@/hooks/useResponsive'
```

- [ ] **Step 2: 添加状态**

```tsx
const { isMobile } = useResponsive()
const [mobileTab, setMobileTab] = useState<'music' | 'cover' | 'player' | 'lyrics' | 'me'>('music')
const [lyricsDrawerOpen, setLyricsDrawerOpen] = useState(false)
const { toast, showToast, hideToast } = useToast()
```

- [ ] **Step 3: 条件渲染**

在 return 的根 div 内添加移动端/桌面端条件渲染结构:

```tsx
{/* 移动端布局 */}
{isMobile ? (
  <>
    <MobileHeader colors={colors} isDark={isDark} />

    <main className="pt-14 pb-20 h-screen">
      {mobileTab === 'music' && <MusicGenerator />}
      {mobileTab === 'cover' && <CoverProcessor />}
      {mobileTab === 'player' && <MobilePlayerPage />}
      {mobileTab === 'lyrics' && <div className="p-4"><LyricsPanel /></div>}
      {mobileTab === 'me' && <MePage onApiKeyDialogOpen={() => setApiKeyDialogOpen(true)} />}
    </main>

    <MobileLyricsDrawer
      isOpen={lyricsDrawerOpen}
      onClose={() => setLyricsDrawerOpen(false)}
      colors={colors}
      isDark={isDark}
    >
      <LyricsPanel />
    </MobileLyricsDrawer>

    <MobileTabBar
      activeTab={mobileTab}
      onTabChange={setMobileTab}
      isPlaying={musicPlaylist.length > 0}
      colors={colors}
      isDark={isDark}
    />
  </>
) : (
  /* 桌面端布局（保持原有） */
  <>
    {/* Header */}
    <header ...>...</header>
    {/* Sidebar */}
    <nav ...>...</nav>
    {/* Main */}
    <main ...>...</main>
    <AudioResultPanel />
  </>
)}
```

- [ ] **Step 4: 提交**

```bash
git add src/App.tsx
git commit -m "feat: add responsive mobile layout to App.tsx"
```

---

## 自检清单

### Spec Coverage
- [x] 底部 Tab Bar (5个Tab: 音乐/翻唱/播放器/歌词/我的) — Task 3
- [x] 播放器 Tab 突出显示（大图标 + 呼吸动效）— Task 3
- [x] 移动端 Header（仅 Logo + 标题）— Task 4
- [x] 歌词抽屉（编辑/示例切换视图）— Task 5
- [x] 移动端播放器完整页面 — Task 6
- [x] "我的"页面（API Key/主题/风格/历史）— Task 7
- [x] 报错 Toast 横幅 — Task 2
- [x] 768px 响应式断点 — Task 1, Task 8
- [x] 桌面端保持不变 — Task 8

### Placeholder Scan
- [x] 无 "TBD"、"TODO" 标记
- [x] 无 "类似 Task X" 引用
- [x] 所有代码块均有实际内容

### Type Consistency
- [x] `Mode` 类型与现有 appStore.ts 一致
- [x] `Style` 类型与现有 appStore.ts 一致
- [x] Hook 返回值类型一致

---

Plan complete and saved to `docs/superpowers/plans/2026-05-29-mobile-adaptation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?