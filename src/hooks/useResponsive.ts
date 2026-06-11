/**
 * 响应式断点检测（防抖 150ms）
 */
import { useEffect, useRef, useState } from 'react'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide'

const BREAKPOINTS: Record<Breakpoint, number> = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
}

const DEBOUNCE_MS = 150

export function useResponsive(): { breakpoint: Breakpoint; width: number } {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? 1024 : window.innerWidth,
  )
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onResize = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setWidth(window.innerWidth), DEBOUNCE_MS)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  let breakpoint: Breakpoint = 'mobile'
  if (width >= BREAKPOINTS.wide) breakpoint = 'wide'
  else if (width >= BREAKPOINTS.desktop) breakpoint = 'desktop'
  else if (width >= BREAKPOINTS.tablet) breakpoint = 'tablet'

  return { breakpoint, width }
}
