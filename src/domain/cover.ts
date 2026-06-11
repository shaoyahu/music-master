/**
 * 翻唱业务模型
 */

export interface CoverPreprocessResult {
  id: string
  duration: number
  sampleRate: number
  detectedLyrics: string
  metadata: {
    title?: string
    artist?: string
    bpm?: number
  }
}

export interface CoverGenParams {
  preprocessId: string
  prompt: string
  style?: string
}

export interface CoverGenResult {
  id: string
  audioUrl: string
  audioHex: string
  sourceId: string
  createdAt: number
}

export function validateCoverParams(p: CoverGenParams): string | null {
  if (!p.preprocessId) return '缺少预处理结果'
  if (!p.prompt || p.prompt.trim().length < 2) {
    return '翻唱描述至少 2 个字符'
  }
  return null
}
