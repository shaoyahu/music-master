import { useState, useCallback } from 'react'
import { X, Music, Loader2, Copy, Check, Sparkles, Shuffle, Edit3 } from 'lucide-react'
import { useLyricsGeneration } from '@/hooks/useLyricsGeneration'
import { useAppStore, styleColors } from '@/stores/appStore'

// Quick style templates for lyrics generation
const STYLE_TEMPLATES = [
  { label: '🎵 流行', prompt: '流行音乐，欢快，朗朗上口' },
  { label: '💔 情歌', prompt: '深情情歌，关于爱情和思念' },
  { label: '🌙 夜晚', prompt: '夜晚氛围，忧郁，内省' },
  { label: '☀️ 阳光', prompt: '阳光积极，充满希望' },
  { label: '🎸 摇滚', prompt: '摇滚风格，热烈，有力量' },
  { label: '🌊 民谣', prompt: '民谣风格，文艺，清新' },
]

function HighlightedLyrics({ lyrics, accentColor }: { lyrics: string; accentColor: string }) {
  const highlighted = lyrics.replace(
    /\[(Intro|Verse|Pre-Chorus|Chorus|Hook|Bridge|Solo|Outro|Break|Interlude|Drop|Build-up|Instrumental|Breakdown|Transition|Post Chorus|Build Up|Post Chorus|Pre Chorus)\]/g,
    `<span style="color: ${accentColor}; font-weight: 600; background: ${accentColor}20; padding: 2px 6px; border-radius: 4px;">[$1]</span>`
  )

  return (
    <pre
      style={{
        fontSize: '13px',
        lineHeight: '1.8',
        color: 'inherit',
        whiteSpace: 'pre-wrap',
        fontFamily: 'inherit',
        margin: 0,
      }}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

export function LyricsPanel() {
  const {
    lyricsPanelOpen,
    generatedLyrics,
    mode,
    isDark,
    style,
    generatedLyricsTitle,
    generatedLyricsStyleTags,
  } = useAppStore()

  const colors = styleColors[style]
  const cardBg = isDark ? colors.cardBgDark : colors.cardBg
  const borderColor = isDark ? colors.borderDark : colors.border
  const labelColor = isDark ? colors.labelDark : colors.label
  const inputBg = isDark ? colors.inputBgDark : colors.inputBg

  const { generate: generateLyrics, isLoading: isGeneratingLyrics, error: lyricsError } = useLyricsGeneration()

  const [localPrompt, setLocalPrompt] = useState('')
  const [localTitle, setLocalTitle] = useState('')
  const [localLyrics, setLocalLyrics] = useState('')
  const [lyricsMode, setLyricsMode] = useState<'write_full_song' | 'edit'>('write_full_song')
  const [copied, setCopied] = useState(false)

  const handleClose = useCallback(() => {
    useAppStore.getState().setLyricsPanelOpen(false)
  }, [])

  const handleGenerate = useCallback(async () => {
    try {
      const title = localTitle.trim() || undefined
      const editLyrics = lyricsMode === 'edit' ? localLyrics : undefined
      await generateLyrics(
        lyricsMode,
        localPrompt || undefined,
        editLyrics,
        title
      )
    } catch {
      // Error is handled in the hook
    }
  }, [generateLyrics, localPrompt, localLyrics, localTitle, lyricsMode])

  const handleApplyToMusic = useCallback(() => {
    if (generatedLyrics) {
      useAppStore.getState().setPendingLyricsToApply(generatedLyrics)
    }
    useAppStore.getState().setMode('music')
    useAppStore.getState().setLyricsPanelOpen(false)
  }, [generatedLyrics])

  const handleSwitchToMusic = useCallback(() => {
    useAppStore.getState().setMode('music')
  }, [])

  const handleCopyLyrics = useCallback(async () => {
    if (generatedLyrics) {
      await navigator.clipboard.writeText(generatedLyrics)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [generatedLyrics])

  const handleTemplateClick = useCallback((prompt: string) => {
    setLocalPrompt(prompt)
  }, [])

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.accent, color: '#fff' }}
          >
            <Music className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: labelColor }}>歌词生成</h2>
            <p className="text-xs" style={{ color: isDark ? '#888' : '#b45309' }}>
              AI 帮你创作独特歌词
            </p>
          </div>
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
        {/* Mode Selection */}
        <div className="space-y-2">
          <label style={{ color: labelColor, fontWeight: 500 }}>生成模式</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLyricsMode('write_full_song')}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: lyricsMode === 'write_full_song' ? colors.accent : (isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)'),
                color: lyricsMode === 'write_full_song' ? '#fff' : labelColor,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: lyricsMode === 'write_full_song' ? `0 4px 12px ${colors.accent}40` : 'none',
              }}
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              写完整歌曲
            </button>
            <button
              onClick={() => setLyricsMode('edit')}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: lyricsMode === 'edit' ? colors.accent : (isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)'),
                color: lyricsMode === 'edit' ? '#fff' : labelColor,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: lyricsMode === 'edit' ? `0 4px 12px ${colors.accent}40` : 'none',
              }}
            >
              <Edit3 className="h-4 w-4 inline mr-2" />
              编辑/续写
            </button>
          </div>
          <p className="text-xs" style={{ color: isDark ? '#666' : '#b45309' }}>
            {lyricsMode === 'write_full_song'
              ? '从零开始创作一首完整的歌曲'
              : '在已有歌词基础上进行修改或续写'}
          </p>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <label style={{ color: labelColor, fontWeight: 500 }}>
            歌曲标题 <span style={{ color: isDark ? '#666' : '#b45309', fontWeight: 400 }}>(可选)</span>
          </label>
          <input
            type="text"
            placeholder="给歌曲起个名字..."
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            style={{
              width: '100%',
              height: '44px',
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

        {/* Prompt Input */}
        <div className="space-y-2">
          <label style={{ color: labelColor, fontWeight: 500 }}>
            描述 {lyricsMode === 'write_full_song' ? '' : '(可选)'}
          </label>
          <input
            type="text"
            placeholder={lyricsMode === 'write_full_song'
              ? "描述歌曲的主题、风格或情感，如：关于夏天的甜蜜情歌..."
              : "描述你想要什么样的修改或续写方向..."}
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
          {lyricsMode === 'write_full_song' && !localPrompt && (
            <p className="text-xs flex items-center gap-1" style={{ color: isDark ? '#666' : '#b45309' }}>
              <Shuffle className="h-3 w-3" />
              留空将随机生成歌词
            </p>
          )}
        </div>

        {/* Style Templates */}
        {lyricsMode === 'write_full_song' && (
          <div className="space-y-2">
            <label style={{ color: labelColor, fontWeight: 500, fontSize: '14px' }}>
              快速模板
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLE_TEMPLATES.map((template) => (
                <button
                  key={template.label}
                  onClick={() => handleTemplateClick(template.prompt)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: `2px solid ${borderColor}`,
                    backgroundColor: isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)',
                    color: labelColor,
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Edit Mode Lyrics Input */}
        {lyricsMode === 'edit' && (
          <div className="space-y-2">
            <label style={{ color: labelColor, fontWeight: 500 }}>
              已有歌词 <span style={{ color: isDark ? '#666' : '#b45309', fontWeight: 400 }}>(必填)</span>
            </label>
            <textarea
              placeholder="粘贴或输入你想要修改的歌词..."
              value={localLyrics}
              onChange={(e) => setLocalLyrics(e.target.value)}
              style={{
                width: '100%',
                minHeight: '120px',
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
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGeneratingLyrics || (lyricsMode === 'edit' && !localLyrics)}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: isGeneratingLyrics || (lyricsMode === 'edit' && !localLyrics)
              ? (isDark ? '#555' : colors.accent)
              : colors.accent,
            color: '#fff',
            border: 'none',
            fontSize: '15px',
            fontWeight: 600,
            cursor: isGeneratingLyrics || (lyricsMode === 'edit' && !localLyrics) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: (isGeneratingLyrics || (lyricsMode === 'edit' && !localLyrics)) ? 'none' : `0 4px 12px ${colors.accent}50`,
          }}
        >
          {isGeneratingLyrics ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 className="h-4 w-4 animate-spin" />
              AI 创作中...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles className="h-4 w-4" />
              {lyricsMode === 'write_full_song' ? '生成歌词' : '修改/续写歌词'}
            </span>
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
            {/* Generated Title */}
            {generatedLyricsTitle && (
              <div className="flex items-center gap-2">
                <span style={{ color: labelColor, fontWeight: 500 }}>🎵 {generatedLyricsTitle}</span>
              </div>
            )}

            {/* Style Tags */}
            {generatedLyricsStyleTags && (
              <div className="flex flex-wrap gap-2">
                {generatedLyricsStyleTags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: `${colors.accent}20`,
                      color: colors.accent,
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Lyrics Display */}
            <div
              className="rounded-xl p-4"
              style={{
                backgroundColor: inputBg,
                border: `2px solid ${borderColor}`,
                maxHeight: '300px',
                overflow: 'auto',
              }}
            >
              <HighlightedLyrics lyrics={generatedLyrics} accentColor={colors.accent} />
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyLyrics}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: copied ? colors.accent : (isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)'),
                color: copied ? '#fff' : labelColor,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                boxShadow: copied ? `0 4px 12px ${colors.accent}40` : 'none',
              }}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  已复制到剪贴板
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  复制歌词
                </>
              )}
            </button>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleApplyToMusic}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: colors.accent,
                  color: '#fff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${colors.accent}40`,
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
                    border: `2px solid ${colors.accent}`,
                    cursor: 'pointer',
                    fontWeight: 600,
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
