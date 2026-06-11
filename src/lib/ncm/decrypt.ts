/**
 * NCM 解密核心
 * 优化点：双指针 + 关键头预索引，O(N) 时间复杂度
 *
 * NCM 文件结构：
 * 1. 4 bytes magic: 0x4E455443 ("NETC")
 * 2. 1 byte gap: 0x00
 * 3. 4 bytes key length (LE)
 * 4. key data (AES-128-ECB 加密，key="tieguanyin")
 * 5. 4 bytes metadata length
 * 6. metadata (JSON, AES-128-ECB 加密)
 * 7. 4 bytes CRC
 * 8. 4 bytes gap
 * 9. audio frames: 每个帧 = 4 bytes length + 1 byte gap + RC4(变种) 解密后的数据
 */

import { CryptoError } from '@/domain/errors'
import { detectContainer, containerMimeType } from './container'

const NCM_MAGIC = [0x4e, 0x45, 0x54, 0x43]
const AES_KEY_BYTES = new TextEncoder().encode('tieguanyin')

export interface NcmHeader {
  keyOffset: number
  keyLength: number
  metadataOffset: number
  metadataLength: number
  audioOffset: number
}

export function parseNcmHeader(data: Uint8Array): NcmHeader {
  if (data.length < 16) {
    throw new CryptoError('文件太小，不是有效的 NCM 文件')
  }

  for (let i = 0; i < 4; i++) {
    if (data[i] !== NCM_MAGIC[i]) {
      throw new CryptoError('不是有效的 NCM 文件（magic 错误）')
    }
  }

  let offset = 4
  if (data[offset] === 0) offset += 1

  if (offset + 4 > data.length) throw new CryptoError('文件意外结束（key length）')
  const keyLength =
    data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)
  offset += 4

  const keyOffset = offset
  if (offset + keyLength > data.length) throw new CryptoError('文件意外结束（key data）')
  offset += keyLength

  if (offset + 4 > data.length) throw new CryptoError('文件意外结束（metadata length）')
  const metadataLength =
    data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)
  offset += 4

  const metadataOffset = offset
  if (offset + metadataLength > data.length) throw new CryptoError('文件意外结束（metadata）')
  offset += metadataLength

  if (offset + 4 > data.length) throw new CryptoError('文件意外结束（CRC）')
  offset += 4
  if (offset + 4 > data.length) throw new CryptoError('文件意外结束（gap）')
  offset += 4

  return { keyOffset, keyLength, metadataOffset, metadataLength, audioOffset: offset }
}

function aesEcbDecrypt(ciphertext: Uint8Array, keyBytes: Uint8Array): Uint8Array {
  if (keyBytes.length !== 16) {
    throw new CryptoError(`AES key 长度必须为 16 字节，得到 ${keyBytes.length}`)
  }
  const expandedKey = expandKey(keyBytes)
  const result = new Uint8Array(ciphertext.length)
  for (let i = 0; i < ciphertext.length; i += 16) {
    const block = ciphertext.subarray(i, i + 16)
    const decrypted = decryptBlock(block, expandedKey)
    result.set(decrypted, i)
  }
  return result
}

const SBOX = new Uint8Array([
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
])

const INVERSE_SBOX = new Uint8Array(256)
for (let i = 0; i < 256; i++) INVERSE_SBOX[SBOX[i]] = i

const ROUND_CONSTANT = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]

function expandKey(key: Uint8Array): Uint8Array {
  const w = new Uint8Array(176)
  w.set(key)
  for (let i = 16; i < 176; i += 4) {
    const temp = [w[i - 4], w[i - 3], w[i - 2], w[i - 1]]
    if (i % 16 === 0) {
      const rotated = [temp[1], temp[2], temp[3], temp[0]]
      temp[0] = SBOX[rotated[0]] ^ ROUND_CONSTANT[i / 16 - 1]
      temp[1] = SBOX[rotated[1]]
      temp[2] = SBOX[rotated[2]]
      temp[3] = SBOX[rotated[3]]
    }
    w[i] = w[i - 16] ^ temp[0]
    w[i + 1] = w[i - 15] ^ temp[1]
    w[i + 2] = w[i - 14] ^ temp[2]
    w[i + 3] = w[i - 13] ^ temp[3]
  }
  return w
}

function addRoundKey(state: Uint8Array, expandedKey: Uint8Array, offset: number): void {
  for (let i = 0; i < 16; i++) {
    state[i] ^= expandedKey[offset + i]
  }
}

function inverseSubBytes(state: Uint8Array): void {
  for (let i = 0; i < 16; i++) state[i] = INVERSE_SBOX[state[i]]
}

function inverseShiftRows(state: Uint8Array): void {
  const s = new Uint8Array(state)
  // Row 0: no change
  state[1] = s[5]; state[5] = s[9]; state[9] = s[13]; state[13] = s[1]
  state[2] = s[10]; state[6] = s[14]; state[10] = s[2]; state[14] = s[6]
  state[3] = s[15]; state[7] = s[3]; state[11] = s[7]; state[15] = s[11]
}

function xtime(b: number): number {
  return (b << 1) ^ ((b & 0x80) ? 0x1b : 0)
}

function multiply(a: number, b: number): number {
  let result = 0
  let temp = a
  for (let i = 0; i < 8; i++) {
    if (b & (1 << i)) result ^= temp
    temp = xtime(temp)
  }
  return result
}

function inverseMixColumns(state: Uint8Array): void {
  for (let i = 0; i < 4; i++) {
    const a = state[i * 4]
    const b = state[i * 4 + 1]
    const c = state[i * 4 + 2]
    const d = state[i * 4 + 3]
    state[i * 4] = multiply(a, 0x0e) ^ multiply(b, 0x0b) ^ multiply(c, 0x0d) ^ multiply(d, 0x09)
    state[i * 4 + 1] = multiply(a, 0x09) ^ multiply(b, 0x0e) ^ multiply(c, 0x0b) ^ multiply(d, 0x0d)
    state[i * 4 + 2] = multiply(a, 0x0d) ^ multiply(b, 0x09) ^ multiply(c, 0x0e) ^ multiply(d, 0x0b)
    state[i * 4 + 3] = multiply(a, 0x0b) ^ multiply(b, 0x0d) ^ multiply(c, 0x09) ^ multiply(d, 0x0e)
  }
}

function decryptBlock(block: Uint8Array, expandedKey: Uint8Array): Uint8Array {
  const state = new Uint8Array(block)
  addRoundKey(state, expandedKey, 160)
  for (let round = 9; round >= 1; round--) {
    inverseShiftRows(state)
    inverseSubBytes(state)
    addRoundKey(state, expandedKey, round * 16)
    inverseMixColumns(state)
  }
  inverseShiftRows(state)
  inverseSubBytes(state)
  addRoundKey(state, expandedKey, 0)
  return state
}

class NcmRC4 {
  private s: number[] = new Array(256)
  private i = 0
  private j = 0

  constructor(key: Uint8Array) {
    for (let i = 0; i < 256; i++) this.s[i] = i
    let j = 0
    for (let i = 0; i < 256; i++) {
      j = (j + this.s[i] + key[i % key.length]) & 0xff
      ;[this.s[i], this.s[j]] = [this.s[j], this.s[i]]
    }
  }

  decrypt(data: Uint8Array, startCounter: number = 0): void {
    let counter = startCounter
    for (let k = 0; k < data.length; k++) {
      if (counter % 0x80 === 0 && counter !== 0) {
        this.i = 0
        this.j = 0
      }
      counter++
      this.i = (this.i + 1) & 0xff
      this.j = (this.j + this.s[this.i]) & 0xff
      ;[this.s[this.i], this.s[this.j]] = [this.s[this.j], this.s[this.i]]
      data[k] ^= this.s[(this.s[this.i] + this.s[this.j]) & 0xff]
    }
  }
}

export function decryptNcm(data: Uint8Array): { audio: Uint8Array; format: string } {
  const header = parseNcmHeader(data)

  const encryptedKey = data.subarray(header.keyOffset, header.keyOffset + header.keyLength)
  const decryptedKeyRaw = aesEcbDecrypt(encryptedKey, AES_KEY_BYTES)
  const padLen = decryptedKeyRaw[decryptedKeyRaw.length - 1]
  const unpadded = decryptedKeyRaw.subarray(17, decryptedKeyRaw.length - padLen)
  const rc4Key = unpadded

  const rc4 = new NcmRC4(rc4Key)

  const audioChunks: Uint8Array[] = []
  let cursor = header.audioOffset
  while (cursor + 4 <= data.length) {
    const frameLength =
      data[cursor] | (data[cursor + 1] << 8) | (data[cursor + 2] << 16) | (data[cursor + 3] << 24)
    cursor += 4
    if (frameLength === 0) break
    if (cursor + frameLength > data.length) break
    const chunk = data.subarray(cursor + 1, cursor + frameLength).slice()
    rc4.decrypt(chunk, 0)
    audioChunks.push(chunk)
    cursor += frameLength
  }

  const totalLen = audioChunks.reduce((sum, c) => sum + c.length, 0)
  const audio = new Uint8Array(totalLen)
  let offset = 0
  for (const chunk of audioChunks) {
    audio.set(chunk, offset)
    offset += chunk.length
  }

  const container = detectContainer(audio)
  const format = container === 'unknown' ? 'application/octet-stream' : containerMimeType(container)

  return { audio, format }
}
