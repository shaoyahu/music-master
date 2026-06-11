import { useUIStore } from '@/stores/uiStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, type SelectOption } from '@/components/ui/Select'
import { ALL_THEME_IDS, THEME_LABELS, type ThemeId } from '@/lib/theme/palette'
import { THEMES_WITH_FULL_STYLES } from '@/lib/theme/palette'
import { useToast } from '@/hooks/useToast'

const themeOptions: SelectOption[] = ALL_THEME_IDS.map((id) => ({
  value: id,
  label: `${THEME_LABELS[id]}${THEMES_WITH_FULL_STYLES.includes(id) ? ' ✦' : ''}`,
}))

export function SettingsView() {
  const { themeId, themeMode, setTheme, setThemeMode, apiKey, setApiKey } = useUIStore()
  const { toast } = useToast()

  return (
    <div className="space-y-4">
      <Card title="外观" description="主题与显示模式">
        <div className="space-y-4">
          <Select
            label="主题"
            value={themeId}
            onChange={(v) => setTheme(v as ThemeId)}
            options={themeOptions}
          />
          <p className="text-xs text-fg-muted">
            带 ✦ 标记的主题拥有完整独立样式，其他主题复用基础样式 + 调色板变量。
          </p>

          <Select
            label="显示模式"
            value={themeMode}
            onChange={(v) => setThemeMode(v as 'light' | 'dark')}
            options={[
              { value: 'light', label: '亮色' },
              { value: 'dark', label: '暗色' },
            ]}
          />
        </div>
      </Card>

      <Card title="API Key" description="仅在内存中保存，不写入 localStorage">
        <div className="space-y-3">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-fg mb-1">
              MiniMax API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <p className="mt-1 text-xs text-fg-muted">
              当前使用 Mock 后端，填入 Key 后可切换到真实 API。
            </p>
          </div>
        </div>
      </Card>

      <Card title="关于" description="Music Master v2 重构版">
        <div className="space-y-2 text-sm text-fg-muted">
          <p>技术栈：React 18 + Vite 6 + TypeScript 5.6 (strict) + Tailwind 3 + Zustand 5 + Radix UI</p>
          <p>后端：Mock（错误注入 + 延迟模拟）</p>
          <p>原始项目：shaoyahu/music-master (MIT)</p>
          <p className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast('链接已复制')
              }}
            >
              复制当前 URL
            </Button>
          </p>
        </div>
      </Card>
    </div>
  )
}
