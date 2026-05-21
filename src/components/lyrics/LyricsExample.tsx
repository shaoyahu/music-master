import { X } from 'lucide-react'
import { useAppStore, styleColors } from '@/stores/appStore'

const lyricsExampleContent = `[Verse 1]
清晨的阳光照进窗台
新的一天悄悄展开
梦想在心中轻轻呼唤
勇敢向前不要徘徊

[Chorus]
就让光芒照亮前方
每一步都算数的光芒
不管多远多难到达
坚持就是我的答案

[Verse 2]
夜空中星星闪烁光芒
照亮我们前进方向
泪水汗水化作力量
心中火焰永不灭

[Bridge]
跨越山和大海的阻挡
穿越风雨看见阳光
相信自己相信希望
奇迹就在前方

[Chorus]
就让光芒照亮前方
每一步都算数的光芒
不管多远多难到达
坚持就是我的答案`

export function LyricsExample() {
  const { lyricsExampleOpen, isDark, style } = useAppStore()
  const colors = styleColors[style]

  const cardBg = isDark ? colors.cardBgDark : colors.cardBg
  const borderColor = isDark ? colors.borderDark : colors.border
  const labelColor = isDark ? colors.labelDark : colors.label
  const inputBg = isDark ? colors.inputBgDark : colors.inputBg

  if (!lyricsExampleOpen) {
    return null
  }

  return (
    <div
      className="rounded-2xl p-6 shadow-lg border h-full flex flex-col"
      style={{
        background: cardBg,
        borderColor: borderColor,
        transition: 'all 0.3s ease-in-out',
        opacity: 1,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.accent, color: '#fff' }}
          >
            <span style={{ fontSize: '18px' }}>📝</span>
          </div>
          <h2 className="text-lg font-semibold" style={{ color: labelColor }}>
            歌词示例
          </h2>
        </div>
        <button
          onClick={() => useAppStore.getState().setLyricsExampleOpen(false)}
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
      <div
        className="flex-1 rounded-xl p-4 overflow-auto"
        style={{
          backgroundColor: isDark ? colors.inputBgDark : colors.inputBg,
          border: `2px solid ${borderColor}`,
        }}
      >
        <pre
          style={{
            fontSize: '13px',
            lineHeight: '1.8',
            color: isDark ? '#aaa' : '#666',
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            margin: 0,
          }}
        >
          {lyricsExampleContent}
        </pre>
      </div>

      {/* Tags Reference */}
      <div className="mt-4">
        <h3 style={{ color: labelColor, fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
          歌词结构标签
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: isDark ? '#888' : '#888' }}>
          <div><code style={{ color: colors.accent }}>[Intro]</code> 前奏</div>
          <div><code style={{ color: colors.accent }}>[Verse]</code> 主歌</div>
          <div><code style={{ color: colors.accent }}>[Pre-Chorus]</code> 预副歌</div>
          <div><code style={{ color: colors.accent }}>[Chorus]</code> 副歌</div>
          <div><code style={{ color: colors.accent }}>[Hook]</code> 记忆点</div>
          <div><code style={{ color: colors.accent }}>[Bridge]</code> 桥段</div>
          <div><code style={{ color: colors.accent }}>[Outro]</code> 尾奏</div>
          <div><code style={{ color: colors.accent }}>[Solo]</code> 乐器独奏</div>
        </div>
      </div>
    </div>
  )
}
