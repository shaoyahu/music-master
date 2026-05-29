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