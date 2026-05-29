import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'error', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))

    const timer = setTimeout(() => {
      setIsLeaving(true)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(onClose, 300)
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

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type?: 'error' | 'success' | 'info' } | null>(null)

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ message, type })
  }

  const hideToast = () => setToast(null)

  return { toast, showToast, hideToast }
}