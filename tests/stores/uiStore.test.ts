import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUIStore } from '@/stores/uiStore'

describe('useUIStore', () => {
  beforeEach(() => {
    localStorage.clear()
    useUIStore.setState({ toasts: [], apiKey: '' })
  })

  it('has default state', () => {
    const state = useUIStore.getState()
    expect(state.themeId).toBeDefined()
    expect(state.themeMode).toBeDefined()
    expect(state.toasts).toEqual([])
  })

  it('sets API key (memory only)', () => {
    const { setApiKey } = useUIStore.getState()
    setApiKey('sk-test')
    expect(useUIStore.getState().apiKey).toBe('sk-test')
  })

  it('pushes and dismisses toasts', () => {
    const { pushToast, dismissToast } = useUIStore.getState()
    const id = pushToast({ title: 'hello', variant: 'info', durationMs: 0 })
    expect(useUIStore.getState().toasts).toHaveLength(1)
    dismissToast(id)
    expect(useUIStore.getState().toasts).toHaveLength(0)
  })

  it('auto-dismisses toasts with duration', () => {
    vi.useFakeTimers()
    const { pushToast } = useUIStore.getState()
    pushToast({ title: 'temp', variant: 'info', durationMs: 100 })
    expect(useUIStore.getState().toasts).toHaveLength(1)
    vi.advanceTimersByTime(150)
    expect(useUIStore.getState().toasts).toHaveLength(0)
    vi.useRealTimers()
  })

  it('toggles theme mode', () => {
    const initial = useUIStore.getState().themeMode
    useUIStore.getState().toggleThemeMode()
    expect(useUIStore.getState().themeMode).toBe(initial === 'light' ? 'dark' : 'light')
  })
})
