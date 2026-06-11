import { Play, Pause, X, Download } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useMusicStore } from '@/stores/musicStore'
import { useCoverStore } from '@/stores/coverStore'
import { formatDuration } from '@/lib/utils/format'
import { Button } from '@/components/ui/Button'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils/cn'

export function AudioResultPanel() {
  const musicResult = useMusicStore((s) => s.currentResult)
  const clearMusic = useMusicStore((s) => s.clearResult)
  const coverResult = useCoverStore((s) => s.genResult)
  const clearCover = useCoverStore((s) => s.clearAll)

  const result = musicResult ?? coverResult
  const onClear = musicResult ? clearMusic : clearCover

  const { breakpoint } = useResponsive()
  const isCollapsedView = breakpoint !== 'wide'

  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    const onEnd = () => {
      setPlaying(false)
      setProgress(0)
    }
    const onMeta = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('loadedmetadata', onMeta)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('loadedmetadata', onMeta)
    }
  }, [result?.id])

  if (!result) {
    if (isCollapsedView) return null
    return (
      <aside
        role="complementary"
        aria-label="音频结果"
        className="rounded-lg border border-dashed border-border bg-bg-elevated/50 p-4"
      >
        <p className="text-sm text-fg-muted text-center">生成结果会显示在这里</p>
      </aside>
    )
  }

  return (
    <aside
      role="complementary"
      aria-label="音频结果"
      className={cn(
        'rounded-lg border border-border bg-bg-elevated p-4 shadow-sm',
        isCollapsedView && 'fixed bottom-16 left-2 right-2 z-20',
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fg">已生成</h3>
        <button
          onClick={onClear}
          aria-label="清除结果"
          className="rounded p-1 text-fg-muted hover:bg-bg hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <audio ref={audioRef} src={result.audioUrl} preload="auto" />

      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (playing) audioRef.current?.pause()
            else audioRef.current?.play()
            setPlaying(!playing)
          }}
          icon={playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          aria-label={playing ? '暂停' : '播放'}
        >
          {playing ? '暂停' : '播放'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const a = document.createElement('a')
            a.href = result.audioUrl
            a.download = `${result.id}.wav`
            a.rel = 'noopener'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          }}
          icon={<Download className="h-4 w-4" />}
          aria-label="下载音频"
        >
          下载
        </Button>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="mt-1 text-xs text-fg-muted">
        {formatDuration((progress / 100) * (audioRef.current?.duration ?? musicResult?.duration ?? 0))}
      </p>
    </aside>
  )
}
