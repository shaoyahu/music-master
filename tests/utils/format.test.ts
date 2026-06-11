import { describe, it, expect } from 'vitest'
import { formatDuration, formatBytes, formatRelativeTime } from '@/lib/utils/format'

describe('formatDuration', () => {
  it('formats seconds to mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(65)).toBe('01:05')
    expect(formatDuration(3600)).toBe('01:00:00')
    expect(formatDuration(3661)).toBe('01:01:01')
  })

  it('handles invalid input', () => {
    expect(formatDuration(NaN)).toBe('00:00')
    expect(formatDuration(-5)).toBe('00:00')
  })
})

describe('formatBytes', () => {
  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
    expect(formatBytes(5_242_880)).toBe('5.00 MB')
  })
})

describe('formatRelativeTime', () => {
  it('returns 刚刚 for recent', () => {
    const now = 1_000_000
    expect(formatRelativeTime(now - 30_000, now)).toBe('刚刚')
  })

  it('returns minutes ago', () => {
    const now = 1_000_000
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe('5 分钟前')
  })

  it('returns hours ago', () => {
    const now = 1_000_000
    expect(formatRelativeTime(now - 2 * 3_600_000, now)).toBe('2 小时前')
  })

  it('returns days ago', () => {
    const now = 1_000_000
    expect(formatRelativeTime(now - 3 * 86_400_000, now)).toBe('3 天前')
  })
})
