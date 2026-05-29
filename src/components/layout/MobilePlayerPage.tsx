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