import type { MusicGenParams, MusicGenResult } from '@/domain/music'
import type { MockBackend } from './mock'
import { ApiClient } from './client'
import { AppError } from '@/domain/errors'
import { validateMusicParams } from '@/domain/music'

export interface MusicService {
  generate(params: MusicGenParams, signal?: AbortSignal): Promise<MusicGenResult>
}

export function createMusicService(deps: { mock: MockBackend; client: ApiClient; useMock: boolean }): MusicService {
  return {
    async generate(params, signal) {
      const err = validateMusicParams(params)
      if (err) throw new AppError(err, 'VALIDATION')
      if (deps.useMock) {
        return deps.mock.generateMusic(params, signal)
      }
      return deps.client.post<MusicGenResult>('/v1/music_generation', params, { signal })
    },
  }
}
