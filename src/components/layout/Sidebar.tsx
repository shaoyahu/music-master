import { Music, Mic2, Upload } from 'lucide-react'
import { clsx } from 'clsx'

type Mode = 'music' | 'lyrics' | 'cover'

interface SidebarProps {
  mode: Mode
  onModeChange: (mode: Mode) => void
  onLyricsPanelOpen: () => void
}

interface NavButton {
  id: Mode
  label: string
  icon: React.ReactNode
  onClick: () => void
}

export function Sidebar({ mode, onModeChange, onLyricsPanelOpen }: SidebarProps) {
  const navButtons: NavButton[] = [
    {
      id: 'music',
      label: '音乐生成',
      icon: <Music className="w-5 h-5" />,
      onClick: () => onModeChange('music'),
    },
    {
      id: 'lyrics',
      label: '歌词生成',
      icon: <Mic2 className="w-5 h-5" />,
      onClick: onLyricsPanelOpen,
    },
    {
      id: 'cover',
      label: '翻唱处理',
      icon: <Upload className="w-5 h-5" />,
      onClick: () => onModeChange('cover'),
    },
  ]

  return (
    <aside className="w-56 bg-white/60 backdrop-blur-sm border-r border-warm-200 flex flex-col py-4">
      <nav className="flex flex-col gap-2 px-3">
        {navButtons.map((button) => (
          <button
            key={button.id}
            onClick={button.onClick}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl',
              'transition-all duration-200',
              mode === button.id && button.id !== 'lyrics'
                ? 'bg-warm-500 text-white shadow-md'
                : 'text-warm-700 hover:bg-warm-100'
            )}
          >
            <span
              className={clsx(
                mode === button.id && button.id !== 'lyrics'
                  ? 'text-white'
                  : 'text-warm-500'
              )}
            >
              {button.icon}
            </span>
            <span className="font-medium">{button.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
