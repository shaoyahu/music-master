import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Download, ExternalLink } from 'lucide-react'
import * as Slider from '@radix-ui/react-slider'
import { clsx } from 'clsx'

interface PlayerBarProps {
  audioUrl: string | null
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function PlayerBar({ audioUrl }: PlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev)
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const isExternal = audioUrl?.startsWith('http')

  if (!audioUrl) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-t border-warm-200 px-6 flex items-center gap-6">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <button
        onClick={handlePlayPause}
        className={clsx(
          'w-12 h-12 rounded-full flex items-center justify-center',
          'bg-warm-500 hover:bg-warm-600',
          'text-white transition-colors duration-200',
          'shadow-lg shadow-warm-500/30'
        )}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex items-center gap-4">
        <span className="text-sm font-mono text-warm-600 w-12 text-right">
          {formatTime(currentTime)}
        </span>

        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
        >
          <Slider.Track className="bg-warm-200 relative grow rounded-full h-1.5">
            <Slider.Range className="absolute bg-warm-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb
            className="block w-4 h-4 bg-warm-500 rounded-full shadow-md hover:bg-warm-600 focus:outline-none focus:ring-2 focus:ring-warm-500 focus:ring-offset-2"
            aria-label="进度"
          />
        </Slider.Root>

        <span className="text-sm font-mono text-warm-600 w-12">
          {formatTime(duration)}
        </span>
      </div>

      <a
        href={audioUrl}
        download
        className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-xl',
          'bg-warm-100 hover:bg-warm-200',
          'text-warm-700 font-medium',
          'transition-colors duration-200'
        )}
      >
        <Download className="w-4 h-4" />
        <span className="text-sm">下载</span>
      </a>

      {isExternal && (
        <a
          href={audioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl',
            'bg-warm-100 hover:bg-warm-200',
            'text-warm-700 font-medium',
            'transition-colors duration-200'
          )}
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm">外部链接</span>
        </a>
      )}
    </div>
  )
}
