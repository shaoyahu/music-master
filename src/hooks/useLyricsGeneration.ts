import { useCallback } from 'react'
import { apiContainer } from '@/lib/api'
import { useAsyncAction } from './useAsyncAction'
import { useLyricsStore } from '@/stores/lyricsStore'

export function useLyricsGeneration() {
  const { params, setCurrent, addToHistory } = useLyricsStore()
  const action = useAsyncAction(apiContainer.lyrics.generate.bind(apiContainer.lyrics))

  const run = useCallback(async () => {
    const result = await action.run(params)
    if (result) {
      setCurrent(result)
      addToHistory(result)
    }
  }, [action, params, setCurrent, addToHistory])

  return { ...action, run }
}
