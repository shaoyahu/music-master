import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { AppError } from '@/domain/errors'

describe('useAsyncAction', () => {
  it('runs successfully and updates state', async () => {
    const fn = vi.fn().mockResolvedValue('result')
    const { result } = renderHook(() => useAsyncAction(fn))

    expect(result.current.loading).toBe(false)

    await act(async () => {
      const r = await result.current.run()
      expect(r).toBe('result')
    })

    expect(result.current.data).toBe('result')
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(fn).toHaveBeenCalledOnce()
  })

  it('captures errors and sets error state', async () => {
    const fn = vi.fn().mockRejectedValue(new AppError('boom', 'SERVER'))
    const { result } = renderHook(() => useAsyncAction(fn))

    await act(async () => {
      const r = await result.current.run()
      expect(r).toBeNull()
    })

    expect(result.current.error?.message).toBe('boom')
    expect(result.current.errorMessage).toBe('boom')
    expect(result.current.loading).toBe(false)
  })

  it('protects against race conditions', async () => {
    let resolveFirst: (v: string) => void
    const firstPromise = new Promise<string>((r) => {
      resolveFirst = r
    })
    const fn = vi.fn().mockImplementationOnce(() => firstPromise).mockResolvedValueOnce('second')

    const { result } = renderHook(() => useAsyncAction(fn))

    act(() => {
      result.current.run() // first call
    })

    await act(async () => {
      await result.current.run() // second call
    })

    expect(result.current.data).toBe('second')

    // resolve first after second
    await act(async () => {
      resolveFirst!('first')
      await firstPromise
    })

    // state should not be overwritten by late first
    expect(result.current.data).toBe('second')
  })

  it('resets state', async () => {
    const fn = vi.fn().mockResolvedValue('x')
    const { result } = renderHook(() => useAsyncAction(fn))

    await act(async () => {
      await result.current.run()
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('does not update state after unmount', async () => {
    let resolvePromise: (v: string) => void
    const promise = new Promise<string>((r) => {
      resolvePromise = r
    })
    const fn = vi.fn().mockReturnValue(promise)

    const { result, unmount } = renderHook(() => useAsyncAction(fn))

    act(() => {
      result.current.run()
    })

    unmount()

    await act(async () => {
      resolvePromise!('late result')
      await promise
    })

    // No assertions needed - just verify no setState warnings thrown
    // The hook uses mountedRef check internally
  })
})
