import { create } from 'zustand'
import { Card, CreateCardInput, CreateDeckInput, Deck, DeckWithStats, Rating } from '@/types'
import {
  deleteCardFromStorage,
  getActiveUserId,
  getCards,
  getDecks,
  markInitialized,
  saveAllCards,
  saveCard,
  saveDecks,
} from '@/lib/storage'
import { fetchCards, fetchDecks } from '@/lib/db'
import { buildStudyQueue, calculateNextReview, computeDeckStats } from '@/lib/srs'
import { generateId } from '@/lib/utils'
import { SRS } from '@/constants/srs'

interface DeckStore {
  decks: Record<string, Deck>
  cards: Record<string, Card>

  hydrate: () => void
  reset: () => void

  addDeck: (input: CreateDeckInput) => Deck
  updateDeck: (id: string, updates: Partial<Pick<Deck, 'name' | 'description' | 'color' | 'icon'>>) => void
  deleteDeck: (id: string) => void

  addCard: (input: CreateCardInput) => Card
  updateCard: (id: string, updates: Partial<Pick<Card, 'front' | 'back' | 'hint'>>) => void
  deleteCard: (id: string) => void
  applyRating: (cardId: string, rating: Rating) => void

  getDeckWithStats: (deckId: string) => DeckWithStats | null
  getCardsByDeck: (deckId: string) => Card[]
  getStudyQueue: (deckId: string) => Card[]
  getAllDecksWithStats: () => DeckWithStats[]
}

export const useDeckStore = create<DeckStore>((set, get) => ({
  decks: {},
  cards: {},

  hydrate() {
    // Carrega do localStorage imediatamente (UX instantânea)
    const localDecks = getDecks()
    const localCards = getCards()
    if (Object.keys(localDecks).length === 0 && Object.keys(localCards).length === 0) {
      markInitialized()
    }
    set({ decks: localDecks, cards: localCards })

    // Reconcilia com Supabase em background
    const userId = getActiveUserId()
    if (userId === 'default') return
    Promise.all([fetchDecks(userId), fetchCards(userId)])
      .then(([remoteDecks, remoteCards]) => {
        // Supabase é a fonte de verdade — sobrescreve localStorage
        if (Object.keys(remoteDecks).length > 0 || Object.keys(remoteCards).length > 0) {
          localStorage.setItem(`anki_decks_${userId}`, JSON.stringify(remoteDecks))
          localStorage.setItem(`anki_cards_${userId}`, JSON.stringify(remoteCards))
          set({ decks: remoteDecks, cards: remoteCards })
        }
      })
      .catch(console.error)
  },

  reset() {
    set({ decks: {}, cards: {} })
  },

  addDeck(input) {
    const now = new Date().toISOString()
    const deck: Deck = {
      id: generateId(),
      name: input.name,
      description: input.description,
      color: input.color,
      icon: input.icon,
      createdAt: now,
      updatedAt: now,
    }
    const decks = { ...get().decks, [deck.id]: deck }
    saveDecks(decks)
    set({ decks })
    return deck
  },

  updateDeck(id, updates) {
    const decks = { ...get().decks }
    if (!decks[id]) return
    decks[id] = { ...decks[id], ...updates, updatedAt: new Date().toISOString() }
    saveDecks(decks)
    set({ decks })
  },

  deleteDeck(id) {
    const decks = { ...get().decks }
    delete decks[id]

    const cards = { ...get().cards }
    Object.keys(cards).forEach((cid) => {
      if (cards[cid].deckId === id) delete cards[cid]
    })

    saveDecks(decks)
    saveAllCards(cards)
    set({ decks, cards })
  },

  addCard(input) {
    const now = new Date().toISOString()
    const card: Card = {
      id: generateId(),
      deckId: input.deckId,
      front: input.front,
      back: input.back,
      hint: input.hint,
      status: 'new',
      intervalDays: 0,
      easeFactor: SRS.INITIAL_EASE_FACTOR,
      repetitions: 0,
      dueDate: now,
      lastReviewed: null,
      totalReviews: 0,
      correctReviews: 0,
      createdAt: now,
      updatedAt: now,
    }
    saveCard(card)
    set({ cards: { ...get().cards, [card.id]: card } })
    return card
  },

  updateCard(id, updates) {
    const cards = { ...get().cards }
    if (!cards[id]) return
    cards[id] = { ...cards[id], ...updates, updatedAt: new Date().toISOString() }
    saveCard(cards[id])
    set({ cards })
  },

  deleteCard(id) {
    const cards = { ...get().cards }
    delete cards[id]
    deleteCardFromStorage(id)
    set({ cards })
  },

  applyRating(cardId, rating) {
    const cards = { ...get().cards }
    const card = cards[cardId]
    if (!card) return

    const result = calculateNextReview(card, rating)
    const updated: Card = {
      ...card,
      status: result.newStatus,
      intervalDays: result.newIntervalDays,
      easeFactor: result.newEaseFactor,
      repetitions: result.newRepetitions,
      dueDate: result.newDueDate,
      lastReviewed: new Date().toISOString(),
      totalReviews: card.totalReviews + 1,
      correctReviews: card.correctReviews + (rating === 'correct' ? 1 : 0),
      updatedAt: new Date().toISOString(),
    }

    const updatedCards = { ...cards, [cardId]: updated }
    saveAllCards(updatedCards)
    set({ cards: updatedCards })
  },

  getDeckWithStats(deckId) {
    const deck = get().decks[deckId]
    if (!deck) return null
    const deckCards = get().getCardsByDeck(deckId)
    return { ...deck, stats: computeDeckStats(deckCards) }
  },

  getCardsByDeck(deckId) {
    return Object.values(get().cards).filter((c) => c.deckId === deckId)
  },

  getStudyQueue(deckId) {
    return buildStudyQueue(get().getCardsByDeck(deckId))
  },

  getAllDecksWithStats() {
    const { decks } = get()
    return Object.values(decks).map((deck) => {
      const deckCards = get().getCardsByDeck(deck.id)
      return { ...deck, stats: computeDeckStats(deckCards) }
    })
  },
}))
