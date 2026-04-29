import { useNavigate } from 'react-router-dom'
import { Settings, Play } from 'lucide-react'
import { DeckWithStats } from '@/types'
import { DeckStatsBar } from './DeckStats'
import { cn } from '@/lib/utils'

const colorBar: Record<string, string> = {
  blue:    '#4f8ef7',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
  cyan:    '#06b6d4',
}

const colorStudyBtn: Record<string, string> = {
  blue:    'bg-blue-500/10 text-blue-400 hover:bg-blue-500/18 border-blue-500/20',
  violet:  'bg-violet-500/10 text-violet-400 hover:bg-violet-500/18 border-violet-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/18 border-emerald-500/20',
  amber:   'bg-amber-500/10 text-amber-400 hover:bg-amber-500/18 border-amber-500/20',
  rose:    'bg-rose-500/10 text-rose-400 hover:bg-rose-500/18 border-rose-500/20',
  cyan:    'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/18 border-cyan-500/20',
}

interface DeckCardProps {
  deck: DeckWithStats
}

export function DeckCard({ deck }: DeckCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/60 bg-surface-1 p-5 transition-all duration-200',
        'hover:border-border hover:shadow-lg hover:shadow-black/30 hover:scale-[1.005]'
      )}
      style={{ boxShadow: '0 1px 3px rgb(0 0 0 / 0.3)' }}
    >
      {/* Barra de cor lateral */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: colorBar[deck.color] ?? '#4f8ef7' }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className="truncate font-semibold text-text"
            style={{ letterSpacing: '-0.01em' }}
          >
            {deck.name}
          </h3>
          {deck.description && (
            <p className="mt-0.5 truncate text-sm text-text-muted">{deck.description}</p>
          )}
          <DeckStatsBar stats={deck.stats} />
        </div>

        <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/manage/${deck.id}`)
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-subtle hover:bg-surface-3 hover:text-text transition-colors"
            title="Gerenciar baralho"
            aria-label="Gerenciar baralho"
          >
            <Settings size={13} />
          </button>
        </div>
      </div>

      <button
        onClick={() => navigate(`/study/${deck.id}`)}
        disabled={deck.stats.dueToday === 0}
        className={cn(
          'mt-4 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all duration-150',
          deck.stats.dueToday > 0
            ? cn('active:scale-[0.99]', colorStudyBtn[deck.color] ?? colorStudyBtn.blue)
            : 'cursor-not-allowed border-border bg-surface-3/50 text-text-subtle'
        )}
      >
        <Play size={12} />
        {deck.stats.dueToday > 0
          ? `Estudar ${deck.stats.dueToday} card${deck.stats.dueToday > 1 ? 's' : ''}`
          : 'Em dia'}
      </button>
    </div>
  )
}
