import { describe, it, expect } from 'vitest'
import { createMockBackend, defaultMockConfig } from '@/lib/api/mock'
import { createApiContainer } from '@/lib/api'

describe('MockBackend', () => {
  const config = { ...defaultMockConfig, musicErrorRate: 0, lyricsErrorRate: 0, coverErrorRate: 0 }
  const mock = createMockBackend(config)

  it('generates music with valid format', async () => {
    const result = await mock.generateMusic({ prompt: 'pop song', lyrics: '', format: 'url' })
    expect(result.id).toMatch(/^music_/)
    expect(result.audioUrl).toMatch(/^data:audio\/wav;base64,/)
    expect(result.duration).toBeGreaterThan(0)
  })

  it('generates lyrics in full mode', async () => {
    const result = await mock.generateLyrics({ prompt: 'love', mode: 'full' })
    expect(result.content).toContain('[')
    expect(result.mode).toBe('full')
  })

  it('generates lyrics in continue mode', async () => {
    const result = await mock.generateLyrics({
      prompt: 'love',
      mode: 'continue',
      existing: '[Verse]\nhello world',
    })
    expect(result.content).toContain('[Verse]')
    expect(result.content).toContain('hello world')
  })

  it('preprocesses cover file', async () => {
    const result = await mock.preprocessCover({ name: 'test.mp3', size: 1000000 })
    expect(result.id).toMatch(/^cover_pre_/)
    expect(result.duration).toBeGreaterThan(0)
  })

  it('generates cover', async () => {
    const result = await mock.generateCover({ preprocessId: 'pre_1', prompt: 'rock' })
    expect(result.sourceId).toBe('pre_1')
    expect(result.audioUrl).toMatch(/^data:audio\/wav;base64,/)
  })

  it('aborts on signal', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(
      mock.generateMusic({ prompt: 'x', lyrics: '', format: 'url' }, controller.signal),
    ).rejects.toThrow()
  })
})

describe('ApiContainer', () => {
  it('exposes all services', () => {
    const container = createApiContainer({ useMock: true })
    expect(container.music).toBeDefined()
    expect(container.lyrics).toBeDefined()
    expect(container.cover).toBeDefined()
    expect(container.mock).toBeDefined()
    expect(container.client).toBeDefined()
  })

  it('validates music params (throws VALIDATION)', async () => {
    const container = createApiContainer({ useMock: true })
    await expect(
      container.music.generate({ prompt: '', lyrics: '', format: 'url' }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('validates lyrics params for continue mode (throws VALIDATION)', async () => {
    const container = createApiContainer({ useMock: true })
    await expect(
      container.lyrics.generate({ prompt: 'x', mode: 'continue' }),
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })
})
