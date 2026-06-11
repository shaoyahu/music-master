import { describe, it, expect } from 'vitest'
import { detectContainer, containerMimeType } from '@/lib/ncm/container'

describe('detectContainer', () => {
  it('detects MP3 (ID3v2 header)', () => {
    const data = new Uint8Array([0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00])
    expect(detectContainer(data)).toBe('mp3')
  })

  it('detects FLAC', () => {
    const data = new Uint8Array([0x66, 0x4c, 0x61, 0x43, 0x00, 0x00])
    expect(detectContainer(data)).toBe('flac')
  })

  it('detects WAV (RIFF)', () => {
    const data = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00])
    expect(detectContainer(data)).toBe('wav')
  })

  it('detects OGG', () => {
    const data = new Uint8Array([0x4f, 0x67, 0x67, 0x53, 0x00, 0x02])
    expect(detectContainer(data)).toBe('ogg')
  })

  it('returns unknown for unrecognized headers', () => {
    const data = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    expect(detectContainer(data)).toBe('unknown')
  })

  it('returns unknown for very short data', () => {
    expect(detectContainer(new Uint8Array([0x66]))).toBe('unknown')
  })
})

describe('containerMimeType', () => {
  it('maps containers to MIME types', () => {
    expect(containerMimeType('mp3')).toBe('audio/mpeg')
    expect(containerMimeType('flac')).toBe('audio/flac')
    expect(containerMimeType('wav')).toBe('audio/wav')
    expect(containerMimeType('ogg')).toBe('audio/ogg')
    expect(containerMimeType('m4a')).toBe('audio/mp4')
    expect(containerMimeType('unknown')).toBe('application/octet-stream')
  })
})
