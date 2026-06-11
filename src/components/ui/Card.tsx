import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  actions?: ReactNode
}

export function Card({ children, className, title, description, actions }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-border bg-bg-elevated p-5 shadow-sm',
        'transition-shadow hover:shadow-md',
        className,
      )}
    >
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-fg">{title}</h2>}
            {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
