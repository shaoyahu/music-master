/**
 * 通用异步 Action 包装
 * - loading 状态
 * - error 状态
 * - 竞态保护（runIdRef 守卫）
 * - 卸载保护（mountedRef 防止 setState after unmount）
 * - 取消支持（AbortController）
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { AppError, getApiErrorMessage } from '@/domain/errors'

export interface AsyncActionState<T> {
  data: T | null
  loading: boolean
  error: AppError | null
  errorMessage: string | null
  runId: number
}

export interface UseAsyncActionResult<TArgs extends unknown[], TResult> extends AsyncActionState<TResult> {
  run: (...args: TArgs) => Promise<TResult | null>
  reset: () => void
  cancel: () => void
}

export function useAsyncAction<TArgs extends unknown[], TResult>(
  fn: (...args: [...TArgs, AbortSignal]) => Promise<TResult>,
): UseAsyncActionResult<TArgs, TResult> {
  const [state, setState] = useState<AsyncActionState<TResult>>({
    data: null,
    loading: false,
    error: null,
    errorMessage: null,
    runId: 0,
  })

  const fnRef = useRef(fn)
  fnRef.current = fn

  const runIdRef = useRef(0)
  const mountedRef = useRef(true)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      controllerRef.current?.abort()
    }
  }, [])

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      runIdRef.current += 1
      const currentRunId = runIdRef.current
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      if (mountedRef.current) {
        setState((s) => ({ ...s, loading: true, error: null, errorMessage: null, runId: currentRunId }))
      }

      try {
        const result = await fnRef.current(...args, controller.signal)
        if (!mountedRef.current || runIdRef.current !== currentRunId) {
          return null
        }
        setState({ data: result, loading: false, error: null, errorMessage: null, runId: currentRunId })
        return result
      } catch (err) {
        if (!mountedRef.current || runIdRef.current !== currentRunId) {
          return null
        }
        const appErr =
          err instanceof AppError
            ? err
            : new AppError(getApiErrorMessage(err), 'UNKNOWN', { cause: err })
        setState({
          data: null,
          loading: false,
          error: appErr,
          errorMessage: appErr.message,
          runId: currentRunId,
        })
        return null
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, errorMessage: null, runId: 0 })
  }, [])

  const cancel = useCallback(() => {
    controllerRef.current?.abort()
  }, [])

  return { ...state, run, reset, cancel }
}
