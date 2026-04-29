import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, ChevronLeft, Pencil, LayoutList } from 'lucide-react'
import { useDeckStore } from '@/store/deckStore'
import { CardItem } from '@/components/cards/CardItem'
import { CardForm } from '@/components/cards/CardForm'
import { DeckForm } from '@/components/decks/DeckForm'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card, CreateCardInput, CreateDeckInput } from '@/types'

export function Manage() {
  const { deckId } = useParams<{ deckId?: string }>()
  const navigate = useNavigate()

  const getAllDecksWithStats = useDeckStore((s) => s.getAllDecksWithStats)
  const getCardsByDeck = useDeckStore((s) => s.getCardsByDeck)
  const addDeck = useDeckStore((s) => s.addDeck)
  const updateDeck = useDeckStore((s) => s.updateDeck)
  const deleteDeck = useDeckStore((s) => s.deleteDeck)
  const addCard = useDeckStore((s) => s.addCard)
  const updateCard = useDeckStore((s) => s.updateCard)
  const deleteCard = useDeckStore((s) => s.deleteCard)

  const [showDeckForm, setShowDeckForm] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null)

  const decks = getAllDecksWithStats()
  const selectedDeck = deckId ? decks.find((d) => d.id === deckId) : null
  const deckCards = deckId ? getCardsByDeck(deckId) : []

  function handleAddCard(input: CreateCardInput) {
    addCard(input)
  }

  function handleEditCard(input: CreateCardInput) {
    if (!editingCard) return
    updateCard(editingCard.id, { front: input.front, back: input.back, hint: input.hint })
    setEditingCard(null)
  }

  function handleDeleteCard(cardId: string) {
    if (window.confirm('Excluir este card?')) deleteCard(cardId)
  }

  function handleDeleteDeck(id: string) {
    if (window.confirm('Excluir este baralho e todos os seus cards?')) {
      deleteDeck(id)
      if (deckId === id) navigate('/manage')
    }
  }

  function handleCreateDeck(input: CreateDeckInput) {
    const deck = addDeck(input)
    navigate(`/manage/${deck.id}`)
  }

  function handleUpdateDeck(input: CreateDeckInput) {
    if (!editingDeckId) return
    updateDeck(editingDeckId, input)
    setEditingDeckId(null)
  }

  return (
    <div className="animate-fade-up">
      {/* Deck selecionado */}
      {selectedDeck ? (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/manage')}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  {selectedDeck.icon && <span>{selectedDeck.icon}</span>}
                  <h1 className="font-bold text-text">{selectedDeck.name}</h1>
                </div>
                <p className="text-sm text-text-muted">{deckCards.length} cards</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEditingDeckId(selectedDeck.id); setShowDeckForm(true) }}
              >
                <Pencil size={13} />
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteDeck(selectedDeck.id)}
              >
                <Trash2 size={13} />
                Excluir
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowCardForm(true)}>
                <Plus size={13} />
                Novo card
              </Button>
            </div>
          </div>

          {deckCards.length === 0 ? (
            <EmptyState
              icon={<LayoutList size={36} strokeWidth={1.2} />}
              title="Nenhum card ainda"
              description="Adicione cards para começar a estudar este baralho."
              action={
                <Button variant="primary" onClick={() => setShowCardForm(true)}>
                  <Plus size={14} />
                  Adicionar card
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {deckCards.map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  onEdit={(c) => setEditingCard(c)}
                  onDelete={handleDeleteCard}
                />
              ))}
            </div>
          )}

          {/* Form novo card */}
          <CardForm
            open={showCardForm}
            onClose={() => setShowCardForm(false)}
            deckId={selectedDeck.id}
            onSubmit={handleAddCard}
          />

          {/* Form editar card */}
          {editingCard && (
            <CardForm
              open
              onClose={() => setEditingCard(null)}
              deckId={selectedDeck.id}
              onSubmit={handleEditCard}
              initial={editingCard}
              title="Editar card"
            />
          )}

          {/* Form editar baralho */}
          <DeckForm
            open={showDeckForm}
            onClose={() => { setShowDeckForm(false); setEditingDeckId(null) }}
            onSubmit={handleUpdateDeck}
            initial={selectedDeck}
            title="Editar baralho"
          />
        </>
      ) : (
        /* Lista de baralhos */
        <>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-text">Gerenciar</h1>
            <Button variant="primary" onClick={() => setShowDeckForm(true)}>
              <Plus size={15} />
              Novo baralho
            </Button>
          </div>

          {decks.length === 0 ? (
            <EmptyState
              title="Nenhum baralho"
              description="Crie um baralho para começar."
            />
          ) : (
            <div className="space-y-2">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-1 px-4 py-3 transition-colors hover:bg-surface-2"
                >
                  <button
                    className="flex flex-1 items-center gap-3 text-left"
                    onClick={() => navigate(`/manage/${deck.id}`)}
                  >
                    {deck.icon && <span>{deck.icon}</span>}
                    <div>
                      <p className="font-medium text-text">{deck.name}</p>
                      <p className="text-sm text-text-muted">{deck.stats.totalCards} cards</p>
                    </div>
                  </button>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setEditingDeckId(deck.id); setShowDeckForm(true) }}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDeleteDeck(deck.id)}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DeckForm
            key={editingDeckId ?? 'new'}
            open={showDeckForm}
            onClose={() => { setShowDeckForm(false); setEditingDeckId(null) }}
            onSubmit={editingDeckId ? handleUpdateDeck : handleCreateDeck}
            initial={editingDeckId ? decks.find((d) => d.id === editingDeckId) : undefined}
            title={editingDeckId ? 'Editar baralho' : 'Novo baralho'}
          />
        </>
      )}
    </div>
  )
}
