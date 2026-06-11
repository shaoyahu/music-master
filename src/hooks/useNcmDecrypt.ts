/**
 * NCM 解密 hook（UI 友好封装，带卸载保护）
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { decryptNcmBlob, type DecryptProgress } from '@/lib/ncm'

export function useNcmDecrypt() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<DecryptProgress>({
    stage: 'reading',
    bytesProcessed: 0,
    totalBytes: 0,
  })
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const decryptNcm = useCallback(async (file: File) => {
    if (mountedRef.current) {
      setLoading(true)
      setError(null)
      setProgress({ stage: 'reading', bytesProcessed: 0, totalBytes: file.size })
    }
    try {
      const result = await decryptNcmBlob(file, {
        onProgress: (p) => {
          if (mountedRef.current) setProgress(p)
        },
      })
      return result
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      if (mountedRef.current) setError(err)
      throw err
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  return { decryptNcm, loading, progress, error }
}
