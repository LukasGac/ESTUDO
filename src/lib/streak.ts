import { StudyGoal } from '@/types'

export function getTodayKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function updateStreak(goal: StudyGoal, today: string): StudyGoal {
  const { lastStudyDate, currentStreak, longestStreak } = goal

  if (lastStudyDate === today) return goal

  let newStreak: number

  if (!lastStudyDate) {
    newStreak = 1
  } else {
    const diffMs = new Date(today).getTime() - new Date(lastStudyDate).getTime()
    const diffDays = Math.round(diffMs / 86_400_000)
    newStreak = diffDays === 1 ? currentStreak + 1 : 1
  }

  return {
    ...goal,
    currentStreak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    lastStudyDate: today,
  }
}

export function getEffectiveStreak(goal: StudyGoal, today: string): number {
  if (!goal.lastStudyDate || goal.currentStreak === 0) return 0
  const diffMs = new Date(today).getTime() - new Date(goal.lastStudyDate).getTime()
  const diffDays = Math.round(diffMs / 86_400_000)
  return diffDays <= 1 ? goal.currentStreak : 0
}
