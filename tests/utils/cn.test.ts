import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils/cn'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles falsy values', () => {
    expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar')
  })

  it('deduplicates tailwind conflicts', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('handles object syntax', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar')
  })

  it('returns empty string for empty input', () => {
    expect(cn()).toBe('')
  })
})
