import { create } from 'zustand'
import { DailyStats, GoalType, Rating, StudyGoal, StudySession } from '@/types'
import {
  getDailyStats,
  getStudyGoal,
  saveSession,
  saveDailyStats,
  saveStudyGoal,
} from '@/lib/storage'
import { getTodayKey, updateStreak } from '@/lib/streak'
import { useDeckStore } from '@/store/deckStore'

export interface DayHistoryEntry {
  date: string
  stats: DailyStats
  goalReached: boolean
}

interface StudyStore {
  session: StudySession | null
  isFlipped: boolean
  studyGoal: StudyGoal
  todayStats: DailyStats

  startSession: (deckId: string, cardIds: string[]) => void
  flip: () => void
  rateCard: (rating: Rating) => void
  endSession: () => void
  setDailyTarget: (n: number) => void
  setGoalType: (type: GoalType) => void
  setDailyMinutesTarget: (n: number) => void

  currentCardId: () => string | null
  getTodayProgress: () => { studied: number; target: number; pct: number; unit: string }
  getLast7DaysStats: () => DayHistoryEntry[]
}

function loadTodayStats(): DailyStats {
  const today = getTodayKey()
  const all = getDailyStats()
  const s = all[today]
  return s ?? { date: today, cardsStudied: 0, cardsCorrect: 0, minutesStudied: 0 }
}

function ensureMinutes(s: DailyStats): DailyStats {
  return { ...s, minutesStudied: s.minutesStudied ?? 0 }
}

export const useStudyStore = create<StudyStore>((set, get) => ({
  session: null,
  isFlipped: false,
  studyGoal: getStudyGoal(),
  todayStats: ensureMinutes(loadTodayStats()),

  startSession(deckId, cardIds) {
    const session: StudySession = {
      deckId,
      queue: [...cardIds],
      currentIndex: 0,
      startedAt: new Date().toISOString(),
      reviewedCount: 0,
      correctCount: 0,
    }
    saveSession(session)
    set({ session, isFlipped: false })
  },

  flip() {
    set({ isFlipped: true })
  },

  rateCard(rating) {
    const { session, studyGoal, todayStats } = get()
    if (!session) return

    const cardId = session.queue[session.currentIndex]
    if (!cardId) return

    useDeckStore.getState().applyRating(cardId, rating)

    const isCorrect = rating === 'correct'
    const newQueue = [...session.queue]

    if (rating === 'wrong') {
      const reinsertAt = Math.min(session.currentIndex + 3, newQueue.length)
      newQueue.splice(reinsertAt, 0, cardId)
    }

    const nextIndex = session.currentIndex + 1
    const isDone = nextIndex >= newQueue.length

    const updatedSession: StudySession = {
      ...session,
      queue: newQueue,
      currentIndex: nextIndex,
      reviewedCount: session.reviewedCount + 1,
      correctCount: session.correctCount + (isCorrect ? 1 : 0),
    }

    if (isDone) {
      const today = getTodayKey()
      const allStats = getDailyStats()

      const sessionMinutes = Math.min(
        120,
        Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60_000)
      )

      const prevStats = ensureMinutes(todayStats)
      const newTodayStats: DailyStats = {
        date: today,
        cardsStudied: prevStats.cardsStudied + updatedSession.reviewedCount,
        cardsCorrect: prevStats.cardsCorrect + updatedSession.correctCount,
        minutesStudied: prevStats.minutesStudied + sessionMinutes,
      }
      allStats[today] = newTodayStats
      saveDailyStats(allStats)

      const goalReached = studyGoal.goalType === 'hours'
        ? newTodayStats.minutesStudied >= studyGoal.dailyMinutesTarget
        : newTodayStats.cardsStudied >= studyGoal.dailyCardTarget

      let newGoal = studyGoal
      if (goalReached) {
        newGoal = updateStreak(studyGoal, today)
        saveStudyGoal(newGoal)
      }

      saveSession(null)
      set({ session: { ...updatedSession }, isFlipped: false, todayStats: newTodayStats, studyGoal: newGoal })
    } else {
      saveSession(updatedSession)
      set({ session: updatedSession, isFlipped: false })
    }
  },

  endSession() {
    saveSession(null)
    set({ session: null, isFlipped: false })
  },

  setDailyTarget(n) {
    const { studyGoal } = get()
    const newGoal = { ...studyGoal, dailyCardTarget: Math.max(1, n) }
    saveStudyGoal(newGoal)
    set({ studyGoal: newGoal })
  },

  setGoalType(type) {
    const { studyGoal } = get()
    const newGoal = { ...studyGoal, goalType: type }
    saveStudyGoal(newGoal)
    set({ studyGoal: newGoal })
  },

  setDailyMinutesTarget(n) {
    const { studyGoal } = get()
    const newGoal = { ...studyGoal, dailyMinutesTarget: Math.max(1, n) }
    saveStudyGoal(newGoal)
    set({ studyGoal: newGoal })
  },

  currentCardId() {
    const { session } = get()
    if (!session) return null
    return session.queue[session.currentIndex] ?? null
  },

  getTodayProgress() {
    const { studyGoal, todayStats } = get()
    if (studyGoal.goalType === 'hours') {
      const studied = ensureMinutes(todayStats).minutesStudied
      const target = studyGoal.dailyMinutesTarget
      const pct = Math.min(100, Math.round((studied / target) * 100))
      return { studied, target, pct, unit: 'min' }
    }
    const studied = todayStats.cardsStudied
    const target = studyGoal.dailyCardTarget
    const pct = Math.min(100, Math.round((studied / target) * 100))
    return { studied, target, pct, unit: 'cards' }
  },

  getLast7DaysStats() {
    const { studyGoal } = get()
    const allStats = getDailyStats()
    const result: DayHistoryEntry[] = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const stats = ensureMinutes(allStats[date] ?? { date, cardsStudied: 0, cardsCorrect: 0, minutesStudied: 0 })
      const goalReached = studyGoal.goalType === 'hours'
        ? stats.minutesStudied >= studyGoal.dailyMinutesTarget
        : stats.cardsStudied >= studyGoal.dailyCardTarget
      result.push({ date, stats, goalReached })
    }
    return result
  },
}))
