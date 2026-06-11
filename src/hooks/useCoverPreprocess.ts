import { useCallback } from 'react'
import { apiContainer } from '@/lib/api'
import { useAsyncAction } from './useAsyncAction'
import { useCoverStore } from '@/stores/coverStore'

export function useCoverPreprocess() {
  const { setFile, setPreprocessResult } = useCoverStore()
  const action = useAsyncAction(async (file: { name: string; size: number }, signal: AbortSignal) => {
    return apiContainer.cover.preprocess(file, signal)
  })

  const run = useCallback(
    async (file: { name: string; size: number }) => {
      setFile(file.name, file.size)
      const result = await action.run(file)
      if (result) setPreprocessResult(result)
    },
    [action, setFile, setPreprocessResult],
  )

  return { ...action, run }
}
