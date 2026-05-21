import { useState, useCallback } from 'react'
import { Music, Loader2 } from 'lucide-react'
import { useMusicGeneration } from '@/hooks/useMusicGeneration'
import { useLyricsGeneration } from '@/hooks/useLyricsGeneration'
import { useAppStore, styleColors } from '@/stores/appStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type AudioFormat = 'mp3' | 'wav' | 'pcm'
export type SampleRate = 16000 | 24000 | 32000 | 44100
export type Bitrate = 32000 | 64000 | 128000 | 256000

const formatOptions: { value: AudioFormat; label: string }[] = [
  { value: 'mp3', label: 'MP3' },
  { value: 'wav', label: 'WAV' },
  { value: 'pcm', label: 'PCM' },
]

const sampleRateOptions: { value: SampleRate; label: string }[] = [
  { value: 16000, label: '16000 Hz' },
  { value: 24000, label: '24000 Hz' },
  { value: 32000, label: '32000 Hz' },
  { value: 44100, label: '44100 Hz' },
]

const bitrateOptions: { value: Bitrate; label: string }[] = [
  { value: 32000, label: '32 kbps' },
  { value: 64000, label: '64 kbps' },
  { value: 128000, label: '128 kbps' },
  { value: 256000, label: '256 kbps' },
]

export function MusicGenerator() {
  const {
    generatedLyrics,
    mode,
    setMode,
    isDark,
    style,
    setLyricsPanelOpen,
  } = useAppStore()

  const colors = styleColors[style]
  const cardBg = isDark ? colors.cardBgDark : colors.cardBg

  const { generate: generateMusic, isLoading: isGeneratingMusic, error: musicError } = useMusicGeneration()
  const { isLoading: isGeneratingLyrics } = useLyricsGeneration()

  const [localPrompt, setLocalPrompt] = useState('')
  const [localLyrics, setLocalLyrics] = useState('')
  const [localIsInstrumental, setLocalIsInstrumental] = useState(false)
  const [localFormat, setLocalFormat] = useState<AudioFormat>('mp3')
  const [localSampleRate, setLocalSampleRate] = useState<SampleRate>(44100)
  const [localBitrate, setLocalBitrate] = useState<Bitrate>(256000)

  const handleGenerate = useCallback(async () => {
    try {
      await generateMusic({
        prompt: localPrompt,
        lyrics: localIsInstrumental ? '' : localLyrics,
        instrumental: localIsInstrumental,
      })
    } catch {
      // Error is handled in the hook
    }
  }, [generateMusic, localPrompt, localLyrics, localIsInstrumental])

  const handleApplyGeneratedLyrics = useCallback(() => {
    if (generatedLyrics) {
      setLocalLyrics(generatedLyrics)
    }
  }, [generatedLyrics])

  const handleSwitchToMusic = useCallback(() => {
    setMode('music')
  }, [setMode])

  const borderColor = isDark ? colors.borderDark : colors.border
  const inputBg = isDark ? colors.inputBgDark : colors.inputBg
  const labelColor = isDark ? colors.labelDark : colors.label
  const accentColor = colors.accent

  return (
    <div
      className="rounded-2xl p-6 shadow-lg border"
      style={{
        background: cardBg,
        borderColor: borderColor,
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.accent, color: '#fff' }}
        >
          <Music className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: isDark ? '#eee' : '#92400e' }}>
            音乐生成
          </h2>
          <p className="text-sm" style={{ color: isDark ? '#888' : '#b45309' }}>
            输入描述和歌词，AI 将为您生成完整的音乐作品
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label style={{ color: labelColor, fontWeight: 500 }}>歌曲描述</label>
          <input
            type="text"
            placeholder="例如：抒情的流行音乐，关于梦想和坚持..."
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            style={{ 
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              padding: '0 16px',
              fontSize: '15px',
              backgroundColor: inputBg,
              border: `2px solid ${borderColor}`,
              color: isDark ? '#eee' : '#333',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>

        {/* Instrumental Toggle */}
        <div
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}` }}
        >
          <div>
            <label style={{ color: labelColor, fontWeight: 500, cursor: 'pointer' }}>
              无歌词（纯音乐）
            </label>
            <p className="text-xs mt-1" style={{ color: isDark ? '#666' : '#b45309' }}>
              生成没有人声的背景音乐
            </p>
          </div>
          <button
            onClick={() => setLocalIsInstrumental(!localIsInstrumental)}
            style={{
              width: '52px',
              height: '28px',
              borderRadius: '14px',
              backgroundColor: localIsInstrumental ? accentColor : '#ccc',
              position: 'relative',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{
              position: 'absolute',
              top: '2px',
              left: localIsInstrumental ? '26px' : '2px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>

        {/* Lyrics Textarea */}
        {!localIsInstrumental && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label style={{ color: labelColor, fontWeight: 500 }}>歌词</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => useAppStore.getState().setLyricsExampleOpen(!useAppStore.getState().lyricsExampleOpen)}
                  style={{
                    color: accentColor,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500
                  }}
                >
                  📖 查看示例
                </button>
                {generatedLyrics && mode === 'lyrics' && (
                  <button
                    onClick={handleApplyGeneratedLyrics}
                    style={{
                      color: accentColor,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    + 应用生成的歌词
                  </button>
                )}
              </div>
            </div>
            <textarea
              placeholder="输入歌词，每行一句，可使用结构标签如 [Verse]、[Chorus]、[Bridge] 等"
              value={localLyrics}
              onChange={(e) => setLocalLyrics(e.target.value)}
              style={{
                width: '100%',
                height: '140px',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                lineHeight: '1.6',
                backgroundColor: inputBg,
                border: `2px solid ${borderColor}`,
                color: isDark ? '#eee' : '#333',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />

            {/* AI Generate Lyrics Button */}
            <button
              onClick={() => {
                setLyricsPanelOpen(true)
                setMode('music')
              }}
              disabled={isGeneratingLyrics}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: `2px solid ${borderColor}`,
                backgroundColor: isGeneratingLyrics
                  ? (isDark ? '#444' : borderColor)
                  : colors.accentGradient,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: isGeneratingLyrics ? 'not-allowed' : 'pointer',
                opacity: isGeneratingLyrics ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isGeneratingLyrics ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 创作歌词中...
                </span>
              ) : (
                '🤖 AI 帮我写歌词'
              )}
            </button>
          </div>
        )}

        
        {/* Audio Settings */}
        <div 
          className="p-4 rounded-xl space-y-4"
          style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}` }}
        >
          <label style={{ color: labelColor, fontWeight: 500 }}>音频设置</label>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Format */}
            <div className="space-y-2">
              <label style={{ color: labelColor, fontSize: '13px' }}>格式</label>
              <Select value={localFormat} onValueChange={(v) => setLocalFormat(v as AudioFormat)}>
                <SelectTrigger isDark={isDark} styleType={style} style={{
                  height: '40px',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent isDark={isDark} styleType={style}>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} isDark={isDark} styleType={style}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sample Rate */}
            <div className="space-y-2">
              <label style={{ color: labelColor, fontSize: '13px' }}>采样率</label>
              <Select value={String(localSampleRate)} onValueChange={(v) => setLocalSampleRate(parseInt(v) as SampleRate)}>
                <SelectTrigger isDark={isDark} styleType={style} style={{
                  height: '40px',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent isDark={isDark} styleType={style}>
                  {sampleRateOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)} isDark={isDark} styleType={style}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bitrate */}
            <div className="space-y-2">
              <label style={{ color: labelColor, fontSize: '13px' }}>比特率</label>
              <Select value={String(localBitrate)} onValueChange={(v) => setLocalBitrate(parseInt(v) as Bitrate)}>
                <SelectTrigger isDark={isDark} styleType={style} style={{
                  height: '40px',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent isDark={isDark} styleType={style}>
                  {bitrateOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)} isDark={isDark} styleType={style}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {musicError && (
          <div 
            className="rounded-xl p-4"
            style={{ 
              backgroundColor: 'rgba(239,68,68,0.1)', 
              color: '#ef4444', 
              border: `1px solid #ef4444`,
              fontSize: '14px'
            }}
          >
            ❌ {musicError}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGeneratingMusic || !localPrompt}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: isGeneratingMusic || !localPrompt
              ? (isDark ? '#444' : borderColor)
              : colors.accentGradient,
            color: '#fff',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: isGeneratingMusic || !localPrompt ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: isGeneratingMusic || !localPrompt ? 'none' : `0 4px 12px ${colors.accent}40`
          }}
        >
          {isGeneratingMusic ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 className="h-5 w-5 animate-spin" />
              正在生成音乐...
            </span>
          ) : (
            '🎵 开始生成音乐'
          )}
        </button>

        {/* Switch Mode */}
        {mode === 'lyrics' && (
          <button
            onClick={handleSwitchToMusic}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              color: accentColor,
              fontSize: '14px',
              border: `1px solid ${borderColor}`,
              cursor: 'pointer'
            }}
          >
            切换到音乐生成模式 →
          </button>
        )}
      </div>
    </div>
  )
}
