import { describe, it, expect, beforeEach } from 'vitest'
import {
  getDecks,
  saveDecks,
  getCards,
  saveCard,
  saveAllCards,
  deleteCardFromStorage,
  getSession,
  saveSession,
  isInitialized,
  markInitialized,
} from '@/lib/storage'
import { Card, Deck, StudySession } from '@/types'

function makeDeck(id = 'd1'): Deck {
  const now = new Date().toISOString()
  return {
    id,
    name: 'Test Deck',
    color: 'blue',
    createdAt: now,
    updatedAt: now,
  }
}

function makeCard(id = 'c1', deckId = 'd1'): Card {
  const now = new Date().toISOString()
  return {
    id,
    deckId,
    front: 'Q',
    back: 'A',
    status: 'new',
    intervalDays: 0,
    easeFactor: 2.0,
    repetitions: 0,
    dueDate: now,
    lastReviewed: null,
    totalReviews: 0,
    correctReviews: 0,
    createdAt: now,
    updatedAt: now,
  }
}

describe('storage — decks', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getDecks returns empty object when nothing stored', () => {
    expect(getDecks()).toEqual({})
  })

  it('saveDecks and getDecks round-trip correctly', () => {
    const deck = makeDeck()
    saveDecks({ [deck.id]: deck })
    const loaded = getDecks()
    expect(loaded[deck.id]).toEqual(deck)
  })

  it('saveDecks overwrites previous data', () => {
    const d1 = makeDeck('d1')
    const d2 = makeDeck('d2')
    saveDecks({ [d1.id]: d1 })
    saveDecks({ [d2.id]: d2 })
    const loaded = getDecks()
    expect(Object.keys(loaded)).toHaveLength(1)
    expect(loaded['d2']).toEqual(d2)
  })
})

describe('storage — cards', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getCards returns empty object when nothing stored', () => {
    expect(getCards()).toEqual({})
  })

  it('saveCard persists and getCards retrieves it', () => {
    const card = makeCard()
    saveCard(card)
    expect(getCards()[card.id]).toEqual(card)
  })

  it('saveCard updates existing card', () => {
    const card = makeCard()
    saveCard(card)
    const updated = { ...card, front: 'Updated Q' }
    saveCard(updated)
    expect(getCards()[card.id].front).toBe('Updated Q')
  })

  it('saveCard preserves other cards', () => {
    const c1 = makeCard('c1')
    const c2 = makeCard('c2')
    saveCard(c1)
    saveCard(c2)
    const all = getCards()
    expect(Object.keys(all)).toHaveLength(2)
  })

  it('saveAllCards replaces entire cards map', () => {
    saveCard(makeCard('c1'))
    const c2 = makeCard('c2')
    saveAllCards({ [c2.id]: c2 })
    const all = getCards()
    expect(Object.keys(all)).toHaveLength(1)
    expect(all['c2']).toEqual(c2)
  })

  it('deleteCardFromStorage removes the card', () => {
    const c1 = makeCard('c1')
    const c2 = makeCard('c2')
    saveCard(c1)
    saveCard(c2)
    deleteCardFromStorage('c1')
    const all = getCards()
    expect(all['c1']).toBeUndefined()
    expect(all['c2']).toEqual(c2)
  })

  it('deleteCardFromStorage on non-existent id is a no-op', () => {
    saveCard(makeCard('c1'))
    deleteCardFromStorage('non-existent')
    expect(Object.keys(getCards())).toHaveLength(1)
  })
})

describe('storage — session', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getSession returns null when nothing stored', () => {
    expect(getSession()).toBeNull()
  })

  it('saveSession and getSession round-trip', () => {
    const session: StudySession = {
      deckId: 'd1',
      queue: ['c1', 'c2'],
      currentIndex: 0,
      startedAt: new Date().toISOString(),
      reviewedCount: 0,
      correctCount: 0,
    }
    saveSession(session)
    expect(getSession()).toEqual(session)
  })

  it('saveSession(null) removes stored session', () => {
    const session: StudySession = {
      deckId: 'd1',
      queue: ['c1'],
      currentIndex: 0,
      startedAt: new Date().toISOString(),
      reviewedCount: 0,
      correctCount: 0,
    }
    saveSession(session)
    saveSession(null)
    expect(getSession()).toBeNull()
  })
})

describe('storage — initialization', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('isInitialized returns false when meta not set', () => {
    expect(isInitialized()).toBe(false)
  })

  it('markInitialized makes isInitialized return true', () => {
    markInitialized()
    expect(isInitialized()).toBe(true)
  })

  it('isInitialized is idempotent after multiple markInitialized calls', () => {
    markInitialized()
    markInitialized()
    expect(isInitialized()).toBe(true)
  })
})

describe('storage — corruption resilience', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getDecks returns {} when localStorage contains invalid JSON', () => {
    localStorage.setItem('anki_decks', '{broken json')
    expect(getDecks()).toEqual({})
  })

  it('getCards returns {} when localStorage contains invalid JSON', () => {
    localStorage.setItem('anki_cards', 'not json at all')
    expect(getCards()).toEqual({})
  })

  it('getSession returns null when localStorage contains invalid JSON', () => {
    localStorage.setItem('anki_session', '[invalid')
    expect(getSession()).toBeNull()
  })
})
