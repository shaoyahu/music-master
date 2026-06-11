import { describe, it, expect } from 'vitest'
import { parseNcmHeader } from '@/lib/ncm/decrypt'
import { CryptoError } from '@/domain/errors'

describe('parseNcmHeader', () => {
  function buildNcm(opts: { keyLen?: number; metaLen?: number; includeGap?: boolean } = {}) {
    const data = new Uint8Array(64)
    // Magic NETC
    data[0] = 0x4e
    data[1] = 0x45
    data[2] = 0x54
    data[3] = 0x43
    let offset = 4
    if (opts.includeGap !== false) {
      data[offset++] = 0x00
    }
    const keyLen = opts.keyLen ?? 16
    data[offset++] = keyLen & 0xff
    data[offset++] = (keyLen >> 8) & 0xff
    offset += 2
    offset += keyLen
    const metaLen = opts.metaLen ?? 8
    data[offset++] = metaLen & 0xff
    offset += 3
    offset += metaLen
    offset += 4 // CRC
    offset += 4 // gap
    return { data, audioOffset: offset }
  }

  it('parses valid NCM header with gap', () => {
    const { data, audioOffset } = buildNcm()
    const header = parseNcmHeader(data)
    expect(header.keyLength).toBe(16)
    expect(header.metadataLength).toBe(8)
    expect(header.audioOffset).toBe(audioOffset)
  })

  it('parses valid NCM header without gap', () => {
    const { data, audioOffset } = buildNcm({ includeGap: false })
    const header = parseNcmHeader(data)
    expect(header.audioOffset).toBe(audioOffset)
  })

  it('throws on too-short data', () => {
    const data = new Uint8Array(4)
    expect(() => parseNcmHeader(data)).toThrow(CryptoError)
  })

  it('throws on bad magic', () => {
    const data = new Uint8Array(64)
    data[0] = 0xff
    data[1] = 0xff
    data[2] = 0xff
    data[3] = 0xff
    expect(() => parseNcmHeader(data)).toThrow(/magic/)
  })

  it('throws when key length extends past file', () => {
    const data = new Uint8Array(8)
    // magic
    data[0] = 0x4e; data[1] = 0x45; data[2] = 0x54; data[3] = 0x43
    data[4] = 0x00
    data[5] = 0xff; data[6] = 0xff; data[7] = 0xff // claims huge key
    expect(() => parseNcmHeader(data)).toThrow(/文件/)
  })
})
