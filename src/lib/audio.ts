/**
 * Convert hex-encoded audio bytes into a playable blob URL.
 *
 * IMPORTANT: We do NOT use `String.fromCharCode(...chunk)` here because that
 * (1) creates a huge intermediate string (2-3x the audio size) and
 * (2) can blow the JS engine's argument/argument-spread limit on large files.
 * Instead, we decode pairs of hex chars directly into a Uint8Array.
 */
export function hexToAudioUrl(hex: string): string {
  const cleaned = hex.replace(/\s/g, '')
  const byteCount = cleaned.length >> 1
  const bytes = new Uint8Array(byteCount)
  for (let i = 0; i < byteCount; i++) {
    bytes[i] = parseInt(cleaned.substr(i << 1, 2), 16)
  }
  const blob = new Blob([bytes], { type: 'audio/mpeg' })
  return URL.createObjectURL(blob)
}

/**
 * Given a raw `audio` field from the API (which may be either an https URL
 * or hex-encoded bytes), return a playable URL and the original hex (if any).
 *
 * Returns `null` if the input is empty so callers can decide what to do.
 */
export function resolveAudioSource(audio: string | null | undefined): {
  url: string
  hex: string | null
} | null {
  if (!audio) return null
  if (audio.startsWith('http://') || audio.startsWith('https://')) {
    return { url: audio, hex: null }
  }
  return { url: hexToAudioUrl(audio), hex: audio }
}

/**
 * Minimal shape of the music-generation response fields we need to parse
 * an audio payload. Defined as a structural type so both
 * `MusicGenerationResponse` and any future variants satisfy it.
 */
export interface AudioResponseLike {
  data?: {
    audio?: string | null
    audio_url?: string | null
    status?: number
  } | null
  extra_info?: {
    music_duration?: number
  } | null
}

export interface ParsedAudio {
  url: string
  hex: string | null
  duration: number | null
}

/**
 * Validate and parse the audio payload of a music-generation response.
 * Throws user-facing Chinese error messages that the hooks surface
 * directly. Kept side-effect-free so callers can pass the result into a
 * race-protected commit step (see `useAsyncAction`'s `onSuccess`).
 */
export function parseAudioResponse(response: AudioResponseLike): ParsedAudio {
  if (!response.data) {
    throw new Error('接口返回数据格式异常，请检查网络或联系开发者')
  }

  // status: 1 = processing, 2 = completed. We only treat 1 as a hard
  // error; any other value (including 2 and undefined, for older API
  // versions) is accepted and the audio payload is trusted.
  if (response.data.status === 1) {
    throw new Error('音乐仍在生成中，请稍后重试')
  }

  // `audio` may be an https URL or hex bytes; `audio_url` is always a URL.
  // resolveAudioSource normalizes the hex case into a playable blob URL.
  const resolved = resolveAudioSource(response.data.audio) ?? (response.data.audio_url
    ? { url: response.data.audio_url, hex: null as string | null }
    : null)

  if (!resolved) {
    throw new Error('未获取到音频数据，请重试')
  }

  return {
    url: resolved.url,
    hex: resolved.hex,
    duration: response.extra_info?.music_duration || null,
  }
}

/**
 * Pick a file extension from the response MIME so FLAC / WAV / PCM downloads
 * keep their real format. Falls back to `mp3` for unrecognized or missing
 * Content-Type. Always lowercase to match what the anchor's `download` attr
 * expects.
 */
function extensionFromBlob(blob: Blob): string {
  const mime = blob.type.toLowerCase()
  if (mime.includes('flac')) return 'flac'
  if (mime.includes('wav')) return 'wav'
  if (mime.includes('pcm')) return 'pcm'
  if (mime.includes('mpeg') || mime.includes('mp3')) return 'mp3'
  return 'mp3'
}

/**
 * Fetch an audio URL, save it locally with a timestamped filename, and
 * trigger the browser's download dialog. Centralized so the mobile and
 * desktop players stay in sync on the MIME-based extension logic and the
 * blob-URL lifecycle (create → click → revoke).
 *
 * On failure the `onError` callback is invoked so the caller can decide
 * how to surface the error (toast, fallback, etc.).
 */
export async function downloadAudioBlob(
  url: string,
  prefix: string,
  onError: (err: unknown) => void
): Promise<void> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `${prefix}-${Date.now()}.${extensionFromBlob(blob)}`
    a.click()
    URL.revokeObjectURL(downloadUrl)
  } catch (err) {
    onError(err)
  }
}
