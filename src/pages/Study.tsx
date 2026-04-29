import { useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Flame } from 'lucide-react'
import { useDeckStore } from '@/store/deckStore'
import { useStudyStore } from '@/store/studyStore'
import { FlashCard } from '@/components/flashcard/FlashCard'
import { RatingButtons } from '@/components/flashcard/RatingButtons'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Rating } from '@/types'
import { getTodayKey, getEffectiveStreak } from '@/lib/streak'

export function Study() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()

  const getDeckWithStats = useDeckStore((s) => s.getDeckWithStats)
  const getStudyQueue = useDeckStore((s) => s.getStudyQueue)
  const cards = useDeckStore((s) => s.cards)

  const session = useStudyStore((s) => s.session)
  const isFlipped = useStudyStore((s) => s.isFlipped)
  const startSession = useStudyStore((s) => s.startSession)
  const flip = useStudyStore((s) => s.flip)
  const rateCard = useStudyStore((s) => s.rateCard)
  const endSession = useStudyStore((s) => s.endSession)
  const currentCardId = useStudyStore((s) => s.currentCardId)
  const studyGoal = useStudyStore((s) => s.studyGoal)
  const todayStats = useStudyStore((s) => s.todayStats)

  const deck = deckId ? getDeckWithStats(deckId) : null

  useEffect(() => {
    if (!deckId || !deck) return
    const queue = getStudyQueue(deckId)
    if (queue.length === 0) return
    startSession(deckId, queue.map((c) => c.id))
  // getStudyQueue and startSession are stable Zustand refs — intentionally omitted.
  // This effect must only re-run when deckId changes, not when store state changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId])

  const handleRate = useCallback(
    (rating: Rating) => {
      rateCard(rating)
    },
    [rateCard]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        if (!isFlipped) flip()
      }
      if (isFlipped) {
        if (e.key === '1') handleRate('wrong')
        if (e.key === '2') handleRate('hard')
        if (e.key === '3') handleRate('correct')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFlipped, flip, handleRate])

  if (!deck) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-text-muted">Baralho não encontrado.</p>
        <Button onClick={() => navigate('/')}>Voltar</Button>
      </div>
    )
  }

  // Sessão concluída
  const isDone =
    session &&
    session.deckId === deckId &&
    session.currentIndex >= session.queue.length

  if (isDone || !session || session.deckId !== deckId) {
    const reviewed = session?.reviewedCount ?? 0
    const correct = session?.correctCount ?? 0
    const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0

    const today = getTodayKey()
    const streak = getEffectiveStreak(studyGoal, today)
    const goalMet = todayStats.cardsStudied >= studyGoal.dailyCardTarget
    const remaining = Math.max(0, studyGoal.dailyCardTarget - todayStats.cardsStudied)

    return (
      <div className="mx-auto flex max-w-sm flex-col items-center gap-8 py-20 text-center animate-fade-up">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/8"
          style={{ boxShadow: '0 0 40px rgb(16 185 129 / 0.12)' }}
        >
          <CheckCircle size={36} strokeWidth={1.5} className="text-emerald-400" />
        </div>

        <div className="space-y-2">
          <h2
            className="text-3xl font-bold text-text"
            style={{ letterSpacing: '-0.03em' }}
          >
            Sessão concluída
          </h2>
          <p className="text-text-muted">{deck.name}</p>
        </div>

        {reviewed > 0 && (
          <div className="grid w-full grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/60 bg-surface-1 p-4">
              <p
                className="text-3xl font-bold text-text"
                style={{ letterSpacing: '-0.03em' }}
              >
                {reviewed}
              </p>
              <p className="mt-0.5 text-xs text-text-subtle">cards revisados</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-surface-1 p-4">
              <p
                className="text-3xl font-bold"
                style={{
                  letterSpacing: '-0.03em',
                  color: accuracy >= 70 ? '#34d399' : accuracy >= 40 ? '#fbbf24' : '#f87171',
                }}
              >
                {accuracy}%
              </p>
              <p className="mt-0.5 text-xs text-text-subtle">de acerto</p>
            </div>
          </div>
        )}

        {reviewed > 0 && (
          <div className="w-full rounded-xl border border-border/60 bg-surface-1 p-4 text-left">
            {goalMet ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-emerald-400">Meta diária atingida ✓</span>
                {streak > 0 && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-amber-400">
                    · <Flame size={13} /> {streak} {streak === 1 ? 'dia' : 'dias'}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                Faltam{' '}
                <span className="font-semibold text-text">{remaining}</span>{' '}
                cards para a meta de hoje
              </p>
            )}
          </div>
        )}

        <div className="flex w-full gap-2.5">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => { endSession(); navigate('/') }}
          >
            <ArrowLeft size={14} />
            Voltar
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              endSession()
              const queue = getStudyQueue(deckId!)
              if (queue.length > 0) {
                startSession(deckId!, queue.map((c) => c.id))
              }
            }}
          >
            Reiniciar
          </Button>
        </div>
      </div>
    )
  }

  const cardId = currentCardId()
  const card = cardId ? cards[cardId] : null
  const total = session.queue.length
  const progress = session.currentIndex

  if (!card) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-text-muted">Card não encontrado.</p>
        <Button onClick={() => { endSession(); navigate('/') }}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => { endSession(); navigate('/') }}
          className="flex items-center gap-1.5 text-sm text-text-subtle hover:text-text-muted transition-colors"
        >
          <ArrowLeft size={14} />
          {deck.name}
        </button>
        <span className="text-sm tabular-nums text-text-subtle">
          {Math.min(progress + 1, total)}<span className="mx-1 opacity-30">/</span>{total}
        </span>
      </div>

      {/* Progress */}
      <ProgressBar value={progress} max={total} className="mb-8" />

      {/* Card — instrução de flip discreta no topo */}
      {!isFlipped && (
        <p className="mb-3 text-center text-xs text-text-subtle opacity-60">
          espaço ou clique para revelar
        </p>
      )}

      <FlashCard
        card={card}
        isFlipped={isFlipped}
        onClick={() => { if (!isFlipped) flip() }}
      />

      {/* Rating buttons */}
      <div className="mt-5">
        <RatingButtons visible={isFlipped} onRate={handleRate} />
      </div>
    </div>
  )
}
