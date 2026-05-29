/**
 * NCM (NetEase Cloud Music) file decoder
 *
 * AES-128-ECB + NCM-modified RC4 implementation ported from the reference
 * browser-based NCM converter (MIT license).
 */

// =============================================================================
// AES-128-ECB (hand-written, matches pycryptodome/reference output exactly)
// =============================================================================

const SBOX = new Uint8Array([0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16])
const RSBOX = new Uint8Array(256)
for (let i = 0; i < 256; i++) RSBOX[SBOX[i]] = i

const RCON = new Uint8Array([0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36])

class AES {
  private roundKeys: Uint8Array

  constructor(key: Uint8Array) {
    // Expand key into round keys (176 bytes = 11 rounds × 16 bytes)
    this.roundKeys = new Uint8Array(176)
    this.roundKeys.set(key)
    for (let i = 16; i < 176; i += 4) {
      let t = this.roundKeys.slice(i - 4, i)
      if (i % 16 === 0) {
        t = new Uint8Array([
          SBOX[t[1]] ^ RCON[i / 16 - 1],
          SBOX[t[2]],
          SBOX[t[3]],
          SBOX[t[0]],
        ])
      }
      for (let j = 0; j < 4; j++) {
        this.roundKeys[i + j] = this.roundKeys[i - 16 + j] ^ t[j]
      }
    }
  }

  decrypt(data: Uint8Array): Uint8Array {
    const result = new Uint8Array(data.length)
    for (let i = 0; i < data.length; i += 16) {
      result.set(this.decryptBlock(data.slice(i, i + 16)), i)
    }
    return result
  }

  private decryptBlock(block: Uint8Array): Uint8Array {
    const state = new Uint8Array(block)
    this.addRoundKey(state, 10)
    for (let round = 9; round > 0; round--) {
      this.invShiftRows(state)
      this.invSubBytes(state)
      this.addRoundKey(state, round)
      this.invMixColumns(state)
    }
    this.invShiftRows(state)
    this.invSubBytes(state)
    this.addRoundKey(state, 0)
    return state
  }

  private addRoundKey(state: Uint8Array, round: number): void {
    for (let i = 0; i < 16; i++) state[i] ^= this.roundKeys[round * 16 + i]
  }

  private invSubBytes(state: Uint8Array): void {
    for (let i = 0; i < 16; i++) state[i] = RSBOX[state[i]]
  }

  private invShiftRows(state: Uint8Array): void {
    let t = state[13]; state[13] = state[9]; state[9] = state[5]; state[5] = state[1]; state[1] = t
    t = state[2]; state[2] = state[10]; state[10] = t; t = state[6]; state[6] = state[14]; state[14] = t
    t = state[3]; state[3] = state[7]; state[7] = state[11]; state[11] = state[15]; state[15] = t
  }

  private invMixColumns(state: Uint8Array): void {
    for (let c = 0; c < 4; c++) {
      const i = c * 4
      const a = state.slice(i, i + 4)
      state[i]     = mul(0x0e, a[0]) ^ mul(0x0b, a[1]) ^ mul(0x0d, a[2]) ^ mul(0x09, a[3])
      state[i + 1] = mul(0x09, a[0]) ^ mul(0x0e, a[1]) ^ mul(0x0b, a[2]) ^ mul(0x0d, a[3])
      state[i + 2] = mul(0x0d, a[0]) ^ mul(0x09, a[1]) ^ mul(0x0e, a[2]) ^ mul(0x0b, a[3])
      state[i + 3] = mul(0x0b, a[0]) ^ mul(0x0d, a[1]) ^ mul(0x09, a[2]) ^ mul(0x0e, a[3])
    }
  }
}

function mul(a: number, b: number): number {
  let p = 0
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a
    const hi = a & 0x80
    a = (a << 1) & 0xff
    if (hi) a ^= 0x1b
    b >>= 1
  }
  return p
}

function pkcs7Unpad(data: Uint8Array): Uint8Array {
  return data.slice(0, data.length - data[data.length - 1])
}

// =============================================================================
// Key constants
// =============================================================================

const CORE_KEY = new Uint8Array([
  0x68, 0x7A, 0x48, 0x52, 0x41, 0x6D, 0x73, 0x6F,
  0x35, 0x6B, 0x49, 0x6E, 0x62, 0x61, 0x78, 0x57
])

// XOR fallback key for QQ Music CEFN/CEFNF/CTENF variants
const CEFN_KEY = new Uint8Array([
  0x23, 0x31, 0x34, 0x6C, 0x6B, 0x2F, 0x6D, 0x6E,
  0x38, 0x4B, 0x42, 0x39, 0x35, 0x26, 0x54, 0x64
])

const NCM_HEADER_SIZE = 14
const MAX_KEY_LENGTH = 1024

function assertCanRead(bytes: Uint8Array, offset: number, length: number, label: string): void {
  if (offset < 0 || length < 0 || offset + length > bytes.length) {
    throw new Error(`${label} is outside file bounds`)
  }
}

function readUint32LE(bytes: Uint8Array, offset: number, label: string): number {
  assertCanRead(bytes, offset, 4, label)
  return (
    bytes[offset] +
    bytes[offset + 1] * 0x100 +
    bytes[offset + 2] * 0x10000 +
    bytes[offset + 3] * 0x1000000
  )
}

function validateKeyLength(bytes: Uint8Array, keyLength: number, options: { requireStandardLength?: boolean } = {}): void {
  if (!Number.isInteger(keyLength) || keyLength <= 0 || keyLength > MAX_KEY_LENGTH) {
    throw new Error(`Invalid key length: ${keyLength}`)
  }

  if (keyLength % 16 !== 0) {
    throw new Error(`Invalid key length: ${keyLength} (must be AES block aligned)`)
  }

  if (options.requireStandardLength && keyLength !== 128) {
    throw new Error(`Unexpected key length: ${keyLength} (expected 128 for AES-128)`)
  }

  assertCanRead(bytes, NCM_HEADER_SIZE, keyLength, 'Encrypted key')
}

/**
 * Initialize RC4 key box (key schedule)
 * @param keyData - Raw RC4 key bytes
 * @returns 256-byte key box
 */
function initRC4KeyBox(keyData: Uint8Array): Uint8Array {
  if (keyData.length === 0) {
    throw new Error('Invalid RC4 key: empty key data')
  }

  const keyBox = new Uint8Array(256)
  for (let i = 0; i < 256; i++) {
    keyBox[i] = i
  }

  let j = 0
  for (let i = 0; i < 256; i++) {
    j = (j + keyBox[i] + keyData[i % keyData.length]) & 0xFF
    const temp = keyBox[i]
    keyBox[i] = keyBox[j]
    keyBox[j] = temp
  }

  return keyBox
}

/**
 * Decrypt audio data using NCM's modified RC4 PRGA
 * Each byte: buffer[i] ^= keyBox[(keyBox[j] + keyBox[(keyBox[j] + j) & 0xff]) & 0xff]
 * where j = (i + 1) & 0xff
 */
function decryptAudioNCMRC4(audioData: Uint8Array, keyBox: Uint8Array): Uint8Array {
  const decrypted = new Uint8Array(audioData.length)
  for (let i = 0; i < audioData.length; i++) {
    const j = (i + 1) & 0xFF
    const idx = (keyBox[j] + keyBox[(keyBox[j] + j) & 0xFF]) & 0xFF
    decrypted[i] = audioData[i] ^ keyBox[idx]
  }
  return decrypted
}

/**
 * Decrypt audio data using standard RC4
 * KeyBox is already initialized RC4 state
 */
function decryptAudioStandardRC4(audioData: Uint8Array, keyBox: Uint8Array): Uint8Array {
  const decrypted = new Uint8Array(audioData.length)
  let iBox = 0
  let j = 0
  for (let i = 0; i < audioData.length; i++) {
    iBox = (iBox + 1) & 0xFF
    j = (j + keyBox[iBox]) & 0xFF
    const temp = keyBox[iBox]
    keyBox[iBox] = keyBox[j]
    keyBox[j] = temp
    const idx = (keyBox[iBox] + keyBox[j]) & 0xFF
    decrypted[i] = audioData[i] ^ keyBox[idx]
  }
  return decrypted
}

/**
 * Extract and decrypt RC4 key from NCM file
 * @param bytes - File bytes
 * @param keyLength - Length of AES-encrypted RC4 key (should be 128 for AES-128)
 * @returns raw RC4 key (16 bytes)
 */
function extractRC4Key(bytes: Uint8Array, keyLength: number): Uint8Array {
  validateKeyLength(bytes, keyLength, { requireStandardLength: true })

  // Extract encrypted key from offset 14, each byte XOR 0x64
  const encryptedKey = new Uint8Array(keyLength)
  for (let i = 0; i < keyLength; i++) {
    encryptedKey[i] = bytes[14 + i] ^ 0x64
  }

  // AES-ECB decrypt with sCoreKey
  const aesEcb = new AES(CORE_KEY)
  const decryptedKey = aesEcb.decrypt(encryptedKey)

  // Strip PKCS7 padding
  const padLen = decryptedKey[decryptedKey.length - 1]
  const unpadded = (padLen > 0 && padLen <= 16)
    ? decryptedKey.slice(0, decryptedKey.length - padLen)
    : decryptedKey

  // First 17 bytes are "neteasecloudmusic" prefix - ALL remaining bytes are the RC4 key
  const rc4Key = unpadded.slice(17)

  if (rc4Key.length < 1) {
    throw new Error(`RC4 key extraction failed: got ${rc4Key.length} bytes after prefix`)
  }

  return rc4Key
}

/**
 * Find the start offset of audio data in NCM file
 * @param bytes - File bytes
 * @param keyLength - Length of AES-encrypted RC4 key
 * @returns offset where audio data begins
 */
function findAudioStart(bytes: Uint8Array, keyLength: number): number {
  let offset = NCM_HEADER_SIZE + keyLength // Skip past key data

  // Metadata length (4 bytes, little-endian)
  const metadataLength = readUint32LE(bytes, offset, 'Metadata length')
  offset += 4 + metadataLength // Skip metadata length + metadata

  // Skip 5 reserved bytes (reference impl uses 5, not 9)
  offset += 5

  // Image data space used (4 bytes, LE)
  const imageSpace = readUint32LE(bytes, offset, 'Image data space')
  offset += 4

  // Image data actual length (4 bytes, LE)
  const imageSize = readUint32LE(bytes, offset, 'Image data size')
  offset += 4

  // Skip image data if present (use imageSpace for allocation size)
  if (imageSize > 0 && imageSize <= imageSpace) {
    assertCanRead(bytes, offset, imageSpace, 'Image data')
    offset += imageSpace
  }

  return offset
}

/**
 * Validate MP3 frame header
 */
function isValidMP3Frame(byte0: number, byte1: number): boolean {
  return byte0 === 0xFF && (byte1 === 0xFB || byte1 === 0xF3 || byte1 === 0xF2)
}

type AudioFormat = 'mp3' | 'flac' | 'wav' | 'ogg' | 'unknown'

interface AudioProbeResult {
  format: AudioFormat
  offset: number
  score: number
}

interface DecodedAudio {
  data: Uint8Array
  format: AudioFormat
}

function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000
  let binary = ''

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return btoa(binary)
}

function detectAudioFormatAtOffset(data: Uint8Array, offset = 0): AudioFormat {
  if (offset < 0 || offset >= data.length) {
    return 'unknown'
  }

  if (data[offset] === 0x66 && data[offset + 1] === 0x4C && data[offset + 2] === 0x61 && data[offset + 3] === 0x43) {
    return 'flac'
  }

  if (
    data[offset] === 0x49 &&
    data[offset + 1] === 0x44 &&
    data[offset + 2] === 0x33
  ) {
    return 'mp3'
  }

  if (
    data[offset] === 0x52 &&
    data[offset + 1] === 0x49 &&
    data[offset + 2] === 0x46 &&
    data[offset + 3] === 0x46 &&
    data[offset + 8] === 0x57 &&
    data[offset + 9] === 0x41 &&
    data[offset + 10] === 0x56 &&
    data[offset + 11] === 0x45
  ) {
    return 'wav'
  }

  if (
    data[offset] === 0x4F &&
    data[offset + 1] === 0x67 &&
    data[offset + 2] === 0x67 &&
    data[offset + 3] === 0x53
  ) {
    return 'ogg'
  }

  if (isValidMP3Frame(data[offset], data[offset + 1])) {
    return 'mp3'
  }

  return 'unknown'
}

function probeAudioData(data: Uint8Array): AudioProbeResult {
  const directFormat = detectAudioFormatAtOffset(data, 0)
  if (directFormat !== 'unknown') {
    return { format: directFormat, offset: 0, score: directFormat === 'mp3' ? 3 : 4 }
  }

  let bestResult: AudioProbeResult = { format: 'unknown', offset: -1, score: 0 }
  const searchLimit = Math.min(data.length - 4, 128 * 1024)

  for (let offset = 0; offset < searchLimit; offset++) {
    const format = detectAudioFormatAtOffset(data, offset)
    if (format === 'unknown') {
      continue
    }

    const score = format === 'mp3' ? 3 : 4
    if (score > bestResult.score || (score === bestResult.score && offset < bestResult.offset)) {
      bestResult = { format, offset, score }
      if (score === 4) {
        break
      }
    }
  }

  return bestResult
}

function normalizeDecodedAudio(data: Uint8Array): DecodedAudio {
  const probe = probeAudioData(data)

  if (probe.offset < 0 || probe.format === 'unknown') {
    throw new Error('未能识别解密后的音频格式')
  }

  const normalized = probe.offset === 0 ? data : data.slice(probe.offset)
  return {
    data: normalized,
    format: probe.format,
  }
}

/**
 * Decode standard NCM file (ctncm format)
 */
function decodeStandardNCM(bytes: Uint8Array): DecodedAudio {
  // Key length at offset 10 (4 bytes, little-endian)
  const keyLength = readUint32LE(bytes, 10, 'Key length')
  validateKeyLength(bytes, keyLength, { requireStandardLength: true })

  // Extract and decrypt RC4 key
  const rc4Key = extractRC4Key(bytes, keyLength)

  // Initialize RC4 key box and build key stream
  const keyBox = initRC4KeyBox(rc4Key)

  // Find audio data start
  const audioStart = findAudioStart(bytes, keyLength)

  if (audioStart >= bytes.length) {
    throw new Error('Could not find audio data: start offset beyond file end')
  }

  const audioData = bytes.slice(audioStart)
  const decryptedAudio = decryptAudioNCMRC4(audioData, keyBox)

  return normalizeDecodedAudio(decryptedAudio)
}

/**
 * Decode CEFN/CEFNF/CEFNF (QQ Music) format
 * Uses RC4-like decryption similar to standard NCM
 */
/**
 * Score a decrypted audio chunk by recognizable container/header patterns.
 */
function scoreAudioChunk(data: Uint8Array): number {
  const probe = probeAudioData(data)
  if (probe.format === 'unknown') {
    return 0
  }

  return probe.score * 1000 - Math.max(probe.offset, 0)
}

/**
 * Test a specific (keyBox, variant, audioStart) configuration and return the
 * format score in the first testLen bytes. Higher score = better decryption.
 */
function testDecryptConfig(
  bytes: Uint8Array,
  keyBox: Uint8Array,
  audioStart: number,
  variant: 'ncm' | 'std',
  testLen: number
): number {
  const testEncrypted = bytes.slice(audioStart, audioStart + testLen)
  const keyBoxCopy = new Uint8Array(keyBox)
  const decrypted = variant === 'std'
    ? decryptAudioStandardRC4(testEncrypted, keyBoxCopy)
    : decryptAudioNCMRC4(testEncrypted, keyBox)
  return scoreAudioChunk(decrypted)
}

function decodeCEFNLike(bytes: Uint8Array): DecodedAudio {
  // Read key_length at offset 10 (4 bytes LE)
  const keyLength = readUint32LE(bytes, 10, 'Key length')
  validateKeyLength(bytes, keyLength)

  // Extract and AES-decrypt the key data (common to both paths)
  const encryptedKey = new Uint8Array(keyLength)
  for (let i = 0; i < keyLength; i++) {
    encryptedKey[i] = bytes[14 + i] ^ 0x64
  }
  const aesEcb = new AES(CORE_KEY)
  const decryptedKey = aesEcb.decrypt(encryptedKey)

  // Build candidate RC4 key positions from the decrypted data.
  // For standard NCM, the key is at bytes 17-32 (right after the 17-byte prefix).
  // For CTENFDAM variants, the key may be at a different offset or longer.
  function buildCandidateKeys(): Uint8Array[] {
    // Find the "neteasecloudmusic" prefix
    let prefixOffset = -1
    for (let i = 0; i < decryptedKey.length - 17; i++) {
      if (decryptedKey[i] === 0x6E && decryptedKey[i+1] === 0x65 &&
          String.fromCharCode(decryptedKey[i], decryptedKey[i+1], decryptedKey[i+2], decryptedKey[i+3]) === 'nete') {
        prefixOffset = i
        break
      }
    }

    const keys: Uint8Array[] = []

    if (prefixOffset >= 0) {
      // The reference implementation uses ALL bytes after the 17-byte prefix
      // (after PKCS7 unpadding) as the RC4 key, NOT just 16 bytes.
      // For keyLength=128: ~110 bytes after prefix
      // For keyLength=144: ~126 bytes after prefix
      const unpaddedKey = pkcs7Unpad(decryptedKey)
      const fullRc4Key = unpaddedKey.slice(prefixOffset + 17)
      if (fullRc4Key.length > 0) {
        keys.push(fullRc4Key)
        // Also try the traditional 16-byte subset as fallback
        if (fullRc4Key.length >= 16) {
          keys.push(fullRc4Key.slice(0, 16))
        }
      }
    } else {
      // No prefix found: try raw decrypted data
      const unpadded = pkcs7Unpad(decryptedKey)
      if (unpadded.length > 0) {
        keys.push(unpadded)
      }
      if (decryptedKey.length >= 16) {
        keys.push(decryptedKey.slice(0, 16))
      }
    }

    return keys
  }

  const candidateKeys = buildCandidateKeys()
  if (candidateKeys.length === 0) {
    return decodeCEFNLikeXOR(bytes)
  }

  // Compute the structural audio start from file layout (works for all key lengths)
  const structAudioStart = findCEFNAudioStart(bytes, keyLength)

  // Build the set of test positions: structural position + hardcoded + scan positions
  const testPositions = new Set<number>([structAudioStart])
  const hardcodedPositions = [9476, 13456, 10000, 20000, 30000, 50000, 100000, 200000, 300000, 400000, 446000, 500000, 600000, 700000, 800000]
  for (const p of hardcodedPositions) {
    if (p < bytes.length - 4) testPositions.add(p)
  }
  // Add structAudioStart ± small offsets to account for alignment
  for (let delta = -200; delta <= 200; delta += 100) {
    const p = structAudioStart + delta
    if (p > 0 && p < bytes.length - 4) testPositions.add(p)
  }

  const testLen = 2000 // longer test window for better signal

  // Try every combination of (key, position, variant) and pick the best
  let bestScore = 0
  let bestKeyBox: Uint8Array | null = null
  let bestPos = -1
  let bestVariant: 'ncm' | 'std' = 'ncm'
  const variants: Array<'ncm' | 'std'> = ['ncm', 'std']
  const posArray = Array.from(testPositions)

  for (const candidateKey of candidateKeys) {
    const keyBox = initRC4KeyBox(candidateKey)

    for (const pos of posArray) {
      if (pos >= bytes.length - testLen) continue
      for (const variant of variants) {
        const score = testDecryptConfig(bytes, keyBox, pos, variant, testLen)
        if (score > bestScore) {
          bestScore = score
          bestKeyBox = keyBox
          bestPos = pos
          bestVariant = variant
        }
      }
    }
  }

  // Also perform a fine-grained scan around the structural position for larger files
  const scanKeyBox = bestKeyBox || initRC4KeyBox(candidateKeys[0])
  const scanResult = scanForAudioData(bytes, scanKeyBox)
  if (scanResult.offset !== -1 && scanResult.offset !== bestPos && bestKeyBox) {
    const scanScore = testDecryptConfig(bytes, bestKeyBox, scanResult.offset, scanResult.variant, testLen)
    if (scanScore > bestScore) {
      bestScore = scanScore
      bestPos = scanResult.offset
      bestVariant = scanResult.variant
    }
  }

  if (!bestKeyBox || bestPos < 0) {
    return decodeCEFNLikeXOR(bytes)
  }

  const audioData = bytes.slice(bestPos)
  const decryptedAudio = bestVariant === 'std'
    ? decryptAudioStandardRC4(audioData, new Uint8Array(bestKeyBox))
    : decryptAudioNCMRC4(audioData, bestKeyBox)

  try {
    return normalizeDecodedAudio(decryptedAudio)
  } catch {
    return decodeCEFNLikeXOR(bytes)
  }
}

/**
 * Find audio start offset for CEFN format by scanning file
 */
function findCEFNAudioStart(bytes: Uint8Array, keyLength: number): number {
  let offset = NCM_HEADER_SIZE + keyLength

  // Metadata length (4 bytes, LE)
  const metadataLength = readUint32LE(bytes, offset, 'Metadata length')
  offset += 4 + metadataLength

  // Skip 5 reserved bytes (reference impl uses 5, not 9)
  offset += 5

  // Image data space used (4 bytes, LE) — allocates space for cover art
  const imageSpace = readUint32LE(bytes, offset, 'Image data space')
  offset += 4

  // Image data actual length (4 bytes, LE)
  const imageSize = readUint32LE(bytes, offset, 'Image data size')
  offset += 4

  if (imageSize > 0 && imageSize <= imageSpace) {
    // Skip image data + any padding to fill image_space
    assertCanRead(bytes, offset, imageSpace, 'Image data')
    offset += imageSpace
  }

  return offset
}

/**
 * Scan for valid audio data using fine-grained search around known positions
 */
function scanForAudioData(bytes: Uint8Array, keyBox: Uint8Array): { offset: number; format: string; variant: 'ncm' | 'std' } {
  let bestOffset = -1
  let bestScore = 0
  let format = 'unknown'
  let bestVariant: 'ncm' | 'std' = 'ncm'

  // Fine-grained scan around known good positions
  const basePositions = [9000, 13000, 440000, 445000, 446000, 447000, 500000, 600000, 700000]

  for (const basePos of basePositions) {
    for (let offset = -500; offset <= 500; offset += 100) {
      const pos = basePos + offset
      if (pos < 0 || pos >= bytes.length - 4) continue

      const testLen = Math.min(5000, bytes.length - pos)
      const testEncrypted = bytes.slice(pos, pos + testLen)

      // Try NCM-RC4 with fresh keyBox
      const keyBoxNCM = new Uint8Array(keyBox)
      const testDecryptedNCM = decryptAudioNCMRC4(testEncrypted, keyBoxNCM)
      const probeNCM = probeAudioData(testDecryptedNCM)
      const scoreNCM = scoreAudioChunk(testDecryptedNCM)

      // Try standard RC4 with fresh keyBox
      const keyBoxStd = new Uint8Array(keyBox)
      const testDecryptedStd = decryptAudioStandardRC4(testEncrypted, keyBoxStd)
      const probeStd = probeAudioData(testDecryptedStd)
      const scoreStd = scoreAudioChunk(testDecryptedStd)

      if (scoreNCM > bestScore) {
        bestScore = scoreNCM
        bestOffset = pos
        format = probeNCM.format.toUpperCase()
        bestVariant = 'ncm'
      }
      if (scoreStd > bestScore) {
        bestScore = scoreStd
        bestOffset = pos
        format = probeStd.format.toUpperCase()
        bestVariant = 'std'
      }
    }
  }

  return { offset: bestOffset, format, variant: bestVariant }
}

/**
 * Fallback XOR-based CEFN decryption
 */
function decodeCEFNLikeXOR(bytes: Uint8Array): DecodedAudio {
  const possibleStarts = [10, 128, 256, 512, 1024, 2048, 4096, 8192, 9476, 10240, 16384]

  let audioStart = -1
  let bestKeyOffset = 0

  for (const start of possibleStarts) {
    if (start >= bytes.length - 4) break
    for (let i = start; i < Math.min(start + 256, bytes.length - 4); i++) {
      const d0 = bytes[i] ^ CEFN_KEY[i % 16]
      const d1 = bytes[i + 1] ^ CEFN_KEY[(i + 1) % 16]
      const decryptedPair = new Uint8Array([d0, d1, bytes[i + 2] ^ CEFN_KEY[(i + 2) % 16], bytes[i + 3] ^ CEFN_KEY[(i + 3) % 16]])
      if (detectAudioFormatAtOffset(decryptedPair) !== 'unknown' || isValidMP3Frame(d0, d1)) {
        audioStart = i
        break
      }
    }
    if (audioStart !== -1) break
  }

  if (audioStart === -1) {
    for (let i = 0; i < Math.min(bytes.length - 4, 20000); i++) {
      for (let offset = 0; offset < 16; offset++) {
        const d0 = bytes[i] ^ CEFN_KEY[(i + offset) % 16]
        const d1 = bytes[i + 1] ^ CEFN_KEY[(i + 1 + offset) % 16]
        const decryptedPair = new Uint8Array([d0, d1, bytes[i + 2] ^ CEFN_KEY[(i + 2 + offset) % 16], bytes[i + 3] ^ CEFN_KEY[(i + 3 + offset) % 16]])
        if (detectAudioFormatAtOffset(decryptedPair) !== 'unknown' || isValidMP3Frame(d0, d1)) {
          audioStart = i
          bestKeyOffset = offset
          break
        }
      }
      if (audioStart !== -1) break
    }
  }

  if (audioStart === -1) {
    throw new Error('Could not find audio data in CEFN file')
  }

  const audioData = bytes.slice(audioStart)
  const decrypted = new Uint8Array(audioData.length)

  for (let i = 0; i < audioData.length; i++) {
    decrypted[i] = audioData[i] ^ CEFN_KEY[(i + bestKeyOffset) % 16]
  }

  try {
    return normalizeDecodedAudio(decrypted)
  } catch (error) {
    throw new Error(`XOR 解密后仍未识别出可用音频格式: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * Main decode function for NCM files
 */
function decodeNCM(arrayBuffer: ArrayBuffer): DecodedAudio {
  const bytes = new Uint8Array(arrayBuffer)

  if (bytes.length < NCM_HEADER_SIZE) {
    throw new Error('Invalid NCM file format - file is too short')
  }

  // Validate header
  const isStandardNCM =
    bytes[0] === 0x63 &&
    bytes[1] === 0x74 &&
    bytes[2] === 0x6E &&
    bytes[3] === 0x63 &&
    bytes[4] === 0x6D

  const isCEFNLike =
    (bytes[0] === 0x43 && bytes[1] === 0x45 && bytes[2] === 0x46) ||
    (bytes[0] === 0x43 && bytes[1] === 0x54 && bytes[2] === 0x45 && bytes[3] === 0x4E && bytes[4] === 0x46)

  if (!isStandardNCM && !isCEFNLike) {
    throw new Error('Invalid NCM file format - not a valid NCM file')
  }

  if (isStandardNCM) {
    return decodeStandardNCM(bytes)
  } else {
    return decodeCEFNLike(bytes)
  }
}

export async function parseNCMFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      try {
        if (!(reader.result instanceof ArrayBuffer)) {
          throw new Error('文件读取结果异常')
        }

        const arrayBuffer = reader.result
        const decodedAudio = decodeNCM(arrayBuffer)

        // Convert to base64
        const bytes = decodedAudio.data
        const base64 = bytesToBase64(bytes)
        resolve(base64)
      } catch (error) {
        reject(
          new Error(
            `NCM 文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`
          )
        )
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsArrayBuffer(file)
  })
}

export function isNCMFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.ncm')
}

export async function fileToBase64WithNCMSupport(
  file: File
): Promise<{ base64: string; isNCM: boolean }> {
  if (isNCMFile(file.name)) {
    const base64 = await parseNCMFile(file)
    return { base64, isNCM: true }
  }

  // Regular file to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('文件读取结果异常'))
        return
      }

      const base64 = reader.result.split(',')[1]
      if (!base64) {
        reject(new Error('文件转码失败'))
        return
      }

      resolve({ base64, isNCM: false })
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}
