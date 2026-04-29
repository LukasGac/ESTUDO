import { Card, CardStatus, DeckStats, Rating, SRSResult } from '@/types'
import { SRS } from '@/constants/srs'
import { addDays, clamp } from '@/lib/utils'

export function calculateNextReview(card: Card, rating: Rating): SRSResult {
  let { intervalDays, easeFactor, repetitions } = card

  if (rating === 'wrong') {
    easeFactor = clamp(easeFactor + SRS.WRONG_EASE_DELTA, SRS.MIN_EASE_FACTOR, SRS.MAX_EASE_FACTOR)
    repetitions = 0
    intervalDays = 0
  } else if (rating === 'hard') {
    easeFactor = clamp(easeFactor + SRS.HARD_EASE_DELTA, SRS.MIN_EASE_FACTOR, SRS.MAX_EASE_FACTOR)
    intervalDays =
      card.status === 'new' ? 1 : Math.max(1, Math.round(intervalDays * SRS.HARD_INTERVAL_MULTIPLIER))
  } else {
    easeFactor = clamp(
      easeFactor + SRS.CORRECT_EASE_DELTA,
      SRS.MIN_EASE_FACTOR,
      SRS.MAX_EASE_FACTOR
    )
    repetitions += 1
    if (card.status === 'new' || repetitions === 1) {
      intervalDays = 1
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor))
    }
  }

  let newStatus: CardStatus
  if (rating === 'wrong') {
    newStatus = 'learning'
  } else if (repetitions >= SRS.MASTERED_REPETITIONS && intervalDays >= SRS.MASTERED_MIN_INTERVAL) {
    newStatus = 'mastered'
  } else if (repetitions >= 2) {
    newStatus = 'review'
  } else {
    newStatus = 'learning'
  }

  const now = new Date()
  const dueDate = intervalDays === 0 ? now : addDays(now, intervalDays)

  return {
    newIntervalDays: intervalDays,
    newEaseFactor: easeFactor,
    newRepetitions: repetitions,
    newStatus,
    newDueDate: dueDate.toISOString(),
  }
}

export function buildStudyQueue(cards: Card[]): Card[] {
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const due = cards.filter((c) => {
    if (c.status === 'mastered') return false
    return new Date(c.dueDate) <= endOfToday
  })

  const priority: Record<CardStatus, number> = {
    learning: 0,
    new: 1,
    review: 2,
    mastered: 3,
  }

  return due.sort((a, b) => {
    const diff = priority[a.status] - priority[b.status]
    if (diff !== 0) return diff
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}

export function computeDeckStats(cards: Card[]): DeckStats {
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const totalReviews = cards.reduce((s, c) => s + c.totalReviews, 0)
  const correctReviews = cards.reduce((s, c) => s + c.correctReviews, 0)

  return {
    totalCards: cards.length,
    dueToday: cards.filter(
      (c) => c.status !== 'mastered' && new Date(c.dueDate) <= endOfToday
    ).length,
    newCards: cards.filter((c) => c.status === 'new').length,
    masteredCards: cards.filter((c) => c.status === 'mastered').length,
    accuracy: totalReviews === 0 ? 0 : Math.round((correctReviews / totalReviews) * 100),
  }
}
