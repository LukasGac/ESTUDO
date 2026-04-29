import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Flame, CalendarDays, Timer, CheckCircle, Circle } from 'lucide-react'
import { useDeckStore } from '@/store/deckStore'
import { useStudyStore } from '@/store/studyStore'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { useScheduleStore } from '@/store/scheduleStore'
import { useFocusStore } from '@/store/focusStore'
import { DeckCard } from '@/components/decks/DeckCard'
import { DeckForm } from '@/components/decks/DeckForm'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { GoalProgress } from '@/components/ui/GoalProgress'
import { CreateDeckInput } from '@/types'
import { getTodayKey, getEffectiveStreak } from '@/lib/streak'
import { cn } from '@/lib/utils'

const WEEK_DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export function Home() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)

  // Deck store
  const getAllDecksWithStats = useDeckStore((s) => s.getAllDecksWithStats)
  const addDeck = useDeckStore((s) => s.addDeck)
  const decks = getAllDecksWithStats()
  const totalDue = decks.reduce((s, d) => s + d.stats.dueToday, 0)

  // Study store
  const studyGoal = useStudyStore((s) => s.studyGoal)
  const getTodayProgress = useStudyStore((s) => s.getTodayProgress)
  const today = getTodayKey()
  const streak = getEffectiveStreak(studyGoal, today)
  const { studied, target } = getTodayProgress()

  // Pomodoro store
  const cyclesCompletedToday = usePomodoroStore((s) => s.cyclesCompletedToday)

  // Schedule store
  const getTodayEntries = useScheduleStore((s) => s.getTodayEntries)
  const toggleCompletion = useScheduleStore((s) => s.toggleCompletion)
  const isCompleted = useScheduleStore((s) => s.isCompleted)
  const todayEntries = getTodayEntries()
  const completedCount = todayEntries.filter((e) => isCompleted(e.id)).length

  // Focus store
  const dinos = useFocusStore((s) => s.dinos)

  const dayName = WEEK_DAYS[new Date().getDay()]

  function handleCreate(input: CreateDeckInput) {
    addDeck(input)
  }

  return (
    <div className="animate-fade-up space-y-8">

      {/* ── Saudação ── */}
      <div>
        <h1 className="text-3xl font-bold text-text" style={{ letterSpacing: '-0.03em' }}>
          {dayName}
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Stats do dia ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Streak"
          value={streak > 0 ? `${streak}d` : '—'}
          sub={streak > 0 ? 'dias consecutivos' : 'estude hoje'}
          icon={<Flame size={16} className={streak > 0 ? 'text-amber-400' : 'text-text-subtle'} />}
          highlight={streak > 0}
        />
        <StatCard
          label="Cards hoje"
          value={`${studied}/${target}`}
          sub={studied >= target ? 'Meta atingida ✓' : `${target - studied} restantes`}
          icon={<BookOpen size={16} className="text-accent" />}
          highlight={studied >= target}
          green={studied >= target}
        />
        <StatCard
          label="Pomodoros"
          value={String(cyclesCompletedToday)}
          sub="ciclos hoje"
          icon={<Timer size={16} className="text-violet-400" />}
        />
        <StatCard
          label="Cronograma"
          value={todayEntries.length > 0 ? `${completedCount}/${todayEntries.length}` : '—'}
          sub={todayEntries.length > 0 ? 'matérias hoje' : 'sem agenda hoje'}
          icon={<CalendarDays size={16} className="text-emerald-400" />}
          highlight={todayEntries.length > 0 && completedCount === todayEntries.length}
          green={todayEntries.length > 0 && completedCount === todayEntries.length}
        />
      </div>

      {/* ── Meta diária ── */}
      <GoalProgress />

      {/* ── Acesso rápido ── */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-subtle">Acesso rápido</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAccess
            label="Cronograma"
            description="Planejar semana"
            icon={<CalendarDays size={22} />}
            color="text-emerald-400"
            bg="bg-emerald-500/8 border-emerald-500/20"
            onClick={() => navigate('/schedule')}
          />
          <QuickAccess
            label="Modo Foco"
            description={`${dinos.length} ${dinos.length === 1 ? 'dinossauro' : 'dinossauros'}`}
            icon={<span className="text-2xl leading-none">🦕</span>}
            color="text-green-400"
            bg="bg-green-500/8 border-green-500/20"
            onClick={() => navigate('/focus')}
          />
          <QuickAccess
            label="Pomodoro"
            description={`${cyclesCompletedToday} ciclos hoje`}
            icon={<Timer size={22} />}
            color="text-violet-400"
            bg="bg-violet-500/8 border-violet-500/20"
            onClick={() => usePomodoroStore.getState().toggleExpanded()}
          />
          <QuickAccess
            label="Gerenciar"
            description={`${decks.length} baralhos`}
            icon={<BookOpen size={22} />}
            color="text-accent"
            bg="bg-accent/8 border-accent/20"
            onClick={() => navigate('/manage')}
          />
        </div>
      </div>

      {/* ── Agenda de hoje ── */}
      {todayEntries.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">Hoje no cronograma</h2>
            <button
              onClick={() => navigate('/schedule')}
              className="text-xs text-text-subtle hover:text-text transition-colors"
            >
              Ver tudo →
            </button>
          </div>
          <div className="space-y-2">
            {todayEntries.map((entry) => {
              const done = isCompleted(entry.id)
              return (
                <div
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 transition-opacity',
                    done ? 'border-border/30 opacity-50' : 'border-border/60 bg-surface-1'
                  )}
                >
                  <div className="h-8 w-1 flex-shrink-0 rounded-full" style={{ background: entry.color }} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium text-text truncate', done && 'line-through text-text-muted')}>
                      {entry.subject}
                    </p>
                    <p className="text-xs text-text-subtle">
                      {String(entry.startHour).padStart(2, '0')}:{String(entry.startMinute).padStart(2, '0')}
                    </p>
                  </div>
                  <button onClick={() => toggleCompletion(entry.id)} className="flex-shrink-0 text-text-subtle hover:text-text transition-colors">
                    {done
                      ? <CheckCircle size={17} className="text-emerald-400" />
                      : <Circle size={17} />
                    }
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Baralhos ── */}
      <div>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-text" style={{ letterSpacing: '-0.02em' }}>
              Meus Baralhos
            </h2>
            {totalDue > 0 ? (
              <p className="mt-1 text-sm text-text-muted">
                <span className="font-semibold text-accent">{totalDue}</span> card{totalDue > 1 ? 's' : ''} para revisar hoje
              </p>
            ) : (
              <p className="mt-1 text-sm text-text-subtle">Em dia com todas as revisões</p>
            )}
          </div>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus size={15} />
            Novo baralho
          </Button>
        </div>

        {decks.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={40} strokeWidth={1.2} />}
            title="Nenhum baralho ainda"
            description="Crie seu primeiro baralho para começar a estudar."
            action={
              <Button variant="primary" onClick={() => setShowForm(true)}>
                <Plus size={15} />
                Criar baralho
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </div>

      <DeckForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}

function StatCard({
  label, value, sub, icon, highlight, green,
}: {
  label: string; value: string; sub: string; icon: React.ReactNode
  highlight?: boolean; green?: boolean
}) {
  return (
    <div className={cn(
      'rounded-xl border p-4 transition-colors',
      green ? 'border-emerald-500/20 bg-emerald-500/5'
        : highlight ? 'border-accent/20 bg-accent/5'
        : 'border-border/60 bg-surface-1'
    )}>
      <div className="mb-2 flex items-center justify-between">
        {icon}
        <span className="text-xs text-text-subtle">{label}</span>
      </div>
      <p className={cn(
        'text-2xl font-bold tabular-nums',
        green ? 'text-emerald-400' : highlight ? 'text-accent' : 'text-text'
      )} style={{ letterSpacing: '-0.03em' }}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-text-subtle">{sub}</p>
    </div>
  )
}

function QuickAccess({
  label, description, icon, color, bg, onClick,
}: {
  label: string; description: string; icon: React.ReactNode
  color: string; bg: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-opacity hover:opacity-80',
        bg
      )}
    >
      <div className={color}>{icon}</div>
      <div>
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="mt-0.5 text-xs text-text-subtle">{description}</p>
      </div>
    </button>
  )
}
