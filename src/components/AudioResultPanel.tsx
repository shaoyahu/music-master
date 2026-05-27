import { useState, useCallback, useEffect } from 'react'
import { Play, Pause, Download, ExternalLink, List, Music2, ChevronLeft, AlignLeft, X, Trash2 } from 'lucide-react'
import { useAppStore, styleColors } from '@/stores/appStore'

export function AudioResultPanel() {
  const { audioUrl, audioResultPanelOpen, setAudioResultPanelOpen, lyricsPanelShow, setLyricsPanelShow, isDark, style, musicPlaylist, removeFromMusicPlaylist } = useAppStore()
  const colors = styleColors[style]
  const labelColor = isDark ? colors.labelDark : colors.label

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get current audio from playlist or current audioUrl
  const currentTrack = musicPlaylist[currentIndex] || (audioUrl ? { url: audioUrl, hex: null, duration: null, createdAt: Date.now() } : null)

  // Sync expanded state with audioResultPanelOpen
  useEffect(() => {
    console.log('[AudioResultPanel] audioResultPanelOpen changed:', audioResultPanelOpen)
    setIsExpanded(audioResultPanelOpen)
    if (!audioResultPanelOpen) {
      setLyricsPanelShow(false)
    }
  }, [audioResultPanelOpen, setLyricsPanelShow])

  useEffect(() => {
    console.log('[AudioResultPanel] playlist changed:', musicPlaylist.length)
  }, [musicPlaylist])

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

  const handleSelectTrack = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsPlaying(false)
    setProgress(0)
  }, [])

  const handleDeleteTrack = useCallback((e: React.MouseEvent, createdAt: number) => {
    e.stopPropagation()
    const indexToDelete = musicPlaylist.findIndex((track) => track.createdAt === createdAt)
    removeFromMusicPlaylist(createdAt)
    // If we deleted the current track, adjust currentIndex
    if (indexToDelete === currentIndex) {
      setIsPlaying(false)
      setProgress(0)
      if (musicPlaylist.length > 1) {
        setCurrentIndex(Math.min(currentIndex, musicPlaylist.length - 2))
      }
    } else if (indexToDelete < currentIndex) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex, musicPlaylist.length, removeFromMusicPlaylist])

  const handleClose = useCallback(() => {
    setIsExpanded(false)
    setAudioResultPanelOpen(false)
    setLyricsPanelShow(false)
  }, [setAudioResultPanelOpen, setLyricsPanelShow])

  const handleCloseLyrics = useCallback(() => {
    setLyricsPanelShow(false)
  }, [setLyricsPanelShow])

  const handleToggleLyrics = useCallback(() => {
    setLyricsPanelShow(!lyricsPanelShow)
  }, [lyricsPanelShow])

  const handleDownload = useCallback(async () => {
    if (!currentTrack) return
    try {
      const response = await fetch(currentTrack.url)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `music-${Date.now()}.mp3`
      a.click()
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Download failed:', err)
      window.open(currentTrack.url, '_blank')
    }
  }, [currentTrack])

  // Format duration from milliseconds to mm:ss
  const formatDuration = (ms: number | null | undefined): string => {
    if (!ms) return '--:--'
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format timestamp to readable time
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // Get current lyrics
  const currentLyrics = currentTrack?.lyrics || null

  return (
    <>
      <audio
        id={audioId}
        src={currentTrack?.url || ''}
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

      {/* Expanded View - Playlist Panel */}
      {isExpanded && (
        <div
          className="rounded-2xl p-4 border"
          style={{
            position: 'fixed',
            left: '88px',
            bottom: '16px',
            backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? colors.borderDark : colors.border,
            backdropFilter: 'blur(12px)',
            width: '320px',
            height: '400px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.2)`,
            zIndex: 100,
            borderTopRightRadius: lyricsPanelShow && currentLyrics ? 0 : '12px',
            borderBottomRightRadius: lyricsPanelShow && currentLyrics ? 0 : '12px',
            borderTopLeftRadius: '12px',
            borderBottomLeftRadius: '12px',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4" style={{ color: colors.accent }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#eee' : '#333' }}>
                音乐列表 ({musicPlaylist.length})
              </span>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronLeft className="h-4 w-4" style={{ color: isDark ? '#888' : '#666' }} />
            </button>
          </div>

          {/* Current Track Info */}
          {currentTrack && (
            <div className="mb-3 p-3 rounded-xl transition-all duration-200" style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.accent }} />
                <span style={{ fontSize: '12px', color: labelColor }}>正在播放</span>
              </div>
              <div className="text-sm font-medium truncate" style={{ color: isDark ? '#eee' : '#333' }}>
                音乐 #{currentIndex + 1}
              </div>
              <div className="text-xs mt-1" style={{ color: isDark ? '#888' : '#666' }}>
                时长: {formatDuration(currentTrack.duration)} · {formatTime(currentTrack.createdAt)}
              </div>
              {/* Progress Bar */}
              <div
                style={{
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: isDark ? '#444' : '#e5e5e5',
                  cursor: 'pointer',
                  marginTop: '8px',
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
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={handlePlayPause}
              disabled={musicPlaylist.length === 0}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: musicPlaylist.length > 0 ? colors.accent : '#999',
                color: '#fff',
                cursor: musicPlaylist.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
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
              disabled={!currentTrack}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#444' : '#e5e5e5'}`,
                backgroundColor: 'transparent',
                color: currentTrack ? labelColor : '#999',
                cursor: currentTrack ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Download className="h-5 w-5" />
            </button>

            <a
              href={currentTrack?.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#444' : '#e5e5e5'}`,
                backgroundColor: 'transparent',
                color: currentTrack ? labelColor : '#999',
                cursor: currentTrack ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                opacity: currentTrack ? 1 : 0.5,
              }}
            >
              <ExternalLink className="h-5 w-5" />
            </a>

            <button
              onClick={handleToggleLyrics}
              disabled={!currentLyrics}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: `1px solid ${lyricsPanelShow && currentLyrics ? colors.accent : (isDark ? '#444' : '#e5e5e5')}`,
                backgroundColor: lyricsPanelShow && currentLyrics ? `${colors.accent}20` : 'transparent',
                color: currentLyrics ? labelColor : '#999',
                cursor: currentLyrics ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <AlignLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Playlist */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {musicPlaylist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Music2 className="w-8 h-8 mb-2" style={{ color: '#999' }} />
                <div className="text-sm" style={{ color: '#999' }}>暂无播放音乐</div>
                <div className="text-xs mt-1" style={{ color: '#bbb' }}>生成音乐后将显示在这里</div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {musicPlaylist.map((track, index) => (
                  <div
                    key={track.createdAt}
                    className="flex items-center gap-2 p-2 rounded-lg transition-all duration-200 group"
                    style={{
                      backgroundColor: index === currentIndex ? `${colors.accent}20` : 'transparent',
                      border: `1px solid ${index === currentIndex ? colors.accent : 'transparent'}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSelectTrack(index)}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: index === currentIndex ? colors.accent : '#999',
                        flexShrink: 0,
                      }}
                    />
                    <div className="flex-1 min-w-0" onClick={() => handleSelectTrack(index)}>
                      <div className="text-sm truncate" style={{ color: isDark ? '#eee' : '#333' }}>
                        音乐 #{index + 1}
                      </div>
                      <div className="text-xs" style={{ color: isDark ? '#888' : '#666' }}>
                        {formatDuration(track.duration)} · {formatTime(track.createdAt)}
                      </div>
                    </div>
                    {index === currentIndex && isPlaying && (
                      <Play className="w-4 h-4 flex-shrink-0" style={{ color: colors.accent }} />
                    )}
                    <button
                      onClick={(e) => handleDeleteTrack(e, track.createdAt)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 p-1 rounded hover:bg-red-100"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lyrics Panel - positioned to the right of the playlist panel */}
      {isExpanded && lyricsPanelShow && currentLyrics && (
        <div
          className="rounded-2xl p-4 border"
          style={{
            position: 'fixed',
            left: '408px',
            bottom: '16px',
            backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
            borderColor: isDark ? colors.borderDark : colors.border,
            backdropFilter: 'blur(12px)',
            width: '320px',
            height: '400px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.2)`,
            zIndex: 99,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlignLeft className="w-4 h-4" style={{ color: colors.accent }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#eee' : '#333' }}>
                歌词
              </span>
            </div>
            <button
              onClick={handleCloseLyrics}
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

          <div
            className="flex-1 overflow-y-auto min-h-0"
            style={{
              fontSize: '13px',
              lineHeight: '1.8',
              color: isDark ? '#ccc' : '#666',
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
            }}
          >
            {currentLyrics}
          </div>
        </div>
      )}
    </>
  )
}