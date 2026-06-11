/**
 * UI 状态 store
 * 主题/暗色模式/侧栏/Toast
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { genId } from '@/lib/utils/id'
import type { ThemeId } from '@/lib/theme/palette'
import type { ThemeMode } from '@/lib/theme/presets'
import { applyTheme, getStoredThemeId, getStoredThemeMode, persistThemeId, persistThemeMode } from '@/lib/theme/presets'
import { rebuildApiContainer } from '@/lib/api'

export interface Toast {
  id: string
  title: string
  description?: string
  variant: 'info' | 'success' | 'error'
  durationMs: number
}

interface UIState {
  themeId: ThemeId
  themeMode: ThemeMode
  sidebarOpen: boolean
  apiKey: string
  toasts: Toast[]

  setTheme: (id: ThemeId) => void
  setThemeMode: (mode: ThemeMode) => void
  toggleThemeMode: () => void
  setSidebarOpen: (open: boolean) => void
  setApiKey: (key: string) => void
  pushToast: (toast: Omit<Toast, 'id'>) => string
  dismissToast: (id: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      themeId: getStoredThemeId(),
      themeMode: getStoredThemeMode(),
      sidebarOpen: true,
      apiKey: '',
      toasts: [],

      setTheme: (id) => {
        set({ themeId: id })
        persistThemeId(id)
        applyTheme(id, get().themeMode)
      },

      setThemeMode: (mode) => {
        set({ themeMode: mode })
        persistThemeMode(mode)
        applyTheme(get().themeId, mode)
      },

      toggleThemeMode: () => {
        const next = get().themeMode === 'light' ? 'dark' : 'light'
        get().setThemeMode(next)
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setApiKey: (key) => {
        set({ apiKey: key })
        rebuildApiContainer(key)
      },

      pushToast: (toast) => {
        const id = genId('toast')
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
        if (toast.durationMs > 0) {
          setTimeout(() => {
            get().dismissToast(id)
          }, toast.durationMs)
        }
        return id
      },

      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'mm.ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        themeId: state.themeId,
        themeMode: state.themeMode,
        sidebarOpen: state.sidebarOpen,
        // apiKey 故意不持久化（安全考虑）
      }),
      merge: (persisted, current) => {
        const next = { ...current, ...(persisted as Partial<UIState>) }
        return next
      },
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.themeId, state.themeMode)
      },
    },
  ),
)
