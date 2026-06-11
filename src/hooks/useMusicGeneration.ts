import { useCallback } from 'react'
import { apiContainer } from '@/lib/api'
import { useAsyncAction } from './useAsyncAction'
import { useMusicStore } from '@/stores/musicStore'

export function useMusicGeneration() {
  const { currentParams, setResult, addToHistory } = useMusicStore()
  const action = useAsyncAction(apiContainer.music.generate.bind(apiContainer.music))

  const run = useCallback(async () => {
    const result = await action.run(currentParams)
    if (result) {
      setResult(result)
      addToHistory(result)
    }
  }, [action, currentParams, setResult, addToHistory])

  return { ...action, run }
}
