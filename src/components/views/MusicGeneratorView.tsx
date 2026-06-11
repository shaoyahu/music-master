import { Sparkles } from 'lucide-react'
import { useMusicStore } from '@/stores/musicStore'
import { useMusicGeneration } from '@/hooks/useMusicGeneration'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/hooks/useToast'
import { formatDuration } from '@/lib/utils/format'

const STYLE_OPTIONS = [
  { value: 'pop', label: '流行' },
  { value: 'rock', label: '摇滚' },
  { value: 'electronic', label: '电子' },
  { value: 'classical', label: '古典' },
  { value: 'jazz', label: '爵士' },
  { value: 'folk', label: '民谣' },
  { value: 'rnb', label: 'R&B' },
  { value: 'hiphop', label: '嘻哈' },
]

const FORMAT_OPTIONS = [
  { value: 'url', label: 'URL' },
  { value: 'hex', label: 'Hex' },
]

export function MusicGeneratorView() {
  const { currentParams, setParams, history } = useMusicStore()
  const { run, loading, errorMessage } = useMusicGeneration()
  const { toast, error } = useToast()

  const onGenerate = async () => {
    if (!currentParams.prompt.trim()) {
      error('请输入音乐描述', '描述至少 2 个字符')
      return
    }
    try {
      await run()
      toast('生成成功', '可在右侧播放')
    } catch {
      // 错误已通过 errorMessage 反映
    }
  }

  return (
    <div className="space-y-4">
      <Card
        title="AI 音乐生成"
        description="描述你想要的音乐风格与情绪，AI 将为你生成原创作品（mock）"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="music-prompt" className="block text-sm font-medium text-fg mb-1">
              音乐描述 <span className="text-danger" aria-label="必填">*</span>
            </label>
            <textarea
              id="music-prompt"
              value={currentParams.prompt}
              onChange={(e) => setParams({ prompt: e.target.value })}
              rows={3}
              placeholder="例如：温暖舒缓的钢琴曲，带有轻柔的弦乐伴奏"
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="music-lyrics" className="block text-sm font-medium text-fg mb-1">
              歌词（可选）
            </label>
            <textarea
              id="music-lyrics"
              value={currentParams.lyrics}
              onChange={(e) => setParams({ lyrics: e.target.value })}
              rows={4}
              placeholder="[Verse]&#10;阳光洒在窗台&#10;你轻轻走来"
              className="w-full rounded border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="风格"
              value={currentParams.style ?? 'pop'}
              onChange={(v) => setParams({ style: v as typeof currentParams.style })}
              options={STYLE_OPTIONS}
            />
            <Select
              label="输出格式"
              value={currentParams.format ?? 'url'}
              onChange={(v) => setParams({ format: v as 'url' | 'hex' })}
              options={FORMAT_OPTIONS}
            />
            <div className="flex items-end">
              <Switch
                label="纯器乐（无人声）"
                checked={currentParams.instrumental ?? false}
                onChange={(v) => setParams({ instrumental: v })}
              />
            </div>
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-danger">
              {errorMessage}
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={onGenerate}
            icon={<Sparkles className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            {loading ? '生成中...' : '开始生成'}
          </Button>
        </div>
      </Card>

      <Card title="历史记录" description={`最近 ${history.length} 条`}>
        {loading ? (
          <Skeleton count={3} className="h-12" />
        ) : history.length === 0 ? (
          <p className="text-sm text-fg-muted text-center py-6">暂无历史记录</p>
        ) : (
          <ul className="divide-y divide-border">
            {history.slice(0, 5).map((item) => (
              <li key={item.id} className="py-2 text-sm text-fg">
                <span className="font-mono text-xs text-fg-muted">{item.id}</span>
                <span className="ml-2">{item.format.toUpperCase()} · {formatDuration(item.duration)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
