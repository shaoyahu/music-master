import { Music, FileText, Mic, Settings } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useResponsive } from '@/hooks/useResponsive'

export type NavKey = 'music' | 'lyrics' | 'cover' | 'settings'

interface SidebarProps {
  active: NavKey
  onSelect: (key: NavKey) => void
}

const items: { key: NavKey; label: string; icon: typeof Music }[] = [
  { key: 'music', label: '音乐生成', icon: Music },
  { key: 'lyrics', label: '歌词创作', icon: FileText },
  { key: 'cover', label: '翻唱处理', icon: Mic },
  { key: 'settings', label: '设置', icon: Settings },
]

export function Sidebar({ active, onSelect }: SidebarProps) {
  const { breakpoint } = useResponsive()
  const isMobile = breakpoint === 'mobile'

  if (isMobile) return null

  return (
    <nav
      role="navigation"
      aria-label="主导航"
      className="flex flex-col gap-1 border-r border-border bg-bg-elevated p-3"
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
              'flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isActive
                ? 'bg-primary text-primary-fg'
                : 'text-fg hover:bg-bg',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
