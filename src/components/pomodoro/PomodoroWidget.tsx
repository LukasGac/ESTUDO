import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, SkipForward, RotateCcw, Settings, X, Coffee, Zap } from 'lucide-react'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { cn } from '@/lib/utils'
import { PomodoroMode } from '@/types'

const MODE_LABELS: Record<PomodoroMode, string> = {
  'focus': 'Foco',
  'short-break': 'Pausa curta',
  'long-break': 'Pausa longa',
}

const MODE_COLORS: Record<PomodoroMode, string> = {
  'focus': 'text-accent',
  'short-break': 'text-emerald-400',
  'long-break': 'text-violet-400',
}

const MODE_BG: Record<PomodoroMode, string> = {
  'focus': 'border-accent/30 bg-accent/5',
  'short-break': 'border-emerald-500/30 bg-emerald-500/5',
  'long-break': 'border-violet-500/30 bg-violet-500/5',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function PomodoroWidget() {
  const mode = usePomodoroStore((s) => s.mode)
  const timeLeft = usePomodoroStore((s) => s.timeLeft)
  const isRunning = usePomodoroStore((s) => s.isRunning)
  const isExpanded = usePomodoroStore((s) => s.isExpanded)
  const settings = usePomodoroStore((s) => s.settings)
  const cyclesCompletedToday = usePomodoroStore((s) => s.cyclesCompletedToday)
  const cyclesSinceLongBreak = usePomodoroStore((s) => s.cyclesSinceLongBreak)
  const start = usePomodoroStore((s) => s.start)
  const pause = usePomodoroStore((s) => s.pause)
  const reset = usePomodoroStore((s) => s.reset)
  const skip = usePomodoroStore((s) => s.skip)
  const tick = usePomodoroStore((s) => s.tick)
  const toggleExpanded = usePomodoroStore((s) => s.toggleExpanded)
  const updateSettings = usePomodoroStore((s) => s.updateSettings)

  const [showSettings, setShowSettings] = useState(false)

  // Interval do timer
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => usePomodoroStore.getState().tick(), 1000)
    return () => clearInterval(id)
  }, [isRunning, tick])

  const totalSeconds = mode === 'focus'
    ? settings.focusDuration * 60
    : mode === 'short-break'
    ? settings.shortBreakDuration * 60
    : settings.longBreakDuration * 60

  const progress = 1 - timeLeft / totalSeconds
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'w-72 rounded-2xl border bg-surface-1 p-5 shadow-2xl',
              MODE_BG[mode]
            )}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <span className={cn('text-xs font-semibold uppercase tracking-wider', MODE_COLORS[mode])}>
                {MODE_LABELS[mode]}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSettings((v) => !v)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-text-subtle hover:bg-surface-2 hover:text-text transition-colors"
                >
                  <Settings size={13} />
                </button>
                <button
                  onClick={toggleExpanded}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-text-subtle hover:bg-surface-2 hover:text-text transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {showSettings ? (
              <SettingsPanel settings={settings} onUpdate={updateSettings} onClose={() => setShowSettings(false)} />
            ) : (
              <>
                {/* Timer display */}
                <div className="mb-5 flex flex-col items-center gap-3">
                  <div className="relative">
                    <svg width="88" height="88" className="-rotate-90">
                      <circle cx="44" cy="44" r="38" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-3" />
                      <circle
                        cx="44" cy="44" r="38"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className={MODE_COLORS[mode]}
                        strokeDasharray={`${2 * Math.PI * 38}`}
                        strokeDashoffset={`${2 * Math.PI * 38 * (1 - progress)}`}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold tabular-nums text-text" style={{ letterSpacing: '-0.03em' }}>
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>

                  {/* Ciclos */}
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: settings.cyclesBeforeLongBreak }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1.5 w-1.5 rounded-full transition-colors',
                          i < cyclesSinceLongBreak ? 'bg-accent' : 'bg-surface-3'
                        )}
                      />
                    ))}
                    <span className="ml-1 text-xs text-text-subtle tabular-nums">
                      {cyclesCompletedToday} hoje
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={reset}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-surface-2 hover:text-text transition-colors"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={isRunning ? pause : start}
                    className={cn(
                      'flex h-10 w-24 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-colors',
                      isRunning
                        ? 'bg-surface-2 text-text hover:bg-surface-3'
                        : 'bg-accent text-white hover:bg-accent-hover'
                    )}
                  >
                    {isRunning ? <><Pause size={14} /> Pausar</> : <><Play size={14} /> Iniciar</>}
                  </button>
                  <button
                    onClick={skip}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-surface-2 hover:text-text transition-colors"
                  >
                    <SkipForward size={14} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={toggleExpanded}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'flex h-14 w-14 flex-col items-center justify-center rounded-2xl border shadow-xl transition-colors',
          isRunning
            ? 'border-accent/40 bg-accent/10 text-accent'
            : 'border-border bg-surface-1 text-text-muted hover:text-text'
        )}
      >
        {mode === 'focus'
          ? <Zap size={18} />
          : <Coffee size={18} />
        }
        <span className="mt-0.5 text-[10px] tabular-nums font-semibold leading-none">
          {formatTime(timeLeft)}
        </span>
      </motion.button>
    </div>
  )
}

function SettingsPanel({
  settings,
  onUpdate,
  onClose,
}: {
  settings: ReturnType<typeof usePomodoroStore.getState>['settings']
  onUpdate: (s: Partial<typeof settings>) => void
  onClose: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-text-muted">Configurações</p>
      <SettingRow
        label="Foco"
        value={settings.focusDuration}
        min={5} max={90} step={5}
        onChange={(v) => onUpdate({ focusDuration: v })}
      />
      <SettingRow
        label="Pausa curta"
        value={settings.shortBreakDuration}
        min={1} max={30} step={1}
        onChange={(v) => onUpdate({ shortBreakDuration: v })}
      />
      <SettingRow
        label="Pausa longa"
        value={settings.longBreakDuration}
        min={5} max={60} step={5}
        onChange={(v) => onUpdate({ longBreakDuration: v })}
      />
      <SettingRow
        label="Ciclos p/ pausa longa"
        value={settings.cyclesBeforeLongBreak}
        min={2} max={8} step={1}
        onChange={(v) => onUpdate({ cyclesBeforeLongBreak: v })}
      />
      <button
        onClick={onClose}
        className="mt-2 w-full rounded-lg bg-surface-2 py-1.5 text-xs font-medium text-text-muted hover:text-text transition-colors"
      >
        Fechar
      </button>
    </div>
  )
}

function SettingRow({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-text-subtle">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-2 text-text-muted hover:text-text text-sm font-bold transition-colors"
        >
          −
        </button>
        <span className="w-8 text-center text-xs font-semibold tabular-nums text-text">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-2 text-text-muted hover:text-text text-sm font-bold transition-colors"
        >
          +
        </button>
      </div>
    </div>
  )
}
