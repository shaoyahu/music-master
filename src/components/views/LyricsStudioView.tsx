import { Pen, RefreshCw, Copy } from 'lucide-react'
import { useState } from 'react'
import { useLyricsStore } from '@/stores/lyricsStore'
import { useLyricsGeneration } from '@/hooks/useLyricsGeneration'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { LYRICS_STYLE_LABELS } from '@/domain/lyrics'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils/cn'

const STYLE_OPTIONS = Object.entries(LYRICS_STYLE_LABELS).map(([value, label]) => ({ value, label }))

export function LyricsStudioView() {
  const { params, setParams, current } = useLyricsStore()
  const { run, loading, errorMessage } = useLyricsGeneration()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const onGenerate = async () => {
    if (!params.prompt.trim()) return
    await run()
  }

  const onCopy = async () => {
    if (!current) return
    try {
      await navigator.clipboard.writeText(current.content)
      setCopied(true)
      toast('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('复制失败', '请手动选择文本复制')
    }
  }

  const onContinue = () => {
    if (current) {
      setParams({ mode: 'continue', existing: current.content })
    }
  }

  return (
    <div className="space-y-4">
      <Card title="AI 歌词创作" description="6 种风格，支持整曲创作与续写">
        <div className="space-y-4">
          <div className="flex gap-2" role="tablist" aria-label="创作模式">
            <button
              role="tab"
              aria-selected={params.mode === 'full'}
              onClick={() => setParams({ mode: 'full' })}
              className={cn(
                'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                params.mode === 'full' ? 'bg-primary text-primary-fg' : 'bg-bg-elevated text-fg border border-border',
              )}
            >
              写完整歌曲
            </button>
            <button
              role="tab"
              aria-selected={params.mode === 'continue'}
              onClick={() => setParams({ mode: 'continue' })}
              className={cn(
                'rounded px-3 py-1.5 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                params.mode === 'continue' ? 'bg-primary text-primary-fg' : 'bg-bg-elevated text-fg border border-border',
              )}
            >
              编辑续写
            </button>
          </div>

          <div>
            <label htmlFor="lyrics-prompt" className="block text-sm font-medium text-fg mb-1">
              主题 / 描述 <span className="text-danger" aria-label="必填">*</span>
            </label>
            <textarea
              id="lyrics-prompt"
              value={params.prompt}
              onChange={(e) => setParams({ prompt: e.target.value })}
              rows={3}
              placeholder="例如：夏日海滩的回忆，温暖而略带忧伤"
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <Select
            label="风格"
            value={params.style ?? 'pop'}
            onChange={(v) => setParams({ style: v as typeof params.style })}
            options={STYLE_OPTIONS}
          />

          {errorMessage && (
            <p role="alert" className="text-sm text-danger">
              {errorMessage}
            </p>
          )}

          <Button
            variant="primary"
            loading={loading}
            onClick={onGenerate}
            icon={<Pen className="h-4 w-4" />}
          >
            {loading ? '创作中...' : '开始创作'}
          </Button>
        </div>
      </Card>

      <Card
        title="歌词预览"
        actions={
          current && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={onContinue} icon={<RefreshCw className="h-4 w-4" />}>
                续写
              </Button>
              <Button variant="ghost" size="sm" onClick={onCopy} icon={<Copy className="h-4 w-4" />}>
                {copied ? '已复制' : '复制'}
              </Button>
            </div>
          )
        }
      >
        {loading ? (
          <Skeleton count={6} className="h-4" />
        ) : current ? (
          <pre className="whitespace-pre-wrap font-sans text-sm text-fg leading-relaxed">
            {current.content}
          </pre>
        ) : (
          <p className="text-sm text-fg-muted text-center py-6">点击「开始创作」生成歌词</p>
        )}
      </Card>
    </div>
  )
}
