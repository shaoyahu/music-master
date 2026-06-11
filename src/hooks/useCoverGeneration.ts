import { useCallback } from 'react'
import { apiContainer } from '@/lib/api'
import { useAsyncAction } from './useAsyncAction'
import { useCoverStore } from '@/stores/coverStore'

export function useCoverGeneration() {
  const { preprocessResult, prompt, setGenResult } = useCoverStore()
  const action = useAsyncAction(apiContainer.cover.generate.bind(apiContainer.cover))

  const run = useCallback(async () => {
    if (!preprocessResult) return
    const result = await action.run({
      preprocessId: preprocessResult.id,
      prompt,
    })
    if (result) setGenResult(result)
  }, [action, preprocessResult, prompt, setGenResult])

  return { ...action, run }
}
