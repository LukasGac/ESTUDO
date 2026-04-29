import { create } from 'zustand'
import { AmbientSound, DinoEntry, DinoType, DINO_HABITAT, getDinoSize } from '@/types'
import { getDinos, saveDinos } from '@/lib/storage'
import { generateId } from '@/lib/utils'
import { startAmbientSound, stopAmbientSound, setAmbientVolume } from '@/lib/audio'

interface FocusStore {
  dinos: DinoEntry[]

  // Sessão ativa (transient)
  isActive: boolean
  sessionStartMs: number
  sessionDurationMs: number
  dinoType: DinoType
  isKilled: boolean

  // Configurações do usuário
  defaultDurationMinutes: number
  defaultDinoType: DinoType
  ambientSound: AmbientSound
  ambientVolume: number

  // Actions
  startSession: (durationMinutes: number, dinoType: DinoType) => void
  killSession: () => void
  completeSession: () => void
  setDefaultDuration: (m: number) => void
  setDefaultDinoType: (t: DinoType) => void
  setAmbientSound: (s: AmbientSound) => void
  setAmbientVolume: (v: number) => void

  // Computed
  getProgress: () => number  // 0 a 1
  getTimeLeft: () => number  // segundos
}

export const useFocusStore = create<FocusStore>((set, get) => ({
  dinos: getDinos(),

  isActive: false,
  sessionStartMs: 0,
  sessionDurationMs: 0,
  dinoType: 't-rex',
  isKilled: false,

  defaultDurationMinutes: 25,
  defaultDinoType: 't-rex',
  ambientSound: 'none',
  ambientVolume: 0.3,

  startSession(durationMinutes, dinoType) {
    const { ambientSound, ambientVolume } = get()
    if (ambientSound !== 'none') startAmbientSound(ambientSound, ambientVolume)

    set({
      isActive: true,
      sessionStartMs: Date.now(),
      sessionDurationMs: durationMinutes * 60 * 1000,
      dinoType,
      isKilled: false,
    })
  },

  killSession() {
    stopAmbientSound()
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    set({ isActive: false, isKilled: true })
  },

  completeSession() {
    stopAmbientSound()
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    const { dinoType, sessionDurationMs, dinos } = get()
    const durationMinutes = Math.round(sessionDurationMs / 60_000)

    const dino: DinoEntry = {
      id: generateId(),
      type: dinoType,
      size: getDinoSize(durationMinutes),
      habitat: DINO_HABITAT[dinoType],
      grownAt: new Date().toISOString(),
      durationMinutes,
    }
    const newDinos = [...dinos, dino]
    saveDinos(newDinos)
    set({ isActive: false, isKilled: false, dinos: newDinos })
  },

  setDefaultDuration(m) {
    set({ defaultDurationMinutes: Math.max(5, Math.min(120, m)) })
  },

  setDefaultDinoType(t) {
    set({ defaultDinoType: t })
  },

  setAmbientSound(s) {
    const { isActive, ambientVolume } = get()
    if (s === 'none') {
      stopAmbientSound()
    } else if (isActive) {
      startAmbientSound(s, ambientVolume)
    }
    set({ ambientSound: s })
  },

  setAmbientVolume(v) {
    setAmbientVolume(v)
    set({ ambientVolume: v })
  },

  getProgress() {
    const { isActive, sessionStartMs, sessionDurationMs } = get()
    if (!isActive || sessionDurationMs === 0) return 0
    const elapsed = Date.now() - sessionStartMs
    return Math.min(1, elapsed / sessionDurationMs)
  },

  getTimeLeft() {
    const { isActive, sessionStartMs, sessionDurationMs } = get()
    if (!isActive) return 0
    const elapsed = Date.now() - sessionStartMs
    return Math.max(0, Math.round((sessionDurationMs - elapsed) / 1000))
  },
}))
