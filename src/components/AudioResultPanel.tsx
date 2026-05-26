import { useState, useCallback, useEffect } from 'react'
import { Play, Pause, X, Download, ExternalLink } from 'lucide-react'
import { useAppStore, styleColors } from '@/stores/appStore'

export function AudioResultPanel() {
  const { audioUrl, clearAudioResult, isDark, style } = useAppStore()
  const colors = styleColors[style]
  const labelColor = isDark ? colors.labelDark : colors.label

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (audioUrl) {
      setIsPlaying(false)
      setProgress(0)
      setIsExpanded(false)
    }
  }, [audioUrl])

  const audioId = 'floating-audio'

  const handlePlayPause = useCallback(() => {
    const audio = document.getElementById(audioId) as HTMLAudioElement
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = document.getElementById(audioId) as HTMLAudioElement
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audio.currentTime = percent * audio.duration
  }, [])

  const handleMainButtonClick = useCallback(() => {
    if (isExpanded) {
      // If expanded and playing, pause
      if (isPlaying) {
        const audio = document.getElementById(audioId) as HTMLAudioElement
        if (audio) audio.pause()
        setIsPlaying(false)
      } else {
        // If expanded and not playing, play
        const audio = document.getElementById(audioId) as HTMLAudioElement
        if (audio) {
          audio.play().catch(console.error)
          setIsPlaying(true)
        }
      }
    } else {
      // Expand the panel
      setIsExpanded(true)
    }
  }, [isExpanded, isPlaying])

  const handleDownload = useCallback(async () => {
    if (!audioUrl) return
    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `music-${Date.now()}.mp3`
      a.click()
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Download failed:', err)
      window.open(audioUrl, '_blank')
    }
  }, [audioUrl])

  if (!audioUrl) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 50,
      }}
    >
      <audio
        id={audioId}
        src={audioUrl}
        style={{ display: 'none' }}
        preload="metadata"
        onTimeUpdate={(e) => {
          const audio = e.target as HTMLAudioElement
          if (audio.duration) {
            setProgress((audio.currentTime / audio.duration) * 100)
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Compact View - Small Circle */}
      {!isExpanded && (
        <button
          onClick={handleMainButtonClick}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: colors.accent,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 20px ${colors.accent}60`,
            transition: 'all 0.2s',
          }}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" style={{ marginLeft: '2px' }} />
          )}
        </button>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div
          className="rounded-2xl p-4 border"
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? colors.borderDark : colors.border,
            backdropFilter: 'blur(12px)',
            width: '280px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.2)`,
            zIndex: 100,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: colors.accent,
                }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#eee' : '#333' }}>
                正在播放
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X className="h-4 w-4" style={{ color: isDark ? '#888' : '#666' }} />
            </button>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              height: '4px',
              borderRadius: '2px',
              backgroundColor: isDark ? '#444' : '#e5e5e5',
              cursor: 'pointer',
              marginBottom: '8px',
            }}
            onClick={handleProgressClick}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: colors.accent,
                borderRadius: '2px',
                transition: 'width 0.1s',
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handlePlayPause}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: colors.accent,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" style={{ marginLeft: '2px' }} />
              )}
            </button>

            <button
              onClick={handleDownload}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#444' : '#e5e5e5'}`,
                backgroundColor: 'transparent',
                color: labelColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Download className="h-5 w-5" />
            </button>

            <a
              href={audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#444' : '#e5e5e5'}`,
                backgroundColor: 'transparent',
                color: labelColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              <ExternalLink className="h-5 w-5" />
            </a>

            <button
              onClick={clearAudioResult}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#444' : '#e5e5e5'}`,
                backgroundColor: 'transparent',
                color: isDark ? '#888' : '#666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}