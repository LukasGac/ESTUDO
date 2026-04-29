import { useState } from 'react'
import { Target, ChevronDown, ChevronUp } from 'lucide-react'
import { useStudyStore, DayHistoryEntry } from '@/store/studyStore'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/utils'
import { GoalType } from '@/types'

const DAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function formatHistoryDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return DAY_INITIALS[d.getDay()]
}

function isToday(dateStr: string): boolean {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return dateStr === `${y}-${m}-${day}`
}

export function GoalProgress() {
  const studyGoal            = useStudyStore((s) => s.studyGoal)
  const getTodayProgress     = useStudyStore((s) => s.getTodayProgress)
  const getLast7DaysStats    = useStudyStore((s) => s.getLast7DaysStats)
  const setGoalType          = useStudyStore((s) => s.setGoalType)
  const setDailyTarget       = useStudyStore((s) => s.setDailyTarget)
  const setDailyMinutesTarget = useStudyStore((s) => s.setDailyMinutesTarget)

  const { studied, target, pct } = getTodayProgress()
  const history = getLast7DaysStats()

  const [expanded, setExpanded] = useState(false)
  const [editTarget, setEditTarget] = useState(false)
  const [targetInput, setTargetInput] = useState('')

  const goalReached = pct >= 100

  function handleTargetSubmit() {
    const n = parseInt(targetInput, 10)
    if (!isNaN(n) && n > 0) {
      if (studyGoal.goalType === 'cards') setDailyTarget(n)
      else setDailyMinutesTarget(n)
    }
    setEditTarget(false)
    setTargetInput('')
  }

  const currentTarget = studyGoal.goalType === 'cards' ? studyGoal.dailyCardTarget : studyGoal.dailyMinutesTarget
  const unitLabel = studyGoal.goalType === 'cards' ? 'cards' : 'min'

  return (
    <div className="rounded-xl border border-border/60 bg-surface-1 p-4">
      {/* Cabeçalho */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={14} className={goalReached ? 'text-emerald-400' : 'text-accent'} />
          <span className="text-sm font-medium text-text">Meta diária</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle cards / horas */}
          <div className="flex items-center rounded-lg border border-border bg-surface-2 p-0.5">
            {(['cards', 'hours'] as GoalType[]).map((type) => (
              <button
                key={type}
                onClick={() => setGoalType(type)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  studyGoal.goalType === type
                    ? 'bg-accent/20 text-accent'
                    : 'text-text-subtle hover:text-text'
                )}
              >
                {type === 'cards' ? 'Cards' : 'Horas'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-text-subtle hover:text-text transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Progresso de hoje */}
      <ProgressBar
        value={studied}
        max={target}
        color={goalReached ? 'green' : 'blue'}
        className="mb-2"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-text-subtle">
          {goalReached ? (
            <span className="text-emerald-400 font-medium">Meta atingida ✓</span>
          ) : (
            <>
              <span className="font-semibold text-text">{studied}</span>
              {' / '}
              {editTarget ? (
                <input
                  type="number"
                  min={1}
                  value={targetInput}
                  autoFocus
                  onChange={(e) => setTargetInput(e.target.value)}
                  onBlur={handleTargetSubmit}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTargetSubmit() }}
                  className="w-16 rounded border border-accent/40 bg-surface-2 px-1 text-xs text-text focus:outline-none"
                  placeholder={String(currentTarget)}
                />
              ) : (
                <button
                  onClick={() => { setEditTarget(true); setTargetInput(String(currentTarget)) }}
                  className="font-semibold text-text underline decoration-dotted underline-offset-2 hover:text-accent transition-colors"
                >
                  {currentTarget}
                </button>
              )}
              {' '}{unitLabel}
            </>
          )}
        </p>
        <span className="text-xs font-medium text-text-subtle">{pct}%</span>
      </div>

      {/* Histórico expandido: últimos 7 dias */}
      {expanded && (
        <div className="mt-4 border-t border-border/40 pt-4">
          <p className="mb-3 text-xs font-medium text-text-muted">Últimos 7 dias</p>
          <div className="flex gap-1.5 justify-between">
            {history.map((entry: DayHistoryEntry) => {
              const isCurrentDay = isToday(entry.date)
              const studiedValue = studyGoal.goalType === 'cards'
                ? entry.stats.cardsStudied
                : entry.stats.minutesStudied
              const hasActivity = studiedValue > 0
              return (
                <div key={entry.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={cn(
                      'flex h-8 w-full max-w-[36px] items-center justify-center rounded-lg text-[10px] font-semibold transition-colors',
                      entry.goalReached
                        ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                        : hasActivity
                        ? 'bg-accent/10 text-accent/70'
                        : isCurrentDay
                        ? 'bg-surface-3 text-text-subtle ring-1 ring-accent/30'
                        : 'bg-surface-3 text-text-subtle/40'
                    )}
                    title={`${entry.date}: ${studiedValue} ${unitLabel}`}
                  >
                    {entry.goalReached ? '✓' : hasActivity ? studiedValue > 99 ? '99+' : String(studiedValue) : '–'}
                  </div>
                  <span className={cn(
                    'text-[9px]',
                    isCurrentDay ? 'font-semibold text-accent' : 'text-text-subtle/50'
                  )}>
                    {formatHistoryDate(entry.date)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
