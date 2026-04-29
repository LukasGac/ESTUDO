import { describe, it, expect } from 'vitest'
import { clamp, addDays, generateId, isToday } from '@/lib/utils'

describe('clamp', () => {
  it('returns value when within bounds', () => {
    expect(clamp(5, 1, 10)).toBe(5)
  })

  it('returns min when value is below', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('returns max when value is above', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0)
  })

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10)
  })

  it('handles floating point values', () => {
    expect(clamp(1.3, 1.3, 2.5)).toBe(1.3)
    expect(clamp(1.1, 1.3, 2.5)).toBe(1.3)
    expect(clamp(2.6, 1.3, 2.5)).toBe(2.5)
  })
})

describe('addDays', () => {
  it('adds positive days correctly', () => {
    const date = new Date('2025-01-01T00:00:00.000Z')
    const result = addDays(date, 7)
    expect(result.getUTCDate()).toBe(8)
    expect(result.getUTCMonth()).toBe(0)
  })

  it('adding zero days returns same date', () => {
    const date = new Date('2025-06-15T00:00:00.000Z')
    const result = addDays(date, 0)
    expect(result.toISOString()).toBe(date.toISOString())
  })

  it('does not mutate the original date', () => {
    const date = new Date('2025-03-01T00:00:00.000Z')
    const original = date.toISOString()
    addDays(date, 5)
    expect(date.toISOString()).toBe(original)
  })

  it('handles month rollover', () => {
    const date = new Date('2025-01-28T00:00:00.000Z')
    const result = addDays(date, 5)
    expect(result.getUTCMonth()).toBe(1) // February
  })

  it('handles year rollover', () => {
    const date = new Date('2024-12-30T00:00:00.000Z')
    const result = addDays(date, 5)
    expect(result.getUTCFullYear()).toBe(2025)
  })
})

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('contains a hyphen separator', () => {
    const id = generateId()
    expect(id).toContain('-')
  })

  it('generates unique IDs across many calls', () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateId()))
    expect(ids.size).toBe(500)
  })
})

describe('isToday', () => {
  it('returns true for current timestamp', () => {
    expect(isToday(new Date().toISOString())).toBe(true)
  })

  it('returns false for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isToday(yesterday.toISOString())).toBe(false)
  })

  it('returns false for tomorrow', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(isToday(tomorrow.toISOString())).toBe(false)
  })
})
