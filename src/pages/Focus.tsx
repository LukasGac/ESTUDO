import { useEffect, useState, useCallback } from 'react'
import { useBlocker } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, AlertTriangle, Maximize } from 'lucide-react'
import { useFocusStore } from '@/store/focusStore'
import { FocusDino, SIZE_LABELS } from '@/components/focus/FocusDino'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { DinoType, DinoSize, DinoEntry, AmbientSound, DINO_HABITAT, getDinoSize } from '@/types'

const SIZE_ORDER: DinoSize[] = ['baby', 'young', 'adult', 'elder']

function getEvolutionDisplay(sessionProgress: number, targetSize: DinoSize): {
  currentSize: DinoSize
  dinoProgress: number
  stageName: string
} {
  const targetIdx = SIZE_ORDER.indexOf(targetSize)
  const numStages = targetIdx + 2 // egg + all sizes up to target
  const stageWidth = 1 / numStages
  const stageIdx = Math.min(Math.floor(sessionProgress / stageWidth), numStages - 1)
  if (stageIdx === 0) {
    return { currentSize: 'baby', dinoProgress: 0, stageName: 'Ovo' }
  }
  const sizeIdx = Math.min(stageIdx - 1, targetIdx)
  return { currentSize: SIZE_ORDER[sizeIdx], dinoProgress: 1, stageName: SIZE_LABELS[SIZE_ORDER[sizeIdx]] }
}

const DINO_TYPES: { type: DinoType; label: string; emoji: string; habitat: string }[] = [
  { type: 't-rex',         label: 'T-Rex',         emoji: '🦖', habitat: 'Vulcão' },
  { type: 'triceratops',   label: 'Triceratops',   emoji: '🦕', habitat: 'Floresta' },
  { type: 'pterodactyl',   label: 'Pterodáctilo',  emoji: '🦅', habitat: 'Céu' },
  { type: 'brachiosaurus', label: 'Braquiossauro', emoji: '🦒', habitat: 'Savana' },
]

const AMBIENT_OPTIONS: { value: AmbientSound; label: string; icon: string }[] = [
  { value: 'none',   label: 'Silêncio', icon: '🔇' },
  { value: 'rain',   label: 'Chuva',    icon: '🌧️' },
  { value: 'forest', label: 'Floresta', icon: '🌲' },
  { value: 'cafe',   label: 'Café',     icon: '☕' },
]

const DURATIONS = [5, 15, 30, 45, 60, 75, 90]

const HABITAT_GRADIENTS: Record<string, string> = {
  volcano: 'from-red-950 via-orange-900 to-gray-900',
  forest:  'from-green-950 via-emerald-900 to-gray-900',
  sky:     'from-blue-900 via-sky-700 to-blue-950',
  savanna: 'from-yellow-900 via-amber-800 to-orange-950',
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function Focus() {
  const isActive   = useFocusStore((s) => s.isActive)
  const isKilled   = useFocusStore((s) => s.isKilled)
  const dinos      = useFocusStore((s) => s.dinos)
  const dinoType   = useFocusStore((s) => s.dinoType)
  const defaultDurationMinutes = useFocusStore((s) => s.defaultDurationMinutes)
  const defaultDinoType        = useFocusStore((s) => s.defaultDinoType)
  const ambientSound  = useFocusStore((s) => s.ambientSound)
  const ambientVolume = useFocusStore((s) => s.ambientVolume)
  const startSession      = useFocusStore((s) => s.startSession)
  const killSession       = useFocusStore((s) => s.killSession)
  const completeSession   = useFocusStore((s) => s.completeSession)
  const setDefaultDuration   = useFocusStore((s) => s.setDefaultDuration)
  const setDefaultDinoType   = useFocusStore((s) => s.setDefaultDinoType)
  const setAmbientSound      = useFocusStore((s) => s.setAmbientSound)
  const setAmbientVolume     = useFocusStore((s) => s.setAmbientVolume)
  const sessionDurationMs = useFocusStore((s) => s.sessionDurationMs)
  const getProgress = useFocusStore((s) => s.getProgress)
  const getTimeLeft = useFocusStore((s) => s.getTimeLeft)

  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showKilledBanner, setShowKilledBanner] = useState(false)
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false)
  const [view, setView] = useState<'focus' | 'world'>('focus')

  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => {
      const p = getProgress()
      const t = getTimeLeft()
      setProgress(p)
      setTimeLeft(t)
      if (t <= 0) {
        clearInterval(id)
        completeSession()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [isActive, getProgress, getTimeLeft, completeSession])

  useEffect(() => {
    if (isActive) {
      setProgress(0)
      setTimeLeft(defaultDurationMinutes * 60)
    }
  }, [isActive, defaultDurationMinutes])

  useEffect(() => {
    if (!isActive) return
    const handleVisibility = () => {
      if (document.hidden) killSession()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isActive, killSession])

  useEffect(() => {
    if (isActive) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [isActive])

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && isActive) {
        setShowFullscreenWarning(true)
      }
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [isActive])

  useEffect(() => {
    if (isKilled) {
      setShowKilledBanner(true)
      const t = setTimeout(() => setShowKilledBanner(false), 5000)
      return () => clearTimeout(t)
    }
  }, [isKilled])

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }: { currentLocation: { pathname: string }; nextLocation: { pathname: string } }) =>
        isActive && currentLocation.pathname !== nextLocation.pathname,
      [isActive]
    )
  )

  return (
    <div className="animate-fade-up">
      {/* Alerta de navegação bloqueada */}
      <AnimatePresence>
        {blocker.state === 'blocked' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed inset-x-0 top-16 z-50 mx-auto max-w-sm px-4"
          >
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="mt-0.5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-300">Sessão em andamento</p>
                  <p className="mt-0.5 text-xs text-amber-400/70">Sair irá matar seu dinossauro. Tem certeza?</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="danger" onClick={() => { killSession(); blocker.proceed?.() }}>
                      Abandonar
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => blocker.reset?.()}>
                      Continuar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner de dino morto */}
      <AnimatePresence>
        {showKilledBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 rounded-xl border border-red-500/30 bg-red-500/8 p-4 text-center"
          >
            <p className="text-sm font-medium text-red-400">💀 Seu dinossauro morreu — você saiu da aba durante a sessão.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aviso de fullscreen */}
      <AnimatePresence>
        {showFullscreenWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <div className="mx-4 max-w-sm rounded-2xl border border-amber-500/30 bg-surface-1 p-6 text-center">
              <Maximize size={32} className="mx-auto mb-3 text-amber-400" />
              <h3 className="text-base font-semibold text-text">Saiu da tela cheia</h3>
              <p className="mt-2 text-sm text-text-muted">
                O Modo Foco funciona melhor em tela cheia. Volte para proteger seu dinossauro.
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    document.documentElement.requestFullscreen().catch(() => {})
                    setShowFullscreenWarning(false)
                  }}
                >
                  Voltar ao foco
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => { setShowFullscreenWarning(false); killSession() }}
                >
                  Abandonar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header com tabs */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text" style={{ letterSpacing: '-0.03em' }}>
            Modo Foco
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">
            {dinos.length} {dinos.length === 1 ? 'dinossauro' : 'dinossauros'} no Mundo Jurássico
          </p>
        </div>
        <div className="flex items-center rounded-xl border border-border bg-surface-1 p-1 gap-1">
          <button
            onClick={() => setView('focus')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              view === 'focus' ? 'bg-accent/15 text-accent' : 'text-text-subtle hover:text-text'
            )}
          >
            Sessão
          </button>
          <button
            onClick={() => setView('world')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              view === 'world' ? 'bg-accent/15 text-accent' : 'text-text-subtle hover:text-text'
            )}
          >
            Mundo Jurássico
          </button>
        </div>
      </div>

      {view === 'world' ? (
        <WorldView dinos={dinos} />
      ) : isActive ? (
        <ActiveSession
          progress={progress}
          timeLeft={timeLeft}
          dinoType={dinoType}
          durationMinutes={Math.round(sessionDurationMs / 60000)}
          onAbandon={killSession}
          ambientSound={ambientSound}
          ambientVolume={ambientVolume}
          onAmbientToggle={setAmbientSound}
          onVolumeChange={setAmbientVolume}
        />
      ) : (
        <SetupView
          duration={defaultDurationMinutes}
          dinoType={defaultDinoType}
          ambientSound={ambientSound}
          ambientVolume={ambientVolume}
          onDurationChange={setDefaultDuration}
          onDinoTypeChange={setDefaultDinoType}
          onAmbientChange={setAmbientSound}
          onVolumeChange={setAmbientVolume}
          onStart={() => startSession(defaultDurationMinutes, defaultDinoType)}
          lastDino={dinos[dinos.length - 1]}
        />
      )}
    </div>
  )
}

// ── Configuração ──────────────────────────────────────────────────────────────

function SetupView({
  duration, dinoType, ambientSound, ambientVolume,
  onDurationChange, onDinoTypeChange, onAmbientChange, onVolumeChange, onStart, lastDino,
}: {
  duration: number; dinoType: DinoType; ambientSound: AmbientSound; ambientVolume: number
  onDurationChange: (n: number) => void; onDinoTypeChange: (t: DinoType) => void
  onAmbientChange: (s: AmbientSound) => void; onVolumeChange: (v: number) => void
  onStart: () => void; lastDino?: DinoEntry
}) {
  const previewSize = getDinoSize(duration)
  const habitat = DINO_HABITAT[dinoType]

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Preview do dino no habitat */}
      <div className={cn(
        'flex flex-col items-center rounded-2xl bg-gradient-to-b py-10 border border-white/5',
        HABITAT_GRADIENTS[habitat]
      )}>
        <FocusDino type={dinoType} size={previewSize} progress={1} />
        <p className="mt-4 text-xs text-white/50">
          {SIZE_LABELS[previewSize]} · {DINO_TYPES.find(d => d.type === dinoType)?.habitat}
        </p>
      </div>

      {/* Tipo de dinossauro */}
      <div>
        <label className="mb-2 block text-xs font-medium text-text-muted">Dinossauro</label>
        <div className="grid grid-cols-4 gap-2">
          {DINO_TYPES.map(({ type, label, emoji, habitat: h }) => (
            <button
              key={type}
              onClick={() => onDinoTypeChange(type)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border py-3 text-xs font-medium transition-colors',
                dinoType === type
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border bg-surface-1 text-text-subtle hover:text-text'
              )}
            >
              <span className="text-xl leading-none">{emoji}</span>
              <span>{label}</span>
              <span className={cn('text-[10px]', dinoType === type ? 'text-accent/70' : 'text-text-subtle/70')}>
                {h}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Duração */}
      <div>
        <label className="mb-2 block text-xs font-medium text-text-muted">Duração</label>
        <div className="flex gap-1.5">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => onDurationChange(d)}
              className={cn(
                'flex-1 rounded-lg border py-2 text-xs font-medium transition-colors',
                duration === d
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border bg-surface-1 text-text-subtle hover:text-text'
              )}
            >
              {d}min
            </button>
          ))}
        </div>
      </div>

      {/* Som ambiente */}
      <div>
        <label className="mb-2 block text-xs font-medium text-text-muted">Som ambiente</label>
        <div className="grid grid-cols-4 gap-2">
          {AMBIENT_OPTIONS.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => onAmbientChange(value)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border py-2.5 text-xs font-medium transition-colors',
                ambientSound === value
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-border bg-surface-1 text-text-subtle hover:text-text'
              )}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </button>
          ))}
        </div>
        {ambientSound !== 'none' && (
          <div className="mt-3 flex items-center gap-3">
            <VolumeX size={14} className="text-text-subtle flex-shrink-0" />
            <input
              type="range" min={0} max={1} step={0.05}
              value={ambientVolume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="flex-1"
            />
            <Volume2 size={14} className="text-text-subtle flex-shrink-0" />
            <span className="text-xs text-text-subtle w-8 text-right">{Math.round(ambientVolume * 100)}%</span>
          </div>
        )}
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={onStart}>
        🦕 Começar sessão — {duration}min de foco
      </Button>

      {lastDino && (
        <p className="text-center text-xs text-text-subtle">
          Última sessão: {lastDino.durationMinutes}min · {SIZE_LABELS[lastDino.size]} em {formatDate(lastDino.grownAt)}
        </p>
      )}
    </div>
  )
}

// ── Sessão ativa ──────────────────────────────────────────────────────────────

function ActiveSession({
  progress, timeLeft, dinoType, durationMinutes, onAbandon,
  ambientSound, ambientVolume, onAmbientToggle, onVolumeChange,
}: {
  progress: number; timeLeft: number; dinoType: DinoType; durationMinutes: number; onAbandon: () => void
  ambientSound: AmbientSound; ambientVolume: number
  onAmbientToggle: (s: AmbientSound) => void; onVolumeChange: (v: number) => void
}) {
  const pct = Math.round(progress * 100)
  const habitat = DINO_HABITAT[dinoType]
  const targetSize = getDinoSize(durationMinutes)
  const { currentSize, dinoProgress, stageName } = getEvolutionDisplay(progress, targetSize)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'mx-auto flex max-w-md flex-col items-center gap-8 rounded-2xl p-8 bg-gradient-to-b border border-white/5',
        HABITAT_GRADIENTS[habitat]
      )}
    >
      {/* Dino nascendo/crescendo */}
      <div className="relative flex flex-col items-center">
        <FocusDino type={dinoType} size={currentSize} progress={dinoProgress} />
        <div className="mt-3 h-px w-48 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Timer */}
      <div className="text-center">
        <p className="text-5xl font-bold tabular-nums text-white" style={{ letterSpacing: '-0.04em' }}>
          {formatTime(timeLeft)}
        </p>
        <p className="mt-2 text-sm text-white/50">
          {stageName} · {pct}% completo
        </p>
      </div>

      {/* Barra de progresso */}
      <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-white/60"
          style={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      {/* Som ambiente */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onAmbientToggle(ambientSound === 'none' ? 'rain' : 'none')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
            ambientSound !== 'none'
              ? 'border-white/20 bg-white/10 text-white'
              : 'border-white/10 text-white/40 hover:text-white/70'
          )}
        >
          {ambientSound !== 'none' ? <Volume2 size={13} /> : <VolumeX size={13} />}
          {AMBIENT_OPTIONS.find(o => o.value === ambientSound)?.label ?? 'Silêncio'}
        </button>
        {ambientSound !== 'none' && (
          <input
            type="range" min={0} max={1} step={0.05}
            value={ambientVolume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-20"
          />
        )}
      </div>

      <button
        onClick={onAbandon}
        className="text-xs text-white/30 hover:text-red-400 transition-colors underline underline-offset-2"
      >
        Abandonar sessão (o dinossauro morrerá)
      </button>
    </motion.div>
  )
}

// ── Mundo Jurássico ───────────────────────────────────────────────────────────

function WorldView({ dinos }: { dinos: DinoEntry[] }) {
  if (dinos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-surface-1 py-20 text-center">
        <div className="opacity-20">
          <FocusDino type="t-rex" size="adult" progress={1} animate />
        </div>
        <div>
          <p className="text-sm font-medium text-text">Seu Mundo Jurássico está vazio</p>
          <p className="mt-1 text-xs text-text-muted">Complete uma sessão de foco para criar seu primeiro dinossauro</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm text-text-muted">
        {dinos.length} {dinos.length === 1 ? 'dinossauro' : 'dinossauros'} descobertos
      </p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {[...dinos].reverse().map((dino) => {
          const gradient = HABITAT_GRADIENTS[dino.habitat]
          const info = DINO_TYPES.find(d => d.type === dino.type)
          return (
            <div
              key={dino.id}
              className={cn(
                'group relative flex flex-col items-center rounded-xl bg-gradient-to-b p-4 border border-white/5 overflow-hidden',
                gradient
              )}
            >
              <FocusDino
                type={dino.type}
                size={dino.size}
                progress={1}
                animate
              />
              <div className="mt-2 text-center">
                <p className="text-[10px] font-medium text-white/70">{SIZE_LABELS[dino.size]}</p>
                <p className="text-[10px] text-white/40">{dino.durationMinutes}min</p>
              </div>
              {/* Tooltip */}
              <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-surface-2 px-2 py-1 text-[10px] text-text-muted opacity-0 transition-opacity group-hover:opacity-100 border border-border shadow-lg z-10">
                {info?.label} · {formatDate(dino.grownAt)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
