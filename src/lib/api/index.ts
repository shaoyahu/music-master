/**
 * API 模块入口
 */
import { createMockBackend, defaultMockConfig, type MockBackend } from './mock'
import { ApiClient } from './client'
import { createMusicService, type MusicService } from './music'
import { createLyricsService, type LyricsService } from './lyrics'
import { createCoverService, type CoverService } from './cover'

export interface ApiContainer {
  music: MusicService
  lyrics: LyricsService
  cover: CoverService
  mock: MockBackend
  client: ApiClient
}

export function createApiContainer(opts: {
  useMock?: boolean
  apiKey?: string
  baseUrl?: string
  mockConfig?: typeof defaultMockConfig
} = {}): ApiContainer {
  const useMock = opts.useMock ?? true
  const baseUrl = opts.baseUrl ?? 'https://api.minimaxi.com'
  const mock = createMockBackend(opts.mockConfig ?? defaultMockConfig)
  const client = new ApiClient(baseUrl, opts.apiKey ? { Authorization: `Bearer ${opts.apiKey}` } : {})
  return {
    music: createMusicService({ mock, client, useMock }),
    lyrics: createLyricsService({ mock, client, useMock }),
    cover: createCoverService({ mock, client, useMock }),
    mock,
    client,
  }
}

export { AppError, getApiErrorMessage } from '@/domain/errors'

/** 可重建的 API 容器：apiKey 变更时重建 client */
let _container = createApiContainer()

export const apiContainer: ApiContainer = new Proxy({} as ApiContainer, {
  get(_target, prop: string) {
    return (_container as Record<string, unknown>)[prop]
  },
})

export function rebuildApiContainer(apiKey: string): void {
  _container = createApiContainer({ apiKey })
}
