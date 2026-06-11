/**
 * Toast hook（薄封装 uiStore）
 */
import { useUIStore } from '@/stores/uiStore'

export function useToast() {
  const pushToast = useUIStore((s) => s.pushToast)
  const dismissToast = useUIStore((s) => s.dismissToast)

  return {
    toast: (title: string, description?: string) =>
      pushToast({ title, description, variant: 'info', durationMs: 3000 }),
    success: (title: string, description?: string) =>
      pushToast({ title, description, variant: 'success', durationMs: 3000 }),
    error: (title: string, description?: string) =>
      pushToast({ title, description, variant: 'error', durationMs: 5000 }),
    dismiss: dismissToast,
  }
}
