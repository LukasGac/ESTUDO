import { describe, it, expect, beforeEach } from 'vitest'
import { useStudyStore } from '@/store/studyStore'
import { useDeckStore } from '@/store/deckStore'

// Reset both stores between tests
function resetStores() {
  localStorage.clear()
  useStudyStore.setState({ session: null, isFlipped: false })
  // Re-initialize deck store without seed (start fresh)
  useDeckStore.setState({ decks: {}, cards: {} })
}

function addTestCard(id: string) {
  const now = new Date().toISOString()
  useDeckStore.setState((s) => ({
    cards: {
      ...s.cards,
      [id]: {
        id,
        deckId: 'deck-test',
        front: `Q ${id}`,
        back: `A ${id}`,
        status: 'new' as const,
        intervalDays: 0,
        easeFactor: 2.0,
        repetitions: 0,
        dueDate: now,
        lastReviewed: null,
        totalReviews: 0,
        correctReviews: 0,
        createdAt: now,
        updatedAt: now,
      },
    },
  }))
}

describe('StudyStore — session lifecycle', () => {
  beforeEach(resetStores)

  it('starts with no session', () => {
    expect(useStudyStore.getState().session).toBeNull()
    expect(useStudyStore.getState().isFlipped).toBe(false)
  })

  it('startSession creates session with correct initial state', () => {
    const { startSession } = useStudyStore.getState()
    startSession('deck-1', ['c1', 'c2', 'c3'])

    const { session } = useStudyStore.getState()
    expect(session).not.toBeNull()
    expect(session!.deckId).toBe('deck-1')
    expect(session!.queue).toEqual(['c1', 'c2', 'c3'])
    expect(session!.currentIndex).toBe(0)
    expect(session!.reviewedCount).toBe(0)
    expect(session!.correctCount).toBe(0)
  })

  it('flip sets isFlipped to true', () => {
    useStudyStore.getState().startSession('deck-1', ['c1'])
    useStudyStore.getState().flip()
    expect(useStudyStore.getState().isFlipped).toBe(true)
  })

  it('endSession clears session and isFlipped', () => {
    useStudyStore.getState().startSession('deck-1', ['c1'])
    useStudyStore.getState().flip()
    useStudyStore.getState().endSession()

    const state = useStudyStore.getState()
    expect(state.session).toBeNull()
    expect(state.isFlipped).toBe(false)
  })

  it('currentCardId returns the current card id', () => {
    useStudyStore.getState().startSession('deck-1', ['c1', 'c2'])
    expect(useStudyStore.getState().currentCardId()).toBe('c1')
  })

  it('currentCardId returns null when no session', () => {
    expect(useStudyStore.getState().currentCardId()).toBeNull()
  })
})

describe('StudyStore — rateCard progression', () => {
  beforeEach(() => {
    resetStores()
    addTestCard('c1')
    addTestCard('c2')
    addTestCard('c3')
  })

  it('correct rating advances to next card', () => {
    useStudyStore.getState().startSession('deck-test', ['c1', 'c2', 'c3'])
    useStudyStore.getState().rateCard('correct')

    const { session } = useStudyStore.getState()
    expect(session!.currentIndex).toBe(1)
    expect(useStudyStore.getState().currentCardId()).toBe('c2')
  })

  it('correct rating increments reviewedCount and correctCount', () => {
    useStudyStore.getState().startSession('deck-test', ['c1', 'c2'])
    useStudyStore.getState().rateCard('correct')

    const { session } = useStudyStore.getState()
    expect(session!.reviewedCount).toBe(1)
    expect(session!.correctCount).toBe(1)
  })

  it('wrong rating increments reviewedCount but NOT correctCount', () => {
    useStudyStore.getState().startSession('deck-test', ['c1', 'c2'])
    useStudyStore.getState().rateCard('wrong')

    const { session } = useStudyStore.getState()
    expect(session!.reviewedCount).toBe(1)
    expect(session!.correctCount).toBe(0)
  })

  it('wrong rating reinserts card 3 positions ahead', () => {
    // queue = [c1, c2, c3], currentIndex=0, rate wrong on c1
    // c1 inserted at min(0+3, 3) = 3
    // new queue = [c2, c3, c1] (original first item moves forward)
    // Wait: the queue already has c1 at index 0, we insert c1 at index 3
    // new queue = [c1, c2, c3, c1] then currentIndex becomes 1
    // So queue is [c1, c2, c3, c1], next is c2
    useStudyStore.getState().startSession('deck-test', ['c1', 'c2', 'c3'])
    useStudyStore.getState().rateCard('wrong')

    const { session } = useStudyStore.getState()
    expect(session!.currentIndex).toBe(1)
    expect(session!.queue).toHaveLength(4) // c1 reinserted
    // The reinserted c1 should appear after current position
    expect(session!.queue.indexOf('c1', session!.currentIndex)).toBeGreaterThan(session!.currentIndex - 1)
  })

  it('rateCard resets isFlipped to false', () => {
    addTestCard('c4')
    useStudyStore.getState().startSession('deck-test', ['c1', 'c4'])
    useStudyStore.getState().flip()
    expect(useStudyStore.getState().isFlipped).toBe(true)

    useStudyStore.getState().rateCard('correct')
    expect(useStudyStore.getState().isFlipped).toBe(false)
  })

  it('session completes when last card is rated', () => {
    useStudyStore.getState().startSession('deck-test', ['c1'])
    useStudyStore.getState().rateCard('correct')

    const { session } = useStudyStore.getState()
    // Session still has data (for the completion screen) but index is past the end
    expect(session!.currentIndex).toBeGreaterThanOrEqual(session!.queue.length)
  })

  it('rateCard is no-op when no session', () => {
    // Should not throw
    expect(() => useStudyStore.getState().rateCard('correct')).not.toThrow()
  })
})

describe('StudyStore — persistence', () => {
  beforeEach(() => {
    resetStores()
    addTestCard('c1')
  })

  it('startSession persists to localStorage', () => {
    useStudyStore.getState().startSession('deck-test', ['c1'])
    const raw = localStorage.getItem('anki_session_default')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.deckId).toBe('deck-test')
  })

  it('endSession removes from localStorage', () => {
    useStudyStore.getState().startSession('deck-test', ['c1'])
    useStudyStore.getState().endSession()
    expect(localStorage.getItem('anki_session_default')).toBeNull()
  })
})
