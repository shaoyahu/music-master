import { useState, useCallback, useEffect } from 'react'
import { Play, Pause, Download, ExternalLink, CheckCircle } from 'lucide-react'
import { useAppStore, styleColors } from '@/stores/appStore'

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function CoverResultCard() {
  const { audioUrl, musicDuration, clearAudioResult, isDark, style } = useAppStore()
  const colors = styleColors[style]
  const borderColor = isDark ? colors.borderDark : colors.border
  const labelColor = isDark ? colors.labelDark : colors.label
  const inputBg = isDark ? colors.inputBgDark : colors.inputBg

  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  // Reset error when audioUrl changes
  useEffect(() => {
    if (audioUrl) {
      setAudioError(null)
    }
  }, [audioUrl])

  const handlePlayPause = useCallback(() => {
    const audio = document.getElementById('cover-audio') as HTMLAudioElement
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(err => {
        console.error('Play failed:', err, 'URL:', audio.src)
        setAudioError(`播放失败: ${err.message || '未知错误'}`)
      })
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = document.getElementById('cover-audio') as HTMLAudioElement
    if (!audio) return
    // Use audio.duration if available, otherwise fallback to musicDuration (in seconds)
    const duration = audio.duration || (musicDuration ? musicDuration / 1000 : 0)
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audio.currentTime = percent * duration
  }, [musicDuration])

  const handleDownload = useCallback(async () => {
    if (!audioUrl) return
    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `cover-${Date.now()}.mp3`
      a.click()
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Download failed:', err)
      // Fallback: open in new tab
      window.open(audioUrl, '_blank')
    }
  }, [audioUrl])

  const hasAudio = audioUrl && audioUrl.length > 0

  if (!hasAudio) return null

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: inputBg,
        borderColor: borderColor,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" style={{ color: colors.accent }} />
          <span style={{ color: labelColor, fontWeight: 600, fontSize: '15px' }}>
            翻唱生成成功
          </span>
          {musicDuration && (
            <span style={{ color: isDark ? '#666' : '#b45309', fontSize: '13px' }}>
              {formatDuration(musicDuration)}
            </span>
          )}
        </div>
        <button
          onClick={clearAudioResult}
          style={{
            color: isDark ? '#666' : '#b45309',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          清除
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayPause}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: colors.accent,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" style={{ marginLeft: '2px' }} />
          )}
        </button>

        <div className="flex-1">
          <audio
            id="cover-audio"
            src={hasAudio ? audioUrl : undefined}
            style={{ display: 'none' }}
            preload="none"
            onTimeUpdate={(e) => {
              const audio = e.target as HTMLAudioElement
              const progress = document.getElementById('cover-progress') as HTMLDivElement
              if (progress && audio.duration) {
                progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`
              }
            }}
            onLoadedMetadata={(e) => {
              const audio = e.target as HTMLAudioElement
              const durationEl = document.getElementById('cover-duration')
              if (durationEl && audio.duration) {
                durationEl.textContent = formatDuration(Math.floor(audio.duration))
              }
            }}
            onEnded={() => setIsPlaying(false)}
            onError={(e) => {
              const audio = e.target as HTMLAudioElement
              const errorMsg = `Audio load error: ${audio.error?.message || 'unknown'}, src: ${audio.src}`
              console.error(errorMsg)
              setAudioError(errorMsg)
            }}
          />
          <div
            id="cover-progress"
            style={{
              height: '6px',
              borderRadius: '3px',
              backgroundColor: isDark ? '#444' : '#e5e5e5',
              width: '0%',
              transition: 'width 0.1s',
              cursor: 'pointer',
            }}
            onClick={handleProgressClick}
          />
          <div className="flex justify-between mt-1" style={{ fontSize: '12px', color: isDark ? '#666' : '#b45309' }}>
            <span id="cover-current">0:00</span>
            <span id="cover-duration">--:--</span>
          </div>
        </div>

        {hasAudio && (
          <a
            href={audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: `2px solid ${borderColor}`,
              backgroundColor: isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)',
              color: labelColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        {hasAudio && (
          <button
            onClick={handleDownload}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: `2px solid ${borderColor}`,
              backgroundColor: isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)',
              color: labelColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Download className="h-4 w-4" />
          </button>
        )}
      </div>

      {audioError && (
        <div className="mt-3 text-xs" style={{ color: '#ef4444' }}>
          ⚠️ {audioError}
        </div>
      )}
    </div>
  )
}