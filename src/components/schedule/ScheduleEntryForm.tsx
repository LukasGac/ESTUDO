import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ScheduleEntry, WeekDay } from '@/types'
import { cn } from '@/lib/utils'

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#06b6d4', '#f97316',
]

const DURATIONS = [30, 60, 90, 120, 180, 240]

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 5h às 22h

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (entry: Omit<ScheduleEntry, 'id'>) => void
  initial?: Partial<ScheduleEntry>
  title?: string
}

export function ScheduleEntryForm({ open, onClose, onSubmit, initial, title = 'Nova entrada' }: Props) {
  const [subject, setSubject] = useState(initial?.subject ?? '')
  const [dayOfWeek, setDayOfWeek] = useState<WeekDay>(initial?.dayOfWeek ?? 1)
  const [startHour, setStartHour] = useState(initial?.startHour ?? 8)
  const [startMinute, setStartMinute] = useState<0 | 30>(initial?.startMinute ?? 0)
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 60)
  const [color, setColor] = useState(initial?.color ?? COLORS[0])

  function handleSubmit() {
    if (!subject.trim()) return
    onSubmit({ subject: subject.trim(), dayOfWeek, startHour, startMinute, durationMinutes, color })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        {/* Matéria */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Matéria</label>
          <input
            autoFocus
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Ex: Direito Constitucional"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-text-subtle focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
        </div>

        {/* Dia da semana */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Dia</label>
          <div className="flex gap-1">
            {WEEK_DAYS.map((d, i) => (
              <button
                key={i}
                onClick={() => setDayOfWeek(i as WeekDay)}
                className={cn(
                  'flex-1 rounded-md py-1.5 text-xs font-medium transition-colors',
                  dayOfWeek === i
                    ? 'bg-accent text-white'
                    : 'bg-surface-2 text-text-subtle hover:text-text'
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Horário */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Hora</label>
            <select
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}h</option>
              ))}
            </select>
          </div>
          <div className="w-28">
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Minuto</label>
            <select
              value={startMinute}
              onChange={(e) => setStartMinute(Number(e.target.value) as 0 | 30)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
            >
              <option value={0}>:00</option>
              <option value={30}>:30</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Duração</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text focus:border-accent/60 focus:outline-none"
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d >= 60 ? `${d / 60}h${d % 60 ? `${d % 60}m` : ''}` : `${d}min`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cor */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Cor</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  'h-6 w-6 rounded-full transition-transform',
                  color === c && 'ring-2 ring-offset-2 ring-offset-surface-1 ring-white/50 scale-110'
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" className="flex-1" onClick={handleSubmit} disabled={!subject.trim()}>
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
