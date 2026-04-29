import { DeckStats } from '@/types'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface DeckStatsProps {
  stats: DeckStats
}

export function DeckStatsBar({ stats }: DeckStatsProps) {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{stats.accuracy}% de acerto</span>
        <span>{stats.dueToday} para revisar</span>
      </div>
      <ProgressBar value={stats.accuracy} color={stats.accuracy >= 70 ? 'green' : stats.accuracy >= 40 ? 'amber' : 'blue'} />
      <div className="flex gap-3 text-xs text-text-subtle">
        <span>{stats.totalCards} cards</span>
        {stats.newCards > 0 && <span className="text-blue-400">{stats.newCards} novos</span>}
        {stats.masteredCards > 0 && (
          <span className="text-emerald-400">{stats.masteredCards} dominados</span>
        )}
      </div>
    </div>
  )
}
