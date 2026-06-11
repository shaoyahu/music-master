/**
 * 容器嗅探：检测 NCM 文件解密后是 MP3 / FLAC / WAV / OGG
 * 通过文件头 4 字节 magic 字节判断
 */

export type AudioContainer = 'mp3' | 'flac' | 'wav' | 'ogg' | 'm4a' | 'unknown'

const SIGNATURES: Array<{ ext: AudioContainer; magic: number[] }> = [
  { ext: 'mp3', magic: [0xff, 0xfb] }, // 0xFFFB / 0xFFFA / 0xFFF3 等
  { ext: 'mp3', magic: [0x49, 0x44, 0x33] }, // ID3v2
  { ext: 'flac', magic: [0x66, 0x4c, 0x61, 0x43] }, // "fLaC"
  { ext: 'wav', magic: [0x52, 0x49, 0x46, 0x46] }, // "RIFF"
  { ext: 'ogg', magic: [0x4f, 0x67, 0x67, 0x53] }, // "OggS"
  { ext: 'm4a', magic: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70] }, // ftyp
]

export function detectContainer(data: Uint8Array): AudioContainer {
  if (data.length < 4) return 'unknown'

  for (const { ext, magic } of SIGNATURES) {
    if (data.length < magic.length) continue
    let match = true
    for (let i = 0; i < magic.length; i++) {
      if (data[i] !== magic[i]) {
        match = false
        break
      }
    }
    if (match) return ext
  }
  return 'unknown'
}

export function containerMimeType(container: AudioContainer): string {
  switch (container) {
    case 'mp3':
      return 'audio/mpeg'
    case 'flac':
      return 'audio/flac'
    case 'wav':
      return 'audio/wav'
    case 'ogg':
      return 'audio/ogg'
    case 'm4a':
      return 'audio/mp4'
    default:
      return 'application/octet-stream'
  }
}
