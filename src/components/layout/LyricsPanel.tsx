import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface LyricsPanelProps {
  open: boolean
  onClose: (open: boolean) => void
}

export function LyricsPanel({ open, onClose }: LyricsPanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] shadow-xl border border-warm-200 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-warm-900">
              歌词生成
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-1 rounded-lg hover:bg-warm-100 transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5 text-warm-500" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-sm text-warm-600 mb-4">
            输入主题或关键词来生成歌词。
          </Dialog.Description>

          <div className="flex-1 overflow-auto">
            <textarea
              placeholder="请输入歌词主题或关键词..."
              className={clsx(
                'w-full h-48 px-4 py-3 rounded-xl resize-none',
                'bg-warm-50 border border-warm-300',
                'focus:outline-none focus:ring-2 focus:ring-warm-500 focus:border-transparent',
                'placeholder:text-warm-400'
              )}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              className={clsx(
                'flex-1 px-4 py-3 rounded-xl',
                'bg-warm-500 hover:bg-warm-600',
                'text-white font-medium',
                'transition-colors duration-200'
              )}
            >
              生成歌词
            </button>
            <Dialog.Close asChild>
              <button
                className={clsx(
                  'flex-1 px-4 py-3 rounded-xl',
                  'bg-warm-100 hover:bg-warm-200',
                  'text-warm-700 font-medium',
                  'transition-colors duration-200'
                )}
              >
                取消
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
