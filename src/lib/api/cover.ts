import type { CoverPreprocessResult, CoverGenParams, CoverGenResult } from '@/domain/cover'
import type { MockBackend } from './mock'
import { ApiClient } from './client'
import { AppError } from '@/domain/errors'
import { validateCoverParams } from '@/domain/cover'

export interface CoverService {
  preprocess(file: { name: string; size: number }, signal?: AbortSignal): Promise<CoverPreprocessResult>
  generate(params: CoverGenParams, signal?: AbortSignal): Promise<CoverGenResult>
}

export function createCoverService(deps: { mock: MockBackend; client: ApiClient; useMock: boolean }): CoverService {
  return {
    async preprocess(file, signal) {
      if (!file || !file.name || typeof file.size !== 'number' || file.size <= 0) {
        throw new AppError('无效的音频文件', 'VALIDATION')
      }
      if (deps.useMock) {
        return deps.mock.preprocessCover(file, signal)
      }
      return deps.client.post<CoverPreprocessResult>('/v1/music_cover_preprocess', file, { signal })
    },
    async generate(params, signal) {
      const err = validateCoverParams(params)
      if (err) throw new AppError(err, 'VALIDATION')
      if (deps.useMock) {
        return deps.mock.generateCover(params, signal)
      }
      return deps.client.post<CoverGenResult>('/v1/music_cover', params, { signal })
    },
  }
}
