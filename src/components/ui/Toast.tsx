import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils/cn'

const variantStyles = {
  info: 'border-primary/30 bg-primary/5 text-fg',
  success: 'border-success/30 bg-success/5 text-fg',
  error: 'border-danger/30 bg-danger/5 text-fg',
}

const variantIcons = {
  info: Info,
  success: CheckCircle2,
  error: AlertCircle,
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)
  const dismiss = useUIStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div
      role="region"
      aria-label="通知"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((t) => {
        const Icon = variantIcons[t.variant]
        return (
          <div
            key={t.id}
            role="alert"
            className={cn(
              'pointer-events-auto flex w-80 items-start gap-3 rounded border p-3 shadow-lg',
              variantStyles[t.variant],
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-fg-muted">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="关闭通知"
              className="text-fg-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
