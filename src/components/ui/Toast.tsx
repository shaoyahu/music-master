import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { ToastType } from '@/stores/appStore'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'error', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  // Stabilize onClose across re-renders so the dismiss timer isn't reset on parent updates
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  // Tracks the inner "leave animation → onClose" timer. Without this, a
  // leave started by an old toast instance could fire `onClose` (which is
  // a global hideToast) and dismiss a newer toast that replaced it during
  // the 300ms leave window.
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearLeaveTimer = () => {
    if (leaveTimerRef.current !== null) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }

  // Entry animation runs once on mount only. Re-running on `duration`
  // change would briefly re-trigger the slide-in transition even though
  // the toast is already on screen.
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true)
      clearLeaveTimer()
      leaveTimerRef.current = setTimeout(() => {
        onCloseRef.current()
        leaveTimerRef.current = null
      }, 300)
    }, duration)

    return () => {
      clearTimeout(timer)
      clearLeaveTimer()
    }
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    clearLeaveTimer()
    leaveTimerRef.current = setTimeout(() => {
      onCloseRef.current()
      leaveTimerRef.current = null
    }, 300)
  }

  const bgColor = type === 'error' ? 'rgba(239,68,68,0.95)' : type === 'success' ? 'rgba(34,197,94,0.95)' : 'rgba(59,130,246,0.95)'

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] transition-transform duration-300 ${
        isLeaving ? '-translate-y-full' : isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div
        className="mx-4 mt-4 rounded-xl px-4 py-3 flex items-center justify-between shadow-lg"
        style={{ backgroundColor: bgColor, color: '#fff' }}
      >
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}