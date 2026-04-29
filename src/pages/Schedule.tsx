import { useState } from 'react'
import { Plus, Trash2, CheckCircle, Circle, CalendarDays, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useScheduleStore } from '@/store/scheduleStore'
import { ScheduleEntryForm } from '@/components/schedule/ScheduleEntryForm'
import { Button } from '@/components/ui/Button'
import { ScheduleEntry, WeekDay } from '@/types'
import { cn } from '@/lib/utils'

const WEEK_DAYS_FULL  = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const WEEK_DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const ORDERED_DAYS: WeekDay[] = [1, 2, 3, 4, 5, 6, 0]

function formatTime(hour: number, minute: 0 | 30): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h${m}min` : `${h}h`
}

function formatWeekRange(dates: Date[]): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${fmt(dates[0])} a ${fmt(dates[6])}`
}

function formatDayDate(dates: Date[], dayOfWeek: WeekDay): string {
  // dates[0]=Seg ... dates[6]=Dom; dayOfWeek 0=Dom=idx6, 1=Seg=idx0...
  const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const d = dates[idx]
  if (!d) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function Schedule() {
  const entries         = useScheduleStore((s) => s.entries)
  const weekOffset      = useScheduleStore((s) => s.weekOffset)
  const addEntry        = useScheduleStore((s) => s.addEntry)
  const deleteEntry     = useScheduleStore((s) => s.deleteEntry)
  const toggleCompletion = useScheduleStore((s) => s.toggleCompletion)
  const getEntriesForDay = useScheduleStore((s) => s.getEntriesForDay)
  const isCompleted      = useScheduleStore((s) => s.isCompleted)
  const getWeekDates     = useScheduleStore((s) => s.getWeekDates)
  const getDateForDay    = useScheduleStore((s) => s.getDateForDay)
  const prevWeek         = useScheduleStore((s) => s.prevWeek)
  const nextWeek         = useScheduleStore((s) => s.nextWeek)
  const resetToCurrentWeek = useScheduleStore((s) => s.resetToCurrentWeek)
  const isCurrentWeek   = useScheduleStore((s) => s.isCurrentWeek)
  const isPastWeek      = useScheduleStore((s) => s.isPastWeek)

  const [showForm, setShowForm] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerValue, setDatePickerValue] = useState('')
  const [selectedDay, setSelectedDay] = useState<WeekDay>(new Date().getDay() as WeekDay)

  const today = new Date().getDay() as WeekDay
  const weekDates = getWeekDates()
  const dayEntries = getEntriesForDay(selectedDay)

  // Para o dia selecionado, a data real na semana visualizada
  const selectedDayDate = getDateForDay(selectedDay)
  // Mostrar toggle de conclusão apenas se for hoje E semana atual
  const isSelectedDayToday = isCurrentWeek() && selectedDay === today
  // Semana passada: somente leitura (não editar, não adicionar)
  const readOnly = isPastWeek()

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text" style={{ letterSpacing: '-0.03em' }}>
            Cronograma
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Planeje sua semana de estudos
          </p>
        </div>
        {!readOnly && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus size={15} />
            Nova entrada
          </Button>
        )}
      </div>

      {/* Navegação por semana */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={prevWeek}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-1 text-text-subtle hover:text-text transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-text">{formatWeekRange(weekDates)}</span>
          {readOnly && (
            <span className="ml-2 rounded-full bg-text-subtle/15 px-2 py-0.5 text-[10px] font-medium text-text-subtle">
              somente leitura
            </span>
          )}
          {weekOffset > 0 && (
            <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
              semana futura
            </span>
          )}
        </div>

        <button
          onClick={nextWeek}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-1 text-text-subtle hover:text-text transition-colors"
        >
          <ChevronRight size={16} />
        </button>

        {!isCurrentWeek() && (
          <button
            onClick={resetToCurrentWeek}
            className="rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-xs font-medium text-text-subtle hover:text-text transition-colors"
          >
            Hoje
          </button>
        )}

        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-1 text-text-subtle hover:text-text transition-colors"
          title="Ir para data"
        >
          <Calendar size={15} />
        </button>
      </div>

      {/* Date picker inline */}
      {showDatePicker && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface-1 p-3">
          <input
            type="date"
            value={datePickerValue}
            onChange={(e) => setDatePickerValue(e.target.value)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-text focus:border-accent/60 focus:outline-none"
          />
          <Button
            size="sm"
            variant="primary"
            disabled={!datePickerValue}
            onClick={() => {
              if (datePickerValue) {
                useScheduleStore.getState().goToDate(datePickerValue)
                setShowDatePicker(false)
                setDatePickerValue('')
              }
            }}
          >
            Ir
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowDatePicker(false)}>
            Cancelar
          </Button>
        </div>
      )}

      {/* Seletor de dia */}
      <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
        {ORDERED_DAYS.map((d) => {
          const count = getEntriesForDay(d).length
          const dayDate = formatDayDate(weekDates, d)
          const isToday = isCurrentWeek() && d === today
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={cn(
                'flex min-w-[64px] flex-col items-center rounded-xl px-2 py-2.5 text-sm transition-colors',
                selectedDay === d
                  ? 'bg-accent text-white'
                  : isToday
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'bg-surface-1 text-text-subtle border border-border hover:text-text'
              )}
            >
              <span className="text-xs font-medium">{WEEK_DAYS_SHORT[d]}</span>
              <span className={cn('text-[10px] tabular-nums', selectedDay === d ? 'text-white/70' : 'text-text-subtle/60')}>
                {dayDate}
              </span>
              {count > 0 && (
                <span className={cn('mt-0.5 text-[10px] tabular-nums', selectedDay === d ? 'text-white/70' : 'text-text-subtle')}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Conteúdo do dia */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={16} className="text-text-subtle" />
          <h2 className="text-sm font-semibold text-text">
            {WEEK_DAYS_FULL[selectedDay]}
            {isSelectedDayToday && (
              <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">Hoje</span>
            )}
          </h2>
        </div>

        {dayEntries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-surface-1 py-16 text-center">
            <CalendarDays size={36} strokeWidth={1.2} className="text-text-subtle" />
            <p className="text-sm text-text-muted">Nenhuma matéria planejada</p>
            {!readOnly && (
              <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
                <Plus size={13} /> Adicionar
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {dayEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                done={isCompleted(entry.id, selectedDayDate)}
                showToggle={isSelectedDayToday}
                readOnly={readOnly}
                onToggle={() => toggleCompletion(entry.id)}
                onDelete={() => deleteEntry(entry.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Visão geral semanal */}
      {Object.keys(entries).length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-semibold text-text-muted">Visão geral da semana</h2>
          <div className="grid grid-cols-7 gap-1">
            {ORDERED_DAYS.map((d) => {
              const dayE = getEntriesForDay(d)
              const isToday = isCurrentWeek() && d === today
              const dDate = formatDayDate(weekDates, d).split('/')[0] // só o dia
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={cn(
                    'rounded-lg p-2 text-center transition-colors',
                    selectedDay === d ? 'bg-accent/15' : 'hover:bg-surface-1'
                  )}
                >
                  <p className={cn('mb-0.5 text-[10px] font-medium', isToday ? 'text-accent' : 'text-text-subtle')}>
                    {WEEK_DAYS_SHORT[d]}
                  </p>
                  <p className="mb-1 text-[9px] text-text-subtle/60">{dDate}</p>
                  <div className="flex flex-col gap-0.5">
                    {dayE.slice(0, 4).map((e) => (
                      <div key={e.id} className="h-1.5 w-full rounded-full" style={{ background: e.color }} />
                    ))}
                    {dayE.length > 4 && <p className="text-[9px] text-text-subtle">+{dayE.length - 4}</p>}
                    {dayE.length === 0 && <div className="h-1.5 w-full rounded-full bg-surface-3" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <ScheduleEntryForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={addEntry}
        initial={{ dayOfWeek: selectedDay }}
      />
    </div>
  )
}

function EntryCard({
  entry, done, showToggle, readOnly, onToggle, onDelete,
}: {
  entry: ScheduleEntry
  done: boolean
  showToggle: boolean
  readOnly: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-4 transition-opacity',
        done ? 'border-border/40 opacity-60' : 'border-border/60 bg-surface-1'
      )}
    >
      <div className="h-10 w-1 flex-shrink-0 rounded-full" style={{ background: entry.color }} />

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium text-text truncate', done && 'line-through text-text-muted')}>
          {entry.subject}
        </p>
        <p className="mt-0.5 text-xs text-text-subtle">
          {formatTime(entry.startHour, entry.startMinute)} · {formatDuration(entry.durationMinutes)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {showToggle && (
          <button onClick={onToggle} className="text-text-subtle hover:text-text transition-colors">
            {done
              ? <CheckCircle size={18} className="text-emerald-400" />
              : <Circle size={18} />
            }
          </button>
        )}
        {/* Ícone de conclusão somente leitura para semanas passadas */}
        {readOnly && done && (
          <CheckCircle size={16} className="text-emerald-400/50" />
        )}
        {!readOnly && (
          <button
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-subtle hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
