/**
 * 统一错误类型与分类
 */

export type ErrorCode =
  | 'VALIDATION'
  | 'NETWORK'
  | 'RATE_LIMIT'
  | 'TIMEOUT'
  | 'AUTH'
  | 'SERVER'
  | 'NOT_FOUND'
  | 'PARSE'
  | 'CRYPTO'
  | 'UNKNOWN'

export class AppError extends Error {
  readonly code: ErrorCode
  readonly status?: number
  readonly cause?: unknown
  readonly timestamp: number

  constructor(
    message: string,
    code: ErrorCode = 'UNKNOWN',
    options: { status?: number; cause?: unknown } = {},
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = options.status
    this.cause = options.cause
    this.timestamp = Date.now()
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      timestamp: this.timestamp,
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, 'VALIDATION', { cause })
    this.name = 'ValidationError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, 'NETWORK', { cause })
    this.name = 'NetworkError'
  }
}

export class RateLimitError extends AppError {
  readonly retryAfter?: number
  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT', { status: 429 })
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

export class CryptoError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, 'CRYPTO', { cause })
    this.name = 'CryptoError'
  }
}

/**
 * 友好错误消息映射
 */
export function getApiErrorMessage(err: unknown): string {
  if (err instanceof AppError) return err.message
  if (err instanceof Error) return `${err.name}: ${err.message}`
  return String(err)
}
