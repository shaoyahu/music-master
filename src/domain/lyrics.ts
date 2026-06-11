/**
 * 歌词模型与风格
 */

export type LyricsStyle =
  | 'pop'
  | 'rock'
  | 'electronic'
  | 'classical'
  | 'folk'
  | 'jazz'

export type LyricsMode = 'full' | 'continue'

export interface LyricsGenParams {
  prompt: string
  style?: LyricsStyle
  mode: LyricsMode
  existing?: string
}

export interface LyricsResult {
  id: string
  content: string
  style: LyricsStyle
  mode: LyricsMode
  createdAt: number
}

export const LYRICS_STYLE_LABELS: Record<LyricsStyle, string> = {
  pop: '流行',
  rock: '摇滚',
  electronic: '电子',
  classical: '古典',
  folk: '民谣',
  jazz: '爵士',
}

export function validateLyricsParams(p: LyricsGenParams): string | null {
  if (!p.prompt || p.prompt.trim().length < 2) {
    return '描述至少 2 个字符'
  }
  if (p.mode === 'continue' && (!p.existing || p.existing.trim().length === 0)) {
    return '续写模式需要已有歌词'
  }
  return null
}
