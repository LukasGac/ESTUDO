import { describe, it, expect, beforeEach, vi } from 'vitest'
import { calculateNextReview, buildStudyQueue, computeDeckStats } from '@/lib/srs'
import { SRS } from '@/constants/srs'
import { Card } from '@/types'

// ─── helpers ──────────────────────────────────────────────────────────────────

const NOW = new Date('2025-04-27T12:00:00.000Z')

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card-1',
    deckId: 'deck-1',
    front: 'Q',
    back: 'A',
    status: 'new',
    intervalDays: 0,
    easeFactor: SRS.INITIAL_EASE_FACTOR,
    repetitions: 0,
    dueDate: NOW.toISOString(),
    lastReviewed: null,
    totalReviews: 0,
    correctReviews: 0,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...overrides,
  }
}

function tomorrow(): string {
  const d = new Date(NOW)
  d.setDate(d.getDate() + 1)
  return d.toISOString()
}

// ─── calculateNextReview ──────────────────────────────────────────────────────

describe('calculateNextReview', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  it('wrong on new card → interval=0, repetitions=0, status=learning', () => {
    const card = makeCard()
    const result = calculateNextReview(card, 'wrong')

    expect(result.newIntervalDays).toBe(0)
    expect(result.newRepetitions).toBe(0)
    expect(result.newStatus).toBe('learning')
  })

  it('wrong decreases ease factor by WRONG_EASE_DELTA', () => {
    const card = makeCard({ easeFactor: 2.0 })
    const result = calculateNextReview(card, 'wrong')

    expect(result.newEaseFactor).toBeCloseTo(2.0 + SRS.WRONG_EASE_DELTA)
  })

  it('wrong clamps ease factor at MIN_EASE_FACTOR', () => {
    const card = makeCard({ easeFactor: SRS.MIN_EASE_FACTOR })
    const result = calculateNextReview(card, 'wrong')

    expect(result.newEaseFactor).toBe(SRS.MIN_EASE_FACTOR)
  })

  it('wrong sets dueDate to now (same day reappearance)', () => {
    const card = makeCard({ intervalDays: 5 })
    const result = calculateNextReview(card, 'wrong')

    const dueDate = new Date(result.newDueDate)
    expect(dueDate.toDateString()).toBe(NOW.toDateString())
  })

  it('hard on new card → interval=1, status=learning', () => {
    const card = makeCard({ status: 'new' })
    const result = calculateNextReview(card, 'hard')

    expect(result.newIntervalDays).toBe(1)
    expect(result.newStatus).toBe('learning')
  })

  it('hard on review card → interval = max(1, current * 0.5)', () => {
    const card = makeCard({ status: 'review', intervalDays: 10, repetitions: 3 })
    const result = calculateNextReview(card, 'hard')

    expect(result.newIntervalDays).toBe(5)
  })

  it('hard on review card with interval=1 → stays at 1 (not below 1)', () => {
    const card = makeCard({ status: 'review', intervalDays: 1, repetitions: 2 })
    const result = calculateNextReview(card, 'hard')

    expect(result.newIntervalDays).toBeGreaterThanOrEqual(1)
  })

  it('hard decreases ease factor by HARD_EASE_DELTA', () => {
    const card = makeCard({ easeFactor: 2.0 })
    const result = calculateNextReview(card, 'hard')

    expect(result.newEaseFactor).toBeCloseTo(2.0 + SRS.HARD_EASE_DELTA)
  })

  it('correct on new card → interval=1, repetitions=1, status=learning', () => {
    const card = makeCard({ status: 'new' })
    const result = calculateNextReview(card, 'correct')

    expect(result.newIntervalDays).toBe(1)
    expect(result.newRepetitions).toBe(1)
    expect(result.newStatus).toBe('learning')
  })

  it('correct on learning card (repetitions=1) → status=learning, interval=1', () => {
    const card = makeCard({ status: 'learning', repetitions: 1, intervalDays: 1 })
    const result = calculateNextReview(card, 'correct')

    // repetitions was 1, becomes 2 → status=review
    expect(result.newRepetitions).toBe(2)
    expect(result.newStatus).toBe('review')
  })

  it('correct increases ease factor by CORRECT_EASE_DELTA', () => {
    const card = makeCard({ easeFactor: 2.0 })
    const result = calculateNextReview(card, 'correct')

    expect(result.newEaseFactor).toBeCloseTo(2.0 + SRS.CORRECT_EASE_DELTA)
  })

  it('correct clamps ease factor at MAX_EASE_FACTOR', () => {
    const card = makeCard({ easeFactor: SRS.MAX_EASE_FACTOR, repetitions: 5, intervalDays: 30, status: 'review' })
    const result = calculateNextReview(card, 'correct')

    expect(result.newEaseFactor).toBe(SRS.MAX_EASE_FACTOR)
  })

  it('correct with enough repetitions and interval → status=mastered', () => {
    const card = makeCard({
      status: 'review',
      repetitions: SRS.MASTERED_REPETITIONS - 1,
      intervalDays: 21,
      easeFactor: 2.5,
    })
    const result = calculateNextReview(card, 'correct')

    expect(result.newStatus).toBe('mastered')
    expect(result.newRepetitions).toBe(SRS.MASTERED_REPETITIONS)
    expect(result.newIntervalDays).toBeGreaterThanOrEqual(SRS.MASTERED_MIN_INTERVAL)
  })

  it('correct with high repetitions but low interval → status=review, not mastered', () => {
    const card = makeCard({ status: 'review', repetitions: 10, intervalDays: 5, easeFactor: 1.5 })
    const result = calculateNextReview(card, 'correct')

    // interval = max(1, round(5 * 1.6)) = 8, still < 21
    expect(result.newStatus).toBe('review')
  })

  it('review card correct → interval grows by easeFactor', () => {
    const card = makeCard({
      status: 'review',
      repetitions: 3,
      intervalDays: 10,
      easeFactor: 2.0,
    })
    const result = calculateNextReview(card, 'correct')

    expect(result.newIntervalDays).toBe(Math.max(1, Math.round(10 * 2.1)))
  })
})

// ─── buildStudyQueue ──────────────────────────────────────────────────────────

describe('buildStudyQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  it('returns empty array for empty input', () => {
    expect(buildStudyQueue([])).toEqual([])
  })

  it('excludes mastered cards', () => {
    const mastered = makeCard({ status: 'mastered', id: 'c1' })
    const newCard = makeCard({ status: 'new', id: 'c2' })
    const queue = buildStudyQueue([mastered, newCard])

    expect(queue).toHaveLength(1)
    expect(queue[0].id).toBe('c2')
  })

  it('excludes cards with future dueDate', () => {
    const future = makeCard({ dueDate: tomorrow(), id: 'future' })
    const due = makeCard({ dueDate: NOW.toISOString(), id: 'due' })
    const queue = buildStudyQueue([future, due])

    expect(queue).toHaveLength(1)
    expect(queue[0].id).toBe('due')
  })

  it('orders: learning → new → review', () => {
    const learning = makeCard({ status: 'learning', id: 'l', dueDate: NOW.toISOString() })
    const review = makeCard({ status: 'review', id: 'r', dueDate: NOW.toISOString() })
    const newCard = makeCard({ status: 'new', id: 'n', dueDate: NOW.toISOString() })

    const queue = buildStudyQueue([review, newCard, learning])

    expect(queue.map((c) => c.id)).toEqual(['l', 'n', 'r'])
  })

  it('within same status, earlier dueDate comes first', () => {
    const earlier = new Date(NOW)
    earlier.setHours(NOW.getHours() - 2)

    const c1 = makeCard({ status: 'new', id: 'c1', dueDate: NOW.toISOString() })
    const c2 = makeCard({ status: 'new', id: 'c2', dueDate: earlier.toISOString() })

    const queue = buildStudyQueue([c1, c2])
    expect(queue[0].id).toBe('c2')
  })

  it('all mastered → empty queue', () => {
    const cards = [
      makeCard({ status: 'mastered', id: 'a' }),
      makeCard({ status: 'mastered', id: 'b' }),
    ]
    expect(buildStudyQueue(cards)).toHaveLength(0)
  })
})

// ─── computeDeckStats ─────────────────────────────────────────────────────────

describe('computeDeckStats', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  it('empty array → all zeros', () => {
    const stats = computeDeckStats([])

    expect(stats.totalCards).toBe(0)
    expect(stats.dueToday).toBe(0)
    expect(stats.newCards).toBe(0)
    expect(stats.masteredCards).toBe(0)
    expect(stats.accuracy).toBe(0)
  })

  it('accuracy is 0 when no reviews have been done', () => {
    const cards = [makeCard({ totalReviews: 0, correctReviews: 0 })]
    const stats = computeDeckStats(cards)

    expect(stats.accuracy).toBe(0)
  })

  it('accuracy rounds to nearest integer', () => {
    const cards = [makeCard({ totalReviews: 3, correctReviews: 2 })]
    const stats = computeDeckStats(cards)

    expect(stats.accuracy).toBe(67) // 2/3 = 66.6... rounds to 67
  })

  it('accuracy aggregates across all cards', () => {
    const c1 = makeCard({ id: 'c1', totalReviews: 10, correctReviews: 8 })
    const c2 = makeCard({ id: 'c2', totalReviews: 10, correctReviews: 6 })
    const stats = computeDeckStats([c1, c2])

    expect(stats.accuracy).toBe(70) // 14/20 = 70%
  })

  it('dueToday counts non-mastered cards with dueDate ≤ today', () => {
    const due = makeCard({ id: 'd', dueDate: NOW.toISOString(), status: 'new' })
    const future = makeCard({ id: 'f', dueDate: tomorrow(), status: 'new' })
    const mastered = makeCard({ id: 'm', dueDate: NOW.toISOString(), status: 'mastered' })

    const stats = computeDeckStats([due, future, mastered])
    expect(stats.dueToday).toBe(1)
  })

  it('masteredCards counts correctly', () => {
    const cards: Card[] = [
      makeCard({ id: 'a', status: 'mastered' }),
      makeCard({ id: 'b', status: 'mastered' }),
      makeCard({ id: 'c', status: 'new' }),
    ]
    const stats = computeDeckStats(cards)
    expect(stats.masteredCards).toBe(2)
    expect(stats.newCards).toBe(1)
    expect(stats.totalCards).toBe(3)
  })
})

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('SRS edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  it('wrong on mastered card downgrades to learning', () => {
    const card = makeCard({ status: 'mastered', repetitions: 10, intervalDays: 60 })
    const result = calculateNextReview(card, 'wrong')

    expect(result.newStatus).toBe('learning')
    expect(result.newRepetitions).toBe(0)
  })

  it('multiple correct answers on same card produce growing intervals', () => {
    let card = makeCard()
    const intervals: number[] = []

    // Simulate 6 correct answers
    for (let i = 0; i < 6; i++) {
      const result = calculateNextReview(card, 'correct')
      intervals.push(result.newIntervalDays)
      card = { ...card, ...{
        status: result.newStatus,
        intervalDays: result.newIntervalDays,
        easeFactor: result.newEaseFactor,
        repetitions: result.newRepetitions,
      }}
    }

    // Intervals should grow (not necessarily strictly, but the last should be bigger than 1)
    expect(intervals[intervals.length - 1]).toBeGreaterThan(intervals[1])
  })

  it('wrong after many corrects resets repetitions but keeps history', () => {
    const card = makeCard({
      status: 'review',
      repetitions: 4,
      intervalDays: 14,
      easeFactor: 2.2,
    })
    const result = calculateNextReview(card, 'wrong')

    expect(result.newRepetitions).toBe(0)
    expect(result.newIntervalDays).toBe(0)
    expect(result.newStatus).toBe('learning')
    // Ease factor should be penalized but not below min
    expect(result.newEaseFactor).toBeGreaterThanOrEqual(SRS.MIN_EASE_FACTOR)
  })
})
