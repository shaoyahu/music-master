import type { LyricsGenParams, LyricsResult } from '@/domain/lyrics'
import type { MockBackend } from './mock'
import { ApiClient } from './client'
import { AppError } from '@/domain/errors'
import { validateLyricsParams } from '@/domain/lyrics'

export interface LyricsService {
  generate(params: LyricsGenParams, signal?: AbortSignal): Promise<LyricsResult>
}

export function createLyricsService(deps: { mock: MockBackend; client: ApiClient; useMock: boolean }): LyricsService {
  return {
    async generate(params, signal) {
      const err = validateLyricsParams(params)
      if (err) throw new AppError(err, 'VALIDATION')
      if (deps.useMock) {
        return deps.mock.generateLyrics(params, signal)
      }
      return deps.client.post<LyricsResult>('/v1/lyrics_generation', params, { signal })
    },
  }
}
