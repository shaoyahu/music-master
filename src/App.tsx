import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar, type NavKey } from '@/components/layout/Sidebar'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { AudioResultPanel } from '@/components/layout/AudioResultPanel'
import { MusicGeneratorView } from '@/components/views/MusicGeneratorView'
import { LyricsStudioView } from '@/components/views/LyricsStudioView'
import { CoverStudioView } from '@/components/views/CoverStudioView'
import { SettingsView } from '@/components/views/SettingsView'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ToastContainer } from '@/components/ui/Toast'
import { useResponsive } from '@/hooks/useResponsive'
import { applyTheme, getStoredThemeId, getStoredThemeMode } from '@/lib/theme/presets'
import { cn } from '@/lib/utils/cn'

export function App() {
  const [active, setActive] = useState<NavKey>('music')
  const { breakpoint } = useResponsive()
  const isMobile = breakpoint === 'mobile'

  // 启动时应用主题
  useEffect(() => {
    applyTheme(getStoredThemeId(), getStoredThemeMode())
  }, [])

  const renderView = () => {
    switch (active) {
      case 'music':
        return <MusicGeneratorView />
      case 'lyrics':
        return <LyricsStudioView />
      case 'cover':
        return <CoverStudioView />
      case 'settings':
        return <SettingsView />
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header />

      <div
        className={cn(
          'grid',
          isMobile
            ? 'grid-cols-1 pb-16' // 移动单列，留出 Tab Bar 空间
            : 'grid-cols-[200px_minmax(480px,1fr)_360px] xl:grid-cols-[240px_minmax(520px,1fr)_400px]',
        )}
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >
        {!isMobile && <Sidebar active={active} onSelect={setActive} />}

        <main
          role="main"
          className="overflow-y-auto p-4 md:p-6"
          style={{ maxWidth: '100%' }}
        >
          <ErrorBoundary key={active}>{renderView()}</ErrorBoundary>
        </main>

        {!isMobile && (
          <aside className="overflow-y-auto border-l border-border p-4">
            <ErrorBoundary>
              <AudioResultPanel />
            </ErrorBoundary>
          </aside>
        )}
      </div>

      <MobileTabBar active={active} onSelect={setActive} />
      <ToastContainer />
    </div>
  )
}
