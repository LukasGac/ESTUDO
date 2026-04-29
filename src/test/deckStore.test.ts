import { describe, it, expect, beforeEach } from 'vitest'
import { useDeckStore } from '@/store/deckStore'
import { SRS } from '@/constants/srs'

function resetStore() {
  localStorage.clear()
  useDeckStore.setState({ decks: {}, cards: {} })
}

describe('deckStore — deck CRUD', () => {
  beforeEach(resetStore)

  it('addDeck creates deck with correct shape', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'Direito', color: 'blue' })

    expect(deck.id).toBeTruthy()
    expect(deck.name).toBe('Direito')
    expect(deck.color).toBe('blue')
    expect(deck.createdAt).toBeTruthy()
    expect(deck.updatedAt).toBeTruthy()
  })

  it('addDeck inserts into store state', () => {
    useDeckStore.getState().addDeck({ name: 'Direito', color: 'blue' })
    const decks = useDeckStore.getState().decks
    expect(Object.keys(decks)).toHaveLength(1)
  })

  it('addDeck persists to localStorage', () => {
    useDeckStore.getState().addDeck({ name: 'Direito', color: 'blue' })
    const raw = localStorage.getItem('anki_decks_default')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    const ids = Object.keys(parsed)
    expect(ids).toHaveLength(1)
    expect(parsed[ids[0]].name).toBe('Direito')
  })

  it('updateDeck modifies the deck', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'Old Name', color: 'blue' })
    useDeckStore.getState().updateDeck(deck.id, { name: 'New Name' })

    const updated = useDeckStore.getState().decks[deck.id]
    expect(updated.name).toBe('New Name')
    expect(updated.color).toBe('blue') // unchanged
  })

  it('updateDeck on non-existent id is a no-op', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'Test', color: 'blue' })
    useDeckStore.getState().updateDeck('non-existent', { name: 'Should not appear' })
    expect(useDeckStore.getState().decks[deck.id].name).toBe('Test')
  })

  it('deleteDeck removes the deck and its cards', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'Test', color: 'blue' })
    useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q', back: 'A' })
    useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q2', back: 'A2' })

    useDeckStore.getState().deleteDeck(deck.id)

    expect(useDeckStore.getState().decks[deck.id]).toBeUndefined()
    const remainingCards = Object.values(useDeckStore.getState().cards).filter(
      (c) => c.deckId === deck.id
    )
    expect(remainingCards).toHaveLength(0)
  })

  it('deleteDeck only removes cards from the deleted deck', () => {
    const d1 = useDeckStore.getState().addDeck({ name: 'D1', color: 'blue' })
    const d2 = useDeckStore.getState().addDeck({ name: 'D2', color: 'violet' })
    useDeckStore.getState().addCard({ deckId: d1.id, front: 'Q1', back: 'A1' })
    useDeckStore.getState().addCard({ deckId: d2.id, front: 'Q2', back: 'A2' })

    useDeckStore.getState().deleteDeck(d1.id)

    const d2Cards = Object.values(useDeckStore.getState().cards).filter((c) => c.deckId === d2.id)
    expect(d2Cards).toHaveLength(1)
  })
})

describe('deckStore — card CRUD', () => {
  beforeEach(resetStore)

  it('addCard creates card with SRS defaults', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'D', color: 'blue' })
    const card = useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q', back: 'A' })

    expect(card.status).toBe('new')
    expect(card.intervalDays).toBe(0)
    expect(card.easeFactor).toBe(SRS.INITIAL_EASE_FACTOR)
    expect(card.repetitions).toBe(0)
    expect(card.totalReviews).toBe(0)
    expect(card.correctReviews).toBe(0)
    expect(card.lastReviewed).toBeNull()
  })

  it('addCard without hint leaves hint undefined', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'D', color: 'blue' })
    const card = useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q', back: 'A' })
    expect(card.hint).toBeUndefined()
  })

  it('updateCard modifies front and back', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'D', color: 'blue' })
    const card = useDeckStore.getState().addCard({ deckId: deck.id, front: 'Old Q', back: 'Old A' })

    useDeckStore.getState().updateCard(card.id, { front: 'New Q', back: 'New A' })

    const updated = useDeckStore.getState().cards[card.id]
    expect(updated.front).toBe('New Q')
    expect(updated.back).toBe('New A')
  })

  it('updateCard on non-existent id is a no-op', () => {
    useDeckStore.getState().updateCard('ghost', { front: 'X' })
    // Should not throw
  })

  it('deleteCard removes card from state and localStorage', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'D', color: 'blue' })
    const c1 = useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q1', back: 'A1' })
    const c2 = useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q2', back: 'A2' })

    useDeckStore.getState().deleteCard(c1.id)

    expect(useDeckStore.getState().cards[c1.id]).toBeUndefined()
    expect(useDeckStore.getState().cards[c2.id]).toBeDefined()
  })
})

describe('deckStore — applyRating', () => {
  beforeEach(resetStore)

  it('applyRating on correct increments totalReviews and correctReviews', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'D', color: 'blue' })
    const card = useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q', back: 'A' })

    useDeckStore.getState().applyRating(card.id, 'correct')

    const updated = useDeckStore.getState().cards[card.id]
    expect(updated.totalReviews).toBe(1)
    expect(updated.correctReviews).toBe(1)
  })

  it('applyRating on wrong increments totalReviews but not correctReviews', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'D', color: 'blue' })
    const card = useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q', back: 'A' })

    useDeckStore.getState().applyRating(card.id, 'wrong')

    const updated = useDeckStore.getState().cards[card.id]
    expect(updated.totalReviews).toBe(1)
    expect(updated.correctReviews).toBe(0)
  })

  it('applyRating updates lastReviewed', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'D', color: 'blue' })
    const card = useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q', back: 'A' })

    expect(card.lastReviewed).toBeNull()
    useDeckStore.getState().applyRating(card.id, 'correct')

    const updated = useDeckStore.getState().cards[card.id]
    expect(updated.lastReviewed).toBeTruthy()
  })

  it('applyRating on non-existent card is a no-op', () => {
    expect(() => useDeckStore.getState().applyRating('ghost-id', 'correct')).not.toThrow()
  })

  it('applyRating persists to localStorage', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'D', color: 'blue' })
    const card = useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q', back: 'A' })

    useDeckStore.getState().applyRating(card.id, 'correct')

    const raw = localStorage.getItem('anki_cards_default')
    const parsed = JSON.parse(raw!)
    expect(parsed[card.id].totalReviews).toBe(1)
  })
})

describe('deckStore — selectors', () => {
  beforeEach(resetStore)

  it('getCardsByDeck returns only cards from that deck', () => {
    const d1 = useDeckStore.getState().addDeck({ name: 'D1', color: 'blue' })
    const d2 = useDeckStore.getState().addDeck({ name: 'D2', color: 'violet' })
    useDeckStore.getState().addCard({ deckId: d1.id, front: 'Q1', back: 'A1' })
    useDeckStore.getState().addCard({ deckId: d2.id, front: 'Q2', back: 'A2' })

    const d1Cards = useDeckStore.getState().getCardsByDeck(d1.id)
    expect(d1Cards).toHaveLength(1)
    expect(d1Cards[0].front).toBe('Q1')
  })

  it('getDeckWithStats returns null for unknown deckId', () => {
    expect(useDeckStore.getState().getDeckWithStats('unknown')).toBeNull()
  })

  it('getDeckWithStats returns deck with computed stats', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'D', color: 'blue' })
    useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q', back: 'A' })

    const result = useDeckStore.getState().getDeckWithStats(deck.id)
    expect(result).not.toBeNull()
    expect(result!.stats.totalCards).toBe(1)
    expect(result!.stats.newCards).toBe(1)
    expect(result!.stats.dueToday).toBe(1)
  })

  it('getAllDecksWithStats returns all decks with stats', () => {
    useDeckStore.getState().addDeck({ name: 'D1', color: 'blue' })
    useDeckStore.getState().addDeck({ name: 'D2', color: 'violet' })

    const all = useDeckStore.getState().getAllDecksWithStats()
    expect(all).toHaveLength(2)
    expect(all.every((d) => d.stats !== undefined)).toBe(true)
  })

  it('getStudyQueue returns cards due today sorted by priority', () => {
    const deck = useDeckStore.getState().addDeck({ name: 'D', color: 'blue' })
    useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q1', back: 'A1' })
    useDeckStore.getState().addCard({ deckId: deck.id, front: 'Q2', back: 'A2' })

    const queue = useDeckStore.getState().getStudyQueue(deck.id)
    expect(queue).toHaveLength(2)
  })
})
