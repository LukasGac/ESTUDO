import { describe, it, expect, vi, afterEach } from 'vitest'
import { getTodayKey, updateStreak, getEffectiveStreak } from '@/lib/streak'
import { StudyGoal } from '@/types'

const BASE_GOAL: StudyGoal = {
  goalType: 'cards',
  dailyCardTarget: 20,
  dailyMinutesTarget: 60,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
}

describe('getTodayKey', () => {
  it('retorna data no formato YYYY-MM-DD', () => {
    const key = getTodayKey()
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('reflete a data local do sistema', () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    expect(getTodayKey()).toBe(`${y}-${m}-${d}`)
  })
})

describe('updateStreak', () => {
  afterEach(() => vi.restoreAllMocks())

  it('inicia streak em 1 no primeiro dia', () => {
    const result = updateStreak(BASE_GOAL, '2025-04-01')
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(1)
    expect(result.lastStudyDate).toBe('2025-04-01')
  })

  it('incrementa streak em dia consecutivo', () => {
    const goal: StudyGoal = { ...BASE_GOAL, currentStreak: 3, longestStreak: 3, lastStudyDate: '2025-04-01' }
    const result = updateStreak(goal, '2025-04-02')
    expect(result.currentStreak).toBe(4)
    expect(result.longestStreak).toBe(4)
  })

  it('reseta streak ao pular um dia', () => {
    const goal: StudyGoal = { ...BASE_GOAL, currentStreak: 5, longestStreak: 5, lastStudyDate: '2025-04-01' }
    const result = updateStreak(goal, '2025-04-03')
    expect(result.currentStreak).toBe(1)
  })

  it('não altera streak ao estudar duas vezes no mesmo dia', () => {
    const goal: StudyGoal = { ...BASE_GOAL, currentStreak: 2, longestStreak: 2, lastStudyDate: '2025-04-01' }
    const result = updateStreak(goal, '2025-04-01')
    expect(result.currentStreak).toBe(2)
    expect(result.lastStudyDate).toBe('2025-04-01')
  })

  it('longestStreak nunca decresce', () => {
    const goal: StudyGoal = { ...BASE_GOAL, currentStreak: 10, longestStreak: 10, lastStudyDate: '2025-04-01' }
    // Skip a day — streak resets to 1
    const result = updateStreak(goal, '2025-04-03')
    expect(result.currentStreak).toBe(1)
    expect(result.longestStreak).toBe(10)
  })

  it('atualiza longestStreak quando streak supera o recorde', () => {
    const goal: StudyGoal = { ...BASE_GOAL, currentStreak: 4, longestStreak: 4, lastStudyDate: '2025-04-01' }
    const result = updateStreak(goal, '2025-04-02')
    expect(result.currentStreak).toBe(5)
    expect(result.longestStreak).toBe(5)
  })
})

describe('getEffectiveStreak', () => {
  it('retorna 0 quando nunca estudou', () => {
    expect(getEffectiveStreak(BASE_GOAL, '2025-04-01')).toBe(0)
  })

  it('retorna streak quando estudou hoje', () => {
    const goal: StudyGoal = { ...BASE_GOAL, currentStreak: 7, lastStudyDate: '2025-04-01' }
    expect(getEffectiveStreak(goal, '2025-04-01')).toBe(7)
  })

  it('retorna streak quando estudou ontem (streak ainda vivo)', () => {
    const goal: StudyGoal = { ...BASE_GOAL, currentStreak: 7, lastStudyDate: '2025-04-01' }
    expect(getEffectiveStreak(goal, '2025-04-02')).toBe(7)
  })

  it('retorna 0 quando streak foi quebrado', () => {
    const goal: StudyGoal = { ...BASE_GOAL, currentStreak: 7, lastStudyDate: '2025-03-28' }
    expect(getEffectiveStreak(goal, '2025-04-01')).toBe(0)
  })
})
