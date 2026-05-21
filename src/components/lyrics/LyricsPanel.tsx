import { useState, useCallback } from 'react'
import { X, Music, Loader2 } from 'lucide-react'
import { useLyricsGeneration } from '@/hooks/useLyricsGeneration'
import { useAppStore, styleColors } from '@/stores/appStore'

export function LyricsPanel() {
  const {
    lyricsPanelOpen,
    generatedLyrics,
    mode,
    setMode,
    isDark,
    style,
  } = useAppStore()

  const colors = styleColors[style]
  const cardBg = isDark ? colors.cardBgDark : colors.cardBg
  const borderColor = isDark ? colors.borderDark : colors.border
  const labelColor = isDark ? colors.labelDark : colors.label
  const inputBg = isDark ? colors.inputBgDark : colors.inputBg

  const { generate: generateLyrics, isLoading: isGeneratingLyrics, error: lyricsError } = useLyricsGeneration()

  const [localPrompt, setLocalPrompt] = useState('')

  const handleClose = useCallback(() => {
    useAppStore.getState().setLyricsPanelOpen(false)
  }, [])

  const handleGenerate = useCallback(async () => {
    try {
      await generateLyrics('text_to_lyrics', localPrompt)
    } catch {
      // Error is handled in the hook
    }
  }, [generateLyrics, localPrompt])

  const handleApplyToMusic = useCallback(() => {
    useAppStore.getState().setMode('music')
    useAppStore.getState().setLyricsPanelOpen(false)
  }, [])

  const handleSwitchToMusic = useCallback(() => {
    setMode('music')
  }, [setMode])

  if (!lyricsPanelOpen) {
    return null
  }

  return (
    <div
      className="rounded-2xl p-6 shadow-lg border h-full flex flex-col"
      style={{
        background: cardBg,
        borderColor: borderColor,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.accent, color: '#fff' }}
          >
            <Music className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: labelColor }}>歌词生成</h2>
        </div>
        <button
          onClick={handleClose}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: inputBg,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
        >
          <X className="h-4 w-4" style={{ color: labelColor }} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-5">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label style={{ color: labelColor, fontWeight: 500 }}>描述</label>
          <input
            type="text"
            placeholder="描述你想要的歌词主题、风格或情感..."
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              padding: '0 16px',
              fontSize: '14px',
              backgroundColor: inputBg,
              border: `2px solid ${borderColor}`,
              color: isDark ? '#eee' : '#333',
              outline: 'none',
            }}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGeneratingLyrics || !localPrompt}
          style={{
            width: '100%',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: isGeneratingLyrics || !localPrompt
              ? (isDark ? '#444' : borderColor)
              : colors.accentGradient,
            color: '#fff',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isGeneratingLyrics || !localPrompt ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isGeneratingLyrics ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              生成中...
            </span>
          ) : (
            '生成歌词'
          )}
        </button>

        {/* Error Message */}
        {lyricsError && (
          <div
            className="rounded-lg p-3 text-sm"
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              border: `1px solid #ef4444`,
            }}
          >
            {lyricsError}
          </div>
        )}

        {/* Generated Lyrics */}
        {generatedLyrics && (
          <div className="space-y-3">
            <label style={{ color: labelColor, fontWeight: 500 }}>生成的歌词</label>
            <textarea
              value={generatedLyrics}
              readOnly
              style={{
                width: '100%',
                minHeight: '200px',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                lineHeight: '1.6',
                backgroundColor: inputBg,
                border: `2px solid ${borderColor}`,
                color: isDark ? '#eee' : '#333',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleApplyToMusic}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: colors.accentGradient,
                  color: '#fff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                应用到音乐生成
              </button>
              {mode !== 'music' && (
                <button
                  onClick={handleSwitchToMusic}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'transparent',
                    color: colors.accent,
                    fontSize: '14px',
                    border: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                  }}
                >
                  切换到音乐生成
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
