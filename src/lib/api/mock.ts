/**
 * Mock 后端：模拟 MiniMax API 行为
 * - 可配置延迟
 * - 可配置错误注入概率
 * - 返回合理的假数据
 */

import type { MusicGenParams, MusicGenResult } from '@/domain/music'
import type { LyricsGenParams, LyricsResult } from '@/domain/lyrics'
import type { CoverPreprocessResult, CoverGenParams, CoverGenResult } from '@/domain/cover'
import { genId } from '@/lib/utils/id'
import { AppError, RateLimitError } from '@/domain/errors'

export interface MockConfig {
  musicDelayMs: [number, number]
  musicErrorRate: number
  lyricsDelayMs: [number, number]
  lyricsErrorRate: number
  coverDelayMs: [number, number]
  coverErrorRate: number
}

export const defaultMockConfig: MockConfig = {
  musicDelayMs: [200, 1500],
  musicErrorRate: 0.1,
  lyricsDelayMs: [200, 500],
  lyricsErrorRate: 0.05,
  coverDelayMs: [500, 1000],
  coverErrorRate: 0.08,
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const id = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(id)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

function randomDelay(range: [number, number]): number {
  const [min, max] = range
  return min + Math.random() * (max - min)
}

function maybeThrow(rate: number, message: string, status = 500): never | void {
  if (Math.random() < rate) {
    if (status === 429) {
      throw new RateLimitError(message)
    }
    throw new AppError(message, status >= 500 ? 'SERVER' : 'UNKNOWN', { status })
  }
}

/**
 * 生成 1 秒静音 WAV (base64)
 */
function generateSilentWavBase64(durationSec = 1, sampleRate = 8000): string {
  const numSamples = durationSec * sampleRate
  const dataSize = numSamples * 2
  const fileSize = 36 + dataSize
  const buf = new Uint8Array(44 + dataSize)
  const view = new DataView(buf.buffer)
  // RIFF header
  buf.set([0x52, 0x49, 0x46, 0x46], 0) // "RIFF"
  view.setUint32(4, fileSize, true)
  buf.set([0x57, 0x41, 0x56, 0x45], 8) // "WAVE"
  buf.set([0x66, 0x6d, 0x74, 0x20], 12) // "fmt "
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  buf.set([0x64, 0x61, 0x74, 0x61], 36)
  view.setUint32(40, dataSize, true)
  // 静音采样（已默认为 0）
  return arrayBufferToBase64(buf.buffer)
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

const TEMPLATE_LYRICS = [
  '[Verse]\n阳光洒在窗台\n你轻轻走来\n[Chorus]\n这是我们的时代\n唱一首不散的歌',
  '[Verse]\n城市的灯光\n点亮一个人的夜\n[Chorus]\n我走过风雨\n只为遇见你',
  '[Verse]\n风从远方来\n带着思念的味道\n[Chorus]\n握紧你的手\n直到永远',
]

export interface MockBackend {
  generateMusic(params: MusicGenParams, signal?: AbortSignal): Promise<MusicGenResult>
  generateLyrics(params: LyricsGenParams, signal?: AbortSignal): Promise<LyricsResult>
  preprocessCover(file: { name: string; size: number }, signal?: AbortSignal): Promise<CoverPreprocessResult>
  generateCover(params: CoverGenParams, signal?: AbortSignal): Promise<CoverGenResult>
}

export function createMockBackend(config: MockConfig = defaultMockConfig): MockBackend {
  return {
    async generateMusic(params, signal) {
      await sleep(randomDelay(config.musicDelayMs), signal)
      maybeThrow(config.musicErrorRate, '音乐生成失败（mock）')
      const base64 = generateSilentWavBase64()
      return {
        id: genId('music'),
        audioUrl: `data:audio/wav;base64,${base64}`,
        audioHex: base64,
        duration: 1,
        format: params.format ?? 'url',
        createdAt: Date.now(),
      }
    },

    async generateLyrics(params, signal) {
      await sleep(randomDelay(config.lyricsDelayMs), signal)
      maybeThrow(config.lyricsErrorRate, '歌词生成失败（mock）', 429)
      const content =
        params.mode === 'continue' && params.existing
          ? `${params.existing}\n\n[Verse 2]\n${TEMPLATE_LYRICS[1]}`
          : TEMPLATE_LYRICS[Math.floor(Math.random() * TEMPLATE_LYRICS.length)]
      return {
        id: genId('lyrics'),
        content,
        style: params.style ?? 'pop',
        mode: params.mode,
        createdAt: Date.now(),
      }
    },

    async preprocessCover(file, signal) {
      await sleep(randomDelay(config.coverDelayMs), signal)
      maybeThrow(config.coverErrorRate, '预处理失败（mock）')
      return {
        id: genId('cover_pre'),
        duration: Math.min(180, file.size / 16000),
        sampleRate: 44100,
        detectedLyrics: '原曲歌词（mock 提取）',
        metadata: {
          title: file.name.replace(/\.[^.]+$/, ''),
          bpm: 120,
        },
      }
    },

    async generateCover(params, signal) {
      await sleep(randomDelay(config.musicDelayMs), signal)
      maybeThrow(config.musicErrorRate, '翻唱生成失败（mock）')
      const base64 = generateSilentWavBase64()
      return {
        id: genId('cover'),
        audioUrl: `data:audio/wav;base64,${base64}`,
        audioHex: base64,
        sourceId: params.preprocessId,
        createdAt: Date.now(),
      }
    },
  }
}
