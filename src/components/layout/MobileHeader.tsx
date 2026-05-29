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