import { useState } from 'react'
import { Music, FileMusic, X } from 'lucide-react'

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