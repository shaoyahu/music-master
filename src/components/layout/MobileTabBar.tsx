import { Music, FileText, Mic, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useResponsive } from '@/hooks/useResponsive'
import type { NavKey } from './Sidebar'

const items: { key: NavKey; label: string; icon: typeof Music }[] = [
  { key: 'music', label: '音乐', icon: Music },
  { key: 'lyrics', label: '歌词', icon: FileText },
  { key: 'cover', label: '翻唱', icon: Mic },
  { key: 'settings', label: '设置', icon: Settings },
]

interface MobileTabBarProps {
  active: NavKey
  onSelect: (key: NavKey) => void
}

export function MobileTabBar({ active, onSelect }: MobileTabBarProps) {
  const { breakpoint } = useResponsive()
  if (breakpoint !== 'mobile') return null

  return (
    <nav
      role="navigation"
      aria-label="移动端导航"
      className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-bg-elevated pb-safe"
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = active === item.key
        return (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isActive ? 'text-primary' : 'text-fg-muted',
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
