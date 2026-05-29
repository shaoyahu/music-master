import { Key, Sun, Moon, Palette, History, Info } from 'lucide-react'
import { useAppStore, styleColors, Style } from '@/stores/appStore'

const STYLES: { id: Style; label: string; preview: string }[] = [
  { id: 'warm', label: '温暖自然', preview: '#e87d1e' },
  { id: 'nature', label: '清新自然', preview: '#22c55e' },
  { id: 'cyberpunk', label: '赛博朋克', preview: '#8b5cf6' },
  { id: 'blue', label: '蓝色', preview: '#3b82f6' },
  { id: 'cartoon', label: '卡通', preview: '#eab308' },
  { id: 'minimal', label: '简约', preview: '#404040' },
  { id: 'retro', label: '复古', preview: '#c2410c' },
  { id: 'dark', label: '暗黑', preview: '#71717a' },
  { id: 'pink', label: '粉色', preview: '#86efac' },
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
        <div className="mt-3 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className="flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: style === s.id ? s.preview : (isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)'),
                  color: style === s.id ? '#fff' : labelColor,
                  border: `2px solid ${style === s.id ? s.preview : 'transparent'}`,
                  minWidth: '80px',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="p-4 border-b" style={{ borderColor: isDark ? '#333' : '#e5e5e5' }}>
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

      <section className="p-4">
        <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)' }}>
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}20` }}>
            <Info className="w-6 h-6" style={{ color: colors.accent }} />
          </div>
          <div className="flex-1">
            <div className="font-medium mb-1">关于</div>
            <div className="text-sm" style={{ color: labelColor }}>Music Master v1.0.0</div>
          </div>
        </div>
      </section>
    </div>
  )
}