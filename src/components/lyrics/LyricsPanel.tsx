import { useState, useCallback, useRef, useEffect } from 'react'
import { X, Music, Loader2, Copy, Check, Sparkles, Shuffle, Edit3, ChevronDown, Zap } from 'lucide-react'
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
  const tagPattern = /\[(Intro|Verse|Pre-Chorus|Chorus|Hook|Bridge|Solo|Outro|Break|Interlude|Drop|Build-up|Instrumental|Breakdown|Transition|Post Chorus|Build Up|Pre Chorus)\]/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tagPattern.exec(lyrics)) !== null) {
    if (match.index > lastIndex) {
      parts.push(lyrics.slice(lastIndex, match.index))
    }

    parts.push(
      <span
        key={`${match[0]}-${match.index}`}
        style={{
          color: accentColor,
          fontWeight: 600,
          background: `${accentColor}20`,
          padding: '2px 6px',
          borderRadius: '4px',
        }}
      >
        {match[0]}
      </span>
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < lyrics.length) {
    parts.push(lyrics.slice(lastIndex))
  }

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
    >
      {parts}
    </pre>
  )
}

export function LyricsPanel({ lyricsPanelOpenOverride, isMobile }: { lyricsPanelOpenOverride?: boolean; isMobile?: boolean }) {
  const {
    lyricsPanelOpen,
    generatedLyrics,
    mode,
    isDark,
    style,
    generatedLyricsTitle,
    generatedLyricsStyleTags,
  } = useAppStore()

  const isOpen = lyricsPanelOpenOverride || lyricsPanelOpen

  const colors = styleColors[style]
  const cardBg = isDark ? colors.cardBgDark : colors.cardBg
  const borderColor = isDark ? colors.borderDark : colors.border
  const labelColor = isDark ? colors.labelDark : colors.label
  const inputBg = isDark ? colors.inputBgDark : colors.inputBg

  const { generate: generateLyrics, isLoading: isGeneratingLyrics, error: lyricsError } = useLyricsGeneration()
  const showToast = useAppStore((state) => state.showToast)

  const [localPrompt, setLocalPrompt] = useState('')
  const [localTitle, setLocalTitle] = useState('')
  const [localLyrics, setLocalLyrics] = useState('')
  const [lyricsMode, setLyricsMode] = useState<'write_full_song' | 'edit'>('write_full_song')
  const [copied, setCopied] = useState(false)
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false)
  const templateDropdownRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    if (isMobile) {
      // On mobile the panel is force-shown via `lyricsPanelOpenOverride`,
      // so toggling `lyricsPanelOpen` alone is a no-op. Switch to the
      // music tab instead — that's the closest "back" destination.
      useAppStore.getState().setMobileTab('music')
    } else {
      useAppStore.getState().setLyricsPanelOpen(false)
    }
  }, [isMobile])

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
    if (!generatedLyrics) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedLyrics)
      } else {
        // Fallback for browsers without clipboard API
        const textarea = document.createElement('textarea')
        textarea.value = generatedLyrics
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : '请稍后重试'
      showToast(`复制失败:${message}`, 'error')
    }
  }, [generatedLyrics, showToast])

  const handleTemplateClick = useCallback((prompt: string) => {
    setLocalPrompt(prompt)
    setShowTemplateDropdown(false)
  }, [])

  // Close template dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(event.target as Node)) {
        setShowTemplateDropdown(false)
      }
    }
    if (showTemplateDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTemplateDropdown])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className={isMobile ? 'space-y-4' : `rounded-2xl p-6 shadow-lg border h-full flex flex-col`}
      style={isMobile ? {} : {
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
            <p className="text-xs" style={{ color: labelColor, opacity: 0.7 }}>
              AI 帮你创作独特歌词
            </p>
          </div>
        </div>
        {/* Close button is always shown. The mobile `handleClose` calls
            `setLyricsPanelOpen(false)`, which on mobile (where
            `lyricsPanelOpenOverride=true`) doesn't unmount the panel —
            the user still needs a way to leave. The parent layout
            switches to the music tab when `lyricsPanelOpen` flips false
            in the mobile path via the lyrics tab render condition. */}
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
      <div className={`${isMobile ? '' : 'flex-1 overflow-y-auto'} space-y-5`}>
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
          <p className="text-xs" style={{ color: labelColor, opacity: 0.6 }}>
            {lyricsMode === 'write_full_song'
              ? '从零开始创作一首完整的歌曲'
              : '在已有歌词基础上进行修改或续写'}
          </p>
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <label style={{ color: labelColor, fontWeight: 500 }}>
            歌曲标题 <span style={{ color: labelColor, opacity: 0.6, fontWeight: 400 }}>(可选)</span>
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
        {lyricsMode === 'write_full_song' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label style={{ color: labelColor, fontWeight: 500 }}>
                描述
              </label>
              <div className="relative" ref={templateDropdownRef}>
                <button
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${borderColor}`,
                    backgroundColor: isDark ? 'rgba(60,60,60,0.4)' : 'rgba(255,255,255,0.6)',
                    color: labelColor,
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <Zap className="h-3 w-3" />
                  快速模板
                  <ChevronDown className="h-3 w-3" style={{ transform: showTemplateDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {showTemplateDropdown && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      backgroundColor: isDark ? '#2a2a2a' : '#fff',
                      border: `1px solid ${borderColor}`,
                      borderRadius: '12px',
                      padding: '8px',
                      minWidth: '200px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      zIndex: 50,
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      {STYLE_TEMPLATES.map((template) => (
                        <button
                          key={template.label}
                          onClick={() => handleTemplateClick(template.prompt)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: labelColor,
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(60,60,60,0.5)' : 'rgba(0,0,0,0.05)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          {template.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <input
              type="text"
              placeholder="描述歌曲的主题、风格或情感，如：关于夏天的甜蜜情歌..."
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
            {!localPrompt && (
              <p className="text-xs flex items-center gap-1" style={{ color: labelColor, opacity: 0.6 }}>
                <Shuffle className="h-3 w-3" />
                留空将随机生成歌词
              </p>
            )}
          </div>
        )}

        {/* Prompt Input for edit mode */}
        {lyricsMode === 'edit' && (
          <div className="space-y-2">
            <label style={{ color: labelColor, fontWeight: 500 }}>
              描述 (可选)
            </label>
            <input
              type="text"
              placeholder="描述你想要什么样的修改或续写方向..."
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
        )}

        {/* Edit Mode Lyrics Input */}
        {lyricsMode === 'edit' && (
          <div className="space-y-2">
            <label style={{ color: labelColor, fontWeight: 500 }}>
              已有歌词 <span style={{ color: labelColor, opacity: 0.6, fontWeight: 400 }}>(必填)</span>
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
            {/* Generated Title Row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Title */}
              {generatedLyricsTitle && (
                <span style={{ color: labelColor, fontWeight: 500 }}>🎵 {generatedLyricsTitle}</span>
              )}
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLyrics}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: copied ? colors.accent : (isDark ? 'rgba(60,60,60,0.6)' : 'rgba(255,255,255,0.8)'),
                    color: copied ? '#fff' : labelColor,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? '已复制' : '复制歌词'}
                </button>
                <button
                  onClick={handleApplyToMusic}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: colors.accent,
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: `0 2px 8px ${colors.accent}40`,
                  }}
                >
                  应用到音乐生成
                </button>
                {mode !== 'music' && (
                  <button
                    onClick={handleSwitchToMusic}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      color: colors.accent,
                      fontSize: '12px',
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
          </div>
        )}

      </div>
    </div>
  )
}
