import { create } from 'zustand'
import { PomodoroMode, PomodoroSettings, PomodoroStateData } from '@/types'
import { getPomodoroState, getActiveUserId, savePomodoroState } from '@/lib/storage'
import { fetchPomodoroState } from '@/lib/db'
import { getTodayKey } from '@/lib/streak'
import { playNotificationChime } from '@/lib/audio'

function modeSeconds(mode: PomodoroMode, settings: PomodoroSettings): number {
  if (mode === 'focus') return settings.focusDuration * 60
  if (mode === 'short-break') return settings.shortBreakDuration * 60
  return settings.longBreakDuration * 60
}

function nextMode(
  current: PomodoroMode,
  cyclesSinceLongBreak: number,
  settings: PomodoroSettings
): PomodoroMode {
  if (current !== 'focus') return 'focus'
  return (cyclesSinceLongBreak + 1) % settings.cyclesBeforeLongBreak === 0
    ? 'long-break'
    : 'short-break'
}

interface PomodoroStore {
  // Persistent
  settings: PomodoroSettings
  cyclesCompletedToday: number
  lastCycleDate: string | null

  // Transient session state
  mode: PomodoroMode
  timeLeft: number
  isRunning: boolean
  cyclesSinceLongBreak: number
  isExpanded: boolean

  // Actions
  hydrate: () => void
  resetStore: () => void
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  tick: () => void
  updateSettings: (s: Partial<PomodoroSettings>) => void
  toggleExpanded: () => void
}

function loadPersisted(): Pick<PomodoroStore, 'settings' | 'cyclesCompletedToday' | 'lastCycleDate'> {
  const stored = getPomodoroState()
  // Se for um novo dia, zera ciclos
  const today = getTodayKey()
  const cycles = stored.lastCycleDate === today ? stored.cyclesCompletedToday : 0
  return {
    settings: stored.settings,
    cyclesCompletedToday: cycles,
    lastCycleDate: stored.lastCycleDate,
  }
}

const initial = loadPersisted()

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  ...initial,
  mode: 'focus',
  timeLeft: initial.settings.focusDuration * 60,
  isRunning: false,
  cyclesSinceLongBreak: 0,
  isExpanded: false,

  hydrate() {
    const local = loadPersisted()
    set({ ...local, timeLeft: local.settings.focusDuration * 60 })

    const userId = getActiveUserId()
    if (userId === 'default') return
    fetchPomodoroState(userId)
      .then((remote) => {
        if (!remote) return
        const today = getTodayKey()
        const cycles = remote.lastCycleDate === today ? remote.cyclesCompletedToday : 0
        localStorage.setItem(`anki_pomodoro_${userId}`, JSON.stringify(remote))
        set({
          settings: remote.settings,
          cyclesCompletedToday: cycles,
          lastCycleDate: remote.lastCycleDate,
          timeLeft: remote.settings.focusDuration * 60,
        })
      })
      .catch(console.error)
  },

  resetStore() {
    const defaults = loadPersisted()
    set({
      ...defaults,
      mode: 'focus',
      timeLeft: defaults.settings.focusDuration * 60,
      isRunning: false,
      cyclesSinceLongBreak: 0,
      isExpanded: false,
    })
  },

  start() {
    set({ isRunning: true })
  },

  pause() {
    set({ isRunning: false })
  },

  reset() {
    const { mode, settings } = get()
    set({ timeLeft: modeSeconds(mode, settings), isRunning: false })
  },

  skip() {
    const { mode, settings, cyclesSinceLongBreak } = get()
    const next = nextMode(mode, cyclesSinceLongBreak, settings)
    const newCycleSince = mode === 'focus'
      ? (cyclesSinceLongBreak + 1) % settings.cyclesBeforeLongBreak
      : cyclesSinceLongBreak
    set({
      mode: next,
      timeLeft: modeSeconds(next, settings),
      isRunning: false,
      cyclesSinceLongBreak: newCycleSince,
    })
  },

  tick() {
    const { timeLeft, isRunning, mode, settings, cyclesSinceLongBreak, cyclesCompletedToday } = get()
    if (!isRunning || timeLeft <= 0) return

    const newTimeLeft = timeLeft - 1

    if (newTimeLeft <= 0) {
      playNotificationChime()

      const today = getTodayKey()
      const newCyclesTotal = mode === 'focus' ? cyclesCompletedToday + 1 : cyclesCompletedToday
      const newCycleSince = mode === 'focus'
        ? (cyclesSinceLongBreak + 1) % settings.cyclesBeforeLongBreak
        : cyclesSinceLongBreak
      const next = nextMode(mode, cyclesSinceLongBreak, settings)

      const newState: PomodoroStateData = {
        settings,
        cyclesCompletedToday: newCyclesTotal,
        lastCycleDate: today,
      }
      savePomodoroState(newState)

      set({
        mode: next,
        timeLeft: modeSeconds(next, settings),
        isRunning: false,
        cyclesCompletedToday: newCyclesTotal,
        lastCycleDate: today,
        cyclesSinceLongBreak: newCycleSince,
        isExpanded: true,
      })
    } else {
      set({ timeLeft: newTimeLeft })
    }
  },

  updateSettings(partial) {
    const { settings, mode } = get()
    const newSettings = { ...settings, ...partial }
    const newTimeLeft = modeSeconds(mode, newSettings)
    const newState: PomodoroStateData = {
      settings: newSettings,
      cyclesCompletedToday: get().cyclesCompletedToday,
      lastCycleDate: get().lastCycleDate,
    }
    savePomodoroState(newState)
    set({ settings: newSettings, timeLeft: newTimeLeft, isRunning: false })
  },

  toggleExpanded() {
    set((s) => ({ isExpanded: !s.isExpanded }))
  },
}))
