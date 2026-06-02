import { useState, useCallback, useRef, useEffect } from 'react'
import { getApiErrorMessage } from '../lib/api'

export interface UseAsyncActionReturn<TArgs extends unknown[], TResult> {
  run: (...args: TArgs) => Promise<TResult | undefined>
  isLoading: boolean
  error: string | null
}

export interface UseAsyncActionOptions<TResult> {
  /**
   * Called with the action's resolved result, but only if this run is
   * still the latest (no newer run started, component still mounted).
   * Use this for side effects that must be race-protected — store
   * mutations, navigation, telemetry. The `runIdRef` guard means a slow
   * stale action can never trigger a side effect that would clobber a
   * newer run's state.
   *
   * The `run` promise still resolves with the same result; `onSuccess`
   * runs synchronously before that resolve.
   */
  onSuccess?: (result: TResult) => void
}

/**
 * Generic async-action hook with loading/error state.
 * Handles:
 *  - Race condition: if a new run starts before the previous one finishes,
 *    the previous result/error is ignored via the runIdRef guard, and
 *    `onSuccess` is NOT called for the stale run.
 *  - Error normalization via `getApiErrorMessage` (handles both Error and
 *    legacy plain-object ApiError shapes).
 *  - Cleanup of pending state on unmount so setState isn't called after unmount.
 */
export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  options?: UseAsyncActionOptions<TResult>
): UseAsyncActionReturn<TArgs, TResult> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const runIdRef = useRef(0)
  const mountedRef = useRef(true)
  // Hold the latest options in a ref so `run`'s identity doesn't change
  // every render when callers pass a fresh options object literal. Only
  // `action` drives re-creation of `run`, which is the knob that matters.
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      const runId = ++runIdRef.current
      setIsLoading(true)
      setError(null)
      try {
        const result = await action(...args)
        if (!mountedRef.current || runId !== runIdRef.current) return undefined
        // onSuccess is the race-safe hook for side effects. It runs
        // AFTER the runId check so a stale action that resolved late
        // can never trigger a store mutation that would clobber a newer
        // run's state.
        optionsRef.current?.onSuccess?.(result)
        return result
      } catch (err) {
        if (!mountedRef.current || runId !== runIdRef.current) return undefined
        setError(getApiErrorMessage(err, 'Action failed'))
        throw err
      } finally {
        if (mountedRef.current && runId === runIdRef.current) {
          setIsLoading(false)
        }
      }
    },
    [action]
  )

  return { run, isLoading, error }
}
