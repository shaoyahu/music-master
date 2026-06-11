/**
 * 统一 API 客户端（fetch 封装 + 错误归一化）
 */

import { AppError, NetworkError, RateLimitError, ValidationError } from '@/domain/errors'

export interface RequestOptions {
  signal?: AbortSignal
  timeout?: number
  headers?: Record<string, string>
}

export class ApiClient {
  constructor(private baseUrl: string, private defaultHeaders: Record<string, string> = {}) {}

  async post<T>(path: string, body: unknown, opts: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timeoutMs = opts.timeout ?? 30_000

    const timeoutId = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs)
    if (opts.signal) {
      opts.signal.addEventListener('abort', () => controller.abort(opts.signal?.reason))
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
          ...opts.headers,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('Retry-After') ?? 1)
        throw new RateLimitError('请求过于频繁，请稍后再试', retryAfter)
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new AppError(`HTTP ${res.status}: ${text || res.statusText}`, classifyStatus(res.status), {
          status: res.status,
        })
      }

      return (await res.json()) as T
    } catch (err) {
      if (err instanceof AppError) throw err
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new AppError('请求被取消', 'TIMEOUT')
      }
      throw new NetworkError(err instanceof Error ? err.message : '网络异常', err)
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

function classifyStatus(status: number): AppError['code'] {
  if (status === 400 || status === 422) return 'VALIDATION'
  if (status === 401 || status === 403) return 'AUTH'
  if (status === 404) return 'NOT_FOUND'
  if (status >= 500) return 'SERVER'
  return 'UNKNOWN'
}

/**
 * 校验必填参数
 */
export function assertValid(condition: unknown, message: string): asserts condition {
  if (!condition) throw new ValidationError(message)
}
