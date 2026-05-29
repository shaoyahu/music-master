import { useState, useCallback, useEffect } from 'react'
import { Music, Loader2 } from 'lucide-react'
import { useMusicGeneration } from '@/hooks/useMusicGeneration'
import { useLyricsGeneration } from '@/hooks/useLyricsGeneration'
import { useAppStore, styleColors } from '@/stores/appStore'
import { useResponsive } from '@/hooks/useResponsive'
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
export type OutputFormat = 'url' | 'hex'

const formatOptions: { value: AudioFormat; label: string }[] = [
  { value: 'mp3', label: 'MP3' },
  { value: 'wav', label: 'WAV' },
  { value: 'pcm', label: 'PCM' },
]

const sampleRateOptions: { value: SampleRate; label: string }[] = [
  { value: 44100, label: '44100 Hz' },
  { value: 32000, label: '32000 Hz' },
  { value: 24000, label: '24000 Hz' },
  { value: 16000, label: '16000 Hz' },
]

const bitrateOptions: { value: Bitrate; label: string }[] = [
  { value: 256000, label: '256 kbps' },
  { value: 128000, label: '128 kbps' },
  { value: 64000, label: '64 kbps' },
  { value: 32000, label: '32 kbps' },
]

export function MusicGenerator() {
  const {
    generatedLyrics,
    pendingLyricsToApply,
    setPendingLyricsToApply,
    mode,
    setMode,
    isDark,
    style,
    setLyricsPanelOpen,
  } = useAppStore()

  const colors = styleColors[style]
  const cardBg = isDark ? colors.cardBgDark : colors.cardBg
  const { isMobile } = useResponsive()

  const { generate: generateMusic, isLoading: isGeneratingMusic, error: musicError } = useMusicGeneration()
  const { isLoading: isGeneratingLyrics } = useLyricsGeneration()

  const [localPrompt, setLocalPrompt] = useState('')
  const [localLyrics, setLocalLyrics] = useState('')
  const [localIsInstrumental, setLocalIsInstrumental] = useState(false)
  const [localFormat, setLocalFormat] = useState<AudioFormat>('mp3')
  const [localSampleRate, setLocalSampleRate] = useState<SampleRate>(44100)
  const [localBitrate, setLocalBitrate] = useState<Bitrate>(256000)
  const [localOutputFormat, setLocalOutputFormat] = useState<OutputFormat>('url')

  const handleGenerate = useCallback(async () => {
    try {
      const params: {
        model: string;
        prompt: string;
        is_instrumental: boolean;
        output_format: OutputFormat;
        audio_setting: {
          sample_rate: SampleRate;
          bitrate: Bitrate;
          format: AudioFormat;
        };
        lyrics?: string;
      } = {
        model: 'music-2.6',
        prompt: localPrompt,
        is_instrumental: localIsInstrumental,
        output_format: localOutputFormat,
        audio_setting: {
          sample_rate: localSampleRate,
          bitrate: localBitrate,
          format: localFormat,
        },
      }

      // Only include lyrics when not instrumental
      if (!localIsInstrumental && localLyrics) {
        params.lyrics = localLyrics
      }

      await generateMusic(params)
    } catch {
      // Error is handled in the hook
    }
  }, [generateMusic, localPrompt, localLyrics, localIsInstrumental, localOutputFormat, localSampleRate, localBitrate, localFormat])

  const handleApplyGeneratedLyrics = useCallback(() => {
    if (generatedLyrics) {
      setLocalLyrics(generatedLyrics)
    }
  }, [generatedLyrics])

  const handleSwitchToMusic = useCallback(() => {
    setMode('music')
  }, [setMode])

  // Apply pending lyrics when they change
  useEffect(() => {
    if (pendingLyricsToApply) {
      setLocalLyrics(pendingLyricsToApply)
      setPendingLyricsToApply(null)
    }
  }, [pendingLyricsToApply, setPendingLyricsToApply])

  const borderColor = isDark ? colors.borderDark : colors.border
  const inputBg = isDark ? colors.inputBgDark : colors.inputBg
  const labelColor = isDark ? colors.labelDark : colors.label
  const accentColor = colors.accent

  return (
    <div
      className={`${isMobile ? 'space-y-4' : 'rounded-2xl p-6 shadow-lg border flex flex-col'}`}
      style={isMobile ? {} : {
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
          <h2 className="text-2xl font-bold" style={{ color: labelColor }}>
            音乐生成
          </h2>
          <p className="text-sm" style={{ color: labelColor, opacity: 0.7 }}>
            输入描述和歌词，AI 将为您生成完整的音乐作品
          </p>
        </div>
      </div>

      <div className="space-y-5 flex-1">
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
            <p className="text-xs mt-1" style={{ color: labelColor, opacity: 0.6 }}>
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
                border: 'none',
                backgroundColor: isGeneratingLyrics
                  ? (isDark ? '#555' : colors.accent)
                  : colors.accent,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isGeneratingLyrics ? 'not-allowed' : 'pointer',
                opacity: isGeneratingLyrics ? 0.6 : 1,
                transition: 'all 0.2s',
                boxShadow: isGeneratingLyrics ? 'none' : `0 4px 12px ${colors.accent}50`,
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

          {/* Output Format - Cards style for mobile, Select for desktop */}
          <div className="space-y-2">
            <label style={{ color: labelColor, fontSize: '13px' }}>输出方式</label>
            {isMobile ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLocalOutputFormat('url')}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: localOutputFormat === 'url' ? colors.accent : (isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)'),
                    color: localOutputFormat === 'url' ? '#fff' : labelColor,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: localOutputFormat === 'url' ? `0 4px 12px ${colors.accent}40` : 'none',
                  }}
                >
                  🌐 URL 链接
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 400, marginTop: '2px', opacity: localOutputFormat === 'url' ? 0.9 : 0.7 }}>
                    可直接播放/下载
                  </span>
                </button>
                <button
                  onClick={() => setLocalOutputFormat('hex')}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: localOutputFormat === 'hex' ? colors.accent : (isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)'),
                    color: localOutputFormat === 'hex' ? '#fff' : labelColor,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: localOutputFormat === 'hex' ? `0 4px 12px ${colors.accent}40` : 'none',
                  }}
                >
                  🔢 Hex 编码
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 400, marginTop: '2px', opacity: localOutputFormat === 'hex' ? 0.9 : 0.7 }}>
                    适合网页播放
                  </span>
                </button>
              </div>
            ) : (
              <Select value={localOutputFormat} onValueChange={(v) => setLocalOutputFormat(v as OutputFormat)}>
                <SelectTrigger isDark={isDark} styleType={style} style={{ height: '40px', borderRadius: '10px', fontSize: '13px', fontWeight: 500 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent isDark={isDark} styleType={style}>
                  <SelectItem value="url" isDark={isDark} styleType={style}>🌐 URL 链接（可长久保存）</SelectItem>
                  <SelectItem value="hex" isDark={isDark} styleType={style}>🔢 Hex 编码（仅当前会话有效）</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Format - Buttons for mobile, Select for desktop */}
          <div className="space-y-2">
            <label style={{ color: labelColor, fontSize: '13px', fontWeight: 600 }}>格式</label>
            {isMobile ? (
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {formatOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLocalFormat(option.value)}
                    style={{
                      flexShrink: 0,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: localFormat === option.value ? colors.accent : (isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)'),
                      color: localFormat === option.value ? '#fff' : labelColor,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <Select value={localFormat} onValueChange={(v) => setLocalFormat(v as AudioFormat)}>
                <SelectTrigger isDark={isDark} styleType={style} style={{ height: '40px', borderRadius: '10px', fontSize: '13px', fontWeight: 500 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent isDark={isDark} styleType={style}>
                  {formatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} isDark={isDark} styleType={style}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Sample Rate - Buttons for mobile, Select for desktop */}
          <div className="space-y-2">
            <label style={{ color: labelColor, fontSize: '13px', fontWeight: 600 }}>采样率</label>
            {isMobile ? (
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {sampleRateOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLocalSampleRate(option.value)}
                    style={{
                      flexShrink: 0,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: localSampleRate === option.value ? colors.accent : (isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)'),
                      color: localSampleRate === option.value ? '#fff' : labelColor,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <Select value={String(localSampleRate)} onValueChange={(v) => setLocalSampleRate(parseInt(v) as SampleRate)}>
                <SelectTrigger isDark={isDark} styleType={style} style={{ height: '40px', borderRadius: '10px', fontSize: '13px', fontWeight: 500 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent isDark={isDark} styleType={style}>
                  {sampleRateOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)} isDark={isDark} styleType={style}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Bitrate - Buttons for mobile, Select for desktop */}
          <div className="space-y-2">
            <label style={{ color: labelColor, fontSize: '13px', fontWeight: 600 }}>比特率</label>
            {isMobile ? (
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {bitrateOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLocalBitrate(option.value)}
                    style={{
                      flexShrink: 0,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: localBitrate === option.value ? colors.accent : (isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)'),
                      color: localBitrate === option.value ? '#fff' : labelColor,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <Select value={String(localBitrate)} onValueChange={(v) => setLocalBitrate(parseInt(v) as Bitrate)}>
                <SelectTrigger isDark={isDark} styleType={style} style={{ height: '40px', borderRadius: '10px', fontSize: '13px', fontWeight: 500 }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent isDark={isDark} styleType={style}>
                  {bitrateOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)} isDark={isDark} styleType={style}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
          disabled={isGeneratingMusic || (!localIsInstrumental && !localLyrics && !localPrompt)}
          style={{
            width: '100%',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: isGeneratingMusic || (!localIsInstrumental && !localLyrics && !localPrompt)
              ? (isDark ? '#555' : colors.accent)
              : colors.accent,
            color: '#fff',
            border: 'none',
            fontSize: '16px',
            fontWeight: 700,
            cursor: isGeneratingMusic || (!localIsInstrumental && !localLyrics && !localPrompt) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: isGeneratingMusic || (!localIsInstrumental && !localLyrics && !localPrompt) ? 'none' : `0 6px 20px ${colors.accent}50`,
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
