import { describe, it, expect } from 'vitest'
import { AppError, ValidationError, RateLimitError, getApiErrorMessage } from '@/domain/errors'

describe('AppError', () => {
  it('captures code, message, status', () => {
    const err = new AppError('boom', 'SERVER', { status: 500 })
    expect(err.message).toBe('boom')
    expect(err.code).toBe('SERVER')
    expect(err.status).toBe(500)
    expect(err.timestamp).toBeGreaterThan(0)
  })

  it('serializes to JSON', () => {
    const err = new AppError('x', 'UNKNOWN')
    const json = err.toJSON()
    expect(json).toMatchObject({ name: 'AppError', message: 'x', code: 'UNKNOWN' })
  })
})

describe('ValidationError', () => {
  it('has VALIDATION code', () => {
    const err = new ValidationError('bad input')
    expect(err.code).toBe('VALIDATION')
    expect(err.name).toBe('ValidationError')
  })
})

describe('RateLimitError', () => {
  it('includes retry-after and 429 status', () => {
    const err = new RateLimitError('too many', 30)
    expect(err.retryAfter).toBe(30)
    expect(err.status).toBe(429)
  })
})

describe('getApiErrorMessage', () => {
  it('returns AppError message', () => {
    expect(getApiErrorMessage(new AppError('hi', 'SERVER'))).toBe('hi')
  })

  it('wraps generic Error', () => {
    const msg = getApiErrorMessage(new TypeError('xxx'))
    expect(msg).toContain('TypeError')
    expect(msg).toContain('xxx')
  })

  it('returns string for unknown', () => {
    expect(getApiErrorMessage('boom')).toBe('boom')
  })
})
