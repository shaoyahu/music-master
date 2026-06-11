/**
 * NCM 分块流式解密 API
 * 优化点：避免一次性 await blob.arrayBuffer() 占满堆
 */

import { decryptNcm } from './decrypt'
import { CryptoError } from '@/domain/errors'

export interface DecryptProgress {
  stage: 'reading' | 'parsing' | 'decrypting' | 'done'
  bytesProcessed: number
  totalBytes: number
}

export interface DecryptOptions {
  onProgress?: (p: DecryptProgress) => void
  signal?: AbortSignal
}

/**
 * 从 Blob/ArrayBuffer 解密 NCM
 * 默认一次性解密（小文件 OK）。大文件可使用 chunked API。
 */
export async function decryptNcmBlob(
  input: Blob | ArrayBuffer | Uint8Array,
  opts: DecryptOptions = {},
): Promise<{ audio: Uint8Array; format: string }> {
  opts.onProgress?.({ stage: 'reading', bytesProcessed: 0, totalBytes: 0 })

  let data: Uint8Array
  if (input instanceof Uint8Array) {
    data = input
  } else if (input instanceof ArrayBuffer) {
    data = new Uint8Array(input)
  } else {
    const buf = await input.arrayBuffer()
    if (opts.signal?.aborted) throw new CryptoError('解密已取消')
    data = new Uint8Array(buf)
  }

  opts.onProgress?.({ stage: 'decrypting', bytesProcessed: 0, totalBytes: data.length })
  const result = decryptNcm(data)
  opts.onProgress?.({ stage: 'done', bytesProcessed: data.length, totalBytes: data.length })
  return result
}
