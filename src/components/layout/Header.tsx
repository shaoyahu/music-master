import { Moon, Sun, Github, Music2 } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'
import { Select, type SelectOption } from '@/components/ui/Select'
import { ALL_THEME_IDS, THEME_LABELS, type ThemeId } from '@/lib/theme/palette'

const themeOptions: SelectOption[] = ALL_THEME_IDS.map((id) => ({
  value: id,
  label: THEME_LABELS[id],
}))

export function Header() {
  const themeId = useUIStore((s) => s.themeId)
  const themeMode = useUIStore((s) => s.themeMode)
  const setTheme = useUIStore((s) => s.setTheme)
  const toggleThemeMode = useUIStore((s) => s.toggleThemeMode)

  return (
    <header
      role="banner"
      className="flex items-center justify-between border-b border-border bg-bg-elevated px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <Music2 className="h-6 w-6 text-primary" aria-hidden />
        <h1 className="text-lg font-bold text-fg">Music Master v2</h1>
        <span className="hidden text-xs text-fg-muted sm:inline">AI 音乐创作平台（重构版）</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:block w-40">
          <Select
            aria-label="选择主题"
            value={themeId}
            onChange={(v) => setTheme(v as ThemeId)}
            options={themeOptions}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleThemeMode}
          aria-label={themeMode === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
        >
          {themeMode === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open('https://github.com/shaoyahu/music-master', '_blank')}
          aria-label="查看原项目"
        >
          <Github className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
