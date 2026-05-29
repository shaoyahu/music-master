import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Key, Disc3 } from 'lucide-react'
import { clsx } from 'clsx'

interface HeaderProps {
  apiKey: string
  onApiKeyChange: (key: string) => void
}

export function Header({ apiKey, onApiKeyChange }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [tempKey, setTempKey] = useState(apiKey)

  const handleSave = () => {
    onApiKeyChange(tempKey)
    setOpen(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempKey(apiKey)
    }
    setOpen(isOpen)
  }

  return (
    <header className="h-16 bg-white/60 backdrop-blur-sm border-b border-warm-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-warm-500 flex items-center justify-center">
          <Disc3 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-warm-900">Music Master</h1>
      </div>

      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Trigger asChild>
          <button
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'bg-warm-100 hover:bg-warm-200',
              'border border-warm-300',
              'transition-colors duration-200'
            )}
          >
            <Key className="w-4 h-4 text-warm-600" />
            <span className="text-sm font-medium text-warm-700">API Key</span>
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-warm-200">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-semibold text-warm-900">
                API Key 设置
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
              请输入您的 API Key 以启用音乐生成功能。
            </Dialog.Description>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="api-key"
                  className="block text-sm font-medium text-warm-700 mb-2"
                >
                  API Key
                </label>
                <input
                  id="api-key"
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="请输入 API Key"
                  className={clsx(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-warm-50 border border-warm-300',
                    'focus:outline-none focus:ring-2 focus:ring-warm-500 focus:border-transparent',
                    'placeholder:text-warm-400'
                  )}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className={clsx(
                    'flex-1 px-4 py-3 rounded-xl',
                    'bg-warm-500 hover:bg-warm-600',
                    'text-white font-medium',
                    'transition-colors duration-200'
                  )}
                >
                  保存
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
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  )
}
