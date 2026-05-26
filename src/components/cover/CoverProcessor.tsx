import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, Link as LinkIcon, Music, Loader2 } from 'lucide-react'
import { useCoverPreprocess } from '@/hooks/useCoverPreprocess'
import { useCoverGeneration } from '@/hooks/useCoverGeneration'
import { useAppStore, styleColors } from '@/stores/appStore'
import { fileToBase64WithNCMSupport } from '@/lib/ncm'

export function CoverProcessor() {
  const {
    coverLyrics,
    coverFeatureId,
    isDark,
    style,
    coverPrompt,
  } = useAppStore()

  const colors = styleColors[style]
  const cardBg = isDark ? colors.cardBgDark : colors.cardBg

  const { preprocess, isLoading: isProcessingCoverLoading, error: coverError } = useCoverPreprocess()
  const { generateCover, isLoading: isGeneratingCover, error: generateError } = useCoverGeneration()

  const [localCoverUrl, setLocalCoverUrl] = useState('')
  const [localCoverLyrics, setLocalCoverLyrics] = useState(coverLyrics || '')
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync local lyrics when store coverLyrics updates (after preprocess)
  useEffect(() => {
    if (coverLyrics) {
      setLocalCoverLyrics(coverLyrics)
    }
  }, [coverLyrics])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setFileError(null)
        console.log('[CoverProcessor] File selected:', file.name, 'size:', file.size)
        try {
          const result = await fileToBase64WithNCMSupport(file)
          const { base64, isNCM } = result

          console.log('[CoverProcessor] File converted, isNCM:', isNCM, 'base64 length:', base64.length)
          await preprocess(undefined, base64)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : '文件处理失败'
          console.error('[CoverProcessor] Error:', errorMessage)
          setFileError(errorMessage)
        }
      }
    },
    [preprocess]
  )

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleUrlProcess = useCallback(async () => {
    try {
      await preprocess(localCoverUrl, undefined)
    } catch {
      // Error is handled in the hook
    }
  }, [preprocess, localCoverUrl])

  const handleCoverLyricsChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setLocalCoverLyrics(value)
    useAppStore.getState().setCoverLyrics(value)
  }, [])

  const isProcessing = isProcessingCoverLoading
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
          <h2 className="text-2xl font-bold" style={{ color: labelColor }}>
            翻唱处理
          </h2>
          <p className="text-sm" style={{ color: isDark ? '#888' : '#b45309' }}>
            上传或输入音频 URL，将现有歌曲转换为新的翻唱版本
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Upload Area */}
        <div className="space-y-2">
          <label style={{ color: labelColor, fontWeight: 500 }}>上传音频</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.ncm"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={isProcessing}
            style={{
              width: '100%',
              height: '100px',
              borderRadius: '14px',
              border: `2px dashed ${colors.accent}`,
              backgroundColor: isDark ? 'rgba(60,60,60,0.4)' : `${colors.accent}08`,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              opacity: isProcessing ? 0.5 : 1,
            }}
          >
            <Upload className="h-8 w-8" style={{ color: accentColor }} />
            <span style={{ color: labelColor, fontSize: '14px' }}>点击上传音频文件</span>
            <span style={{ color: isDark ? '#666' : '#b45309', fontSize: '12px' }}>支持 MP3、WAV、FLAC，时长 6 秒 - 6 分钟</span>
          </button>
        </div>

        {/* OR Divider */}
        <div className="flex items-center gap-4">
          <div style={{ flex: 1, height: '1px', backgroundColor: borderColor }} />
          <span style={{ color: isDark ? '#666' : '#b45309', fontSize: '13px' }}>或者</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: borderColor }} />
        </div>

        {/* URL Input */}
        <div className="relative">
          <LinkIcon 
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" 
            style={{ color: accentColor }}
          />
          <input
            type="url"
            placeholder="输入音频 URL 地址..."
            value={localCoverUrl}
            onChange={(e) => setLocalCoverUrl(e.target.value)}
            disabled={isProcessing}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              padding: '0 16px 0 48px',
              fontSize: '14px',
              backgroundColor: inputBg,
              border: `2px solid ${borderColor}`,
              color: isDark ? '#eee' : '#333',
              outline: 'none'
            }}
          />
        </div>

        {/* Process Button */}
        {localCoverUrl && (
          <button
            type="button"
            onClick={handleUrlProcess}
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: isProcessing ? (isDark ? '#555' : colors.accent) : colors.accent,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              boxShadow: isProcessing ? 'none' : `0 4px 12px ${colors.accent}40`,
            }}
          >
            {isProcessing ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                处理中...
              </span>
            ) : (
              '🔄 从 URL 预处理'
            )}
          </button>
        )}

        {/* Style Prompt */}
        <div className="space-y-2">
          <label style={{ color: labelColor, fontWeight: 500 }}>翻唱风格描述</label>
          <input
            type="text"
            placeholder="描述你想要的翻唱风格，例如：温暖抒情的版本..."
            value={coverPrompt}
            onChange={(e) => useAppStore.getState().setCoverPrompt(e.target.value)}
            disabled={isProcessing}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              padding: '0 16px',
              fontSize: '15px',
              backgroundColor: inputBg,
              border: `2px solid ${borderColor}`,
              color: isDark ? '#eee' : '#333',
              outline: 'none'
            }}
          />
        </div>

        {/* Error Message */}
        {fileError && (
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              border: `1px solid #ef4444`,
              fontSize: '14px'
            }}
          >
            ❌ {fileError}
          </div>
        )}

        {/* API Error Message */}
        {coverError && (
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              border: `1px solid #ef4444`,
              fontSize: '14px'
            }}
          >
            ❌ {coverError}
          </div>
        )}

        {/* Cover Feature ID */}
        {coverFeatureId && (
          <div 
            className="rounded-xl p-4"
            style={{ 
              backgroundColor: isDark ? 'rgba(50,50,50,0.8)' : 'rgba(254,215,170,0.3)', 
              border: `1px solid ${borderColor}`
            }}
          >
            <p style={{ color: labelColor, fontSize: '13px' }}>
              <span style={{ fontWeight: 600 }}>✓ 预处理完成</span>
            </p>
            <p className="text-xs mt-1" style={{ color: isDark ? '#666' : '#b45309' }}>
              Feature ID: {coverFeatureId}
            </p>
          </div>
        )}

        {/* Cover Lyrics Result */}
        {coverLyrics && (
          <div className="space-y-2">
            <label style={{ color: labelColor, fontWeight: 500 }}>提取的歌词（可编辑）</label>
            <textarea
              placeholder="从音频中提取的歌词将显示在这里，您可以编辑后使用..."
              value={localCoverLyrics}
              onChange={handleCoverLyricsChange}
              style={{ 
                width: '100%',
                minHeight: '140px',
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
          </div>
        )}

        {/* Loading State */}
        {isProcessing && !coverLyrics && (
          <div 
            className="rounded-xl p-8"
            style={{ 
              backgroundColor: inputBg, 
              border: `1px solid ${borderColor}`,
              textAlign: 'center'
            }}
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: accentColor }} />
            <p style={{ color: labelColor }}>正在处理音频...</p>
            <p className="text-xs mt-1" style={{ color: isDark ? '#666' : '#b45309' }}>这可能需要几秒钟</p>
          </div>
        )}

        {/* Generate Button */}
        {coverFeatureId && (
          <button
            onClick={() => generateCover()}
            disabled={isGeneratingCover}
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: isGeneratingCover ? (isDark ? '#555' : colors.accent) : colors.accent,
              color: '#fff',
              border: 'none',
              fontSize: '16px',
              fontWeight: 700,
              cursor: isGeneratingCover ? 'not-allowed' : 'pointer',
              boxShadow: isGeneratingCover ? 'none' : `0 6px 20px ${colors.accent}50`,
            }}
          >
            {isGeneratingCover ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 className="h-5 w-5 animate-spin" />
                生成中...
              </span>
            ) : (
              '🎵 生成翻唱版本'
            )}
          </button>
        )}

        {/* Generate Error */}
        {generateError && (
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              border: `1px solid #ef4444`,
              fontSize: '14px'
            }}
          >
            ❌ {generateError}
          </div>
        )}
      </div>
    </div>
  )
}
