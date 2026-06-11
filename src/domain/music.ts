/**
 * 音乐生成业务模型
 */

export type MusicStyle =
  | 'pop'
  | 'rock'
  | 'electronic'
  | 'classical'
  | 'jazz'
  | 'folk'
  | 'rnb'
  | 'hiphop'

export type MusicFormat = 'url' | 'hex'

export interface MusicGenParams {
  prompt: string
  lyrics: string
  style?: MusicStyle
  instrumental?: boolean
  format?: MusicFormat
}

export interface MusicGenResult {
  id: string
  audioUrl: string
  audioHex: string
  duration: number
  format: MusicFormat
  createdAt: number
}

export function validateMusicParams(p: MusicGenParams): string | null {
  if (!p.prompt || p.prompt.trim().length < 2) {
    return '音乐描述至少 2 个字符'
  }
  if (p.lyrics && p.lyrics.length > 4000) {
    return '歌词不能超过 4000 字符'
  }
  return null
}
