/**
 * 键盘导航 + 焦点管理
 */
import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !ref.current) return
    const container = ref.current

    const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))

    const initial = getFocusable()
    if (initial.length > 0) initial[0].focus()

    let currentFocusables = initial
    const observer = new MutationObserver(() => {
      currentFocusables = getFocusable()
    })
    observer.observe(container, { childList: true, subtree: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || currentFocusables.length === 0) return
      const first = currentFocusables[0]
      const last = currentFocusables[currentFocusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    container.addEventListener('keydown', onKey)
    return () => {
      container.removeEventListener('keydown', onKey)
      observer.disconnect()
    }
  }, [active])

  return ref
}

export function useEscapeKey(handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handler()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handler, active])
}
