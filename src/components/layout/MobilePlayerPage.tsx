import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Rewind, FastForward, Download, List, AlignLeft } from 'lucide-react'
import { useAppStore, styleColors } from '@/stores/appStore'
import { downloadAudioBlob } from '@/lib/audio'

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MobilePlayerPage() {
  // Per-field selectors so unrelated store changes don't re-render this page.
  const isDark = useAppStore((state) => state.isDark)
  const style = useAppStore((state) => state.style)
  const musicPlaylist = useAppStore((state) => state.musicPlaylist)
  const audioUrl = useAppStore((state) => state.audioUrl)
  const musicDuration = useAppStore((state) => state.musicDuration)
  const showToast = useAppStore((state) => state.showToast)
  const colors = styleColors[style]
  const labelColor = isDark ? colors.labelDark : colors.label

  // Pick the first track if there is one, else fall back to the currently playing audioUrl.
  const currentTrack = musicPlaylist[0]
  const trackUrl = currentTrack?.url || audioUrl
  const trackTitle = currentTrack
    ? `音乐 #1`
    : audioUrl
      ? '正在播放'
      : '暂无音乐'
  const trackDuration = currentTrack?.duration ?? musicDuration

  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  // Monotonic counter incremented on every play/pause click. A late-resolving
  // `audio.play().then(...)` from a previous track would otherwise set
  // isPlaying(true) on the new track, and a late `.catch()` would surface a
  // misleading "播放失败" toast for a track the user never tried to play.
  const playbackIdRef = useRef(0)

  // Reset playback state when the track URL changes (e.g. a new music is
  // generated). The `<audio key={trackUrl}>` below remounts the element, so
  // the audio is already paused and at 0 — only the React state needs sync.
  useEffect(() => {
    setIsPlaying(false)
    setProgress(0)
  }, [trackUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }
    const playbackId = ++playbackIdRef.current
    audio
      .play()
      .then(() => {
        if (playbackIdRef.current !== playbackId) return
        setIsPlaying(true)
      })
      .catch((err: unknown) => {
        if (playbackIdRef.current !== playbackId) return
        // Most often this is the browser's autoplay policy or a missing source.
        // Don't leave the user wondering why nothing happened.
        setIsPlaying(false)
        const message = err instanceof Error ? err.message : '请稍后重试'
        showToast(`播放失败:${message}`, 'error')
      })
  }

  // -10s rewind. Icon is `Rewind` to match the actual semantics.
  const skipPrev = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
  }
  // +10s fast-forward. Icon is `FastForward` to match the actual semantics.
  // `Infinity` fallback (instead of 0) keeps the button working before
  // `loadedmetadata`: the audio element itself clamps currentTime at the
  // end once duration is known.
  const skipNext = () => {
    if (!audioRef.current) return
    const next = audioRef.current.currentTime + 10
    const max = Number.isFinite(audioRef.current.duration) ? audioRef.current.duration : Infinity
    audioRef.current.currentTime = Math.min(max, next)
  }

  const handleDownload = () => {
    if (!trackUrl) return
    void downloadAudioBlob(trackUrl, 'music', (err) => {
      // window.open(blob:...) usually opens a blank tab and isn't useful —
      // toast the user instead so they know the download failed.
      showToast('下载失败:' + (err instanceof Error ? err.message : '请稍后重试'), 'error')
    })
  }

  return (
    <div
      className="h-full flex flex-col items-center justify-center px-6"
      style={{ color: isDark ? '#eee' : '#333' }}
    >
      <div
        className="w-64 h-64 rounded-2xl mb-8 flex items-center justify-center"
        style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)' }}
      >
        <span className="text-6xl">🎵</span>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-1">{trackTitle}</h2>
        <p className="text-sm" style={{ color: labelColor }}>{formatDuration(trackDuration)}</p>
      </div>

      <div className="w-full max-w-xs mb-6">
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#444' : '#e5e5e5' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ backgroundColor: colors.accent, width: `${progress}%` }}
          />
        </div>
      </div>

      {trackUrl && (
        <audio
          key={trackUrl}
          ref={audioRef}
          src={trackUrl}
          preload="metadata"
          onTimeUpdate={(e) => {
            const a = e.currentTarget
            if (a.duration) setProgress((a.currentTime / a.duration) * 100)
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <div className="flex items-center justify-center gap-6 mb-8">
        <button
          type="button"
          onClick={skipPrev}
          disabled={!trackUrl}
          aria-label="快退10秒"
          className="p-3 rounded-full"
          style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)' }}
        >
          <Rewind className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          disabled={!trackUrl}
          className="p-5 rounded-full"
          style={{ backgroundColor: colors.accent, color: '#fff', opacity: trackUrl ? 1 : 0.5 }}
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>
        <button
          type="button"
          onClick={skipNext}
          disabled={!trackUrl}
          aria-label="快进10秒"
          className="p-3 rounded-full"
          style={{ backgroundColor: isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)' }}
        >
          <FastForward className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          className="p-3 rounded-xl"
          style={{ border: `1px solid ${isDark ? '#444' : '#e5e5e5'}` }}
        >
          <List className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!trackUrl}
          className="p-3 rounded-xl"
          style={{ border: `1px solid ${isDark ? '#444' : '#e5e5e5'}` }}
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-3 rounded-xl"
          style={{ border: `1px solid ${isDark ? '#444' : '#e5e5e5'}` }}
        >
          <AlignLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}