import { create } from 'zustand'
import { ScheduleCompletion, ScheduleEntry, WeekDay } from '@/types'
import {
  getActiveUserId,
  getScheduleCompletions,
  getScheduleEntries,
  saveScheduleCompletions,
  saveScheduleEntries,
} from '@/lib/storage'
import {
  fetchScheduleEntries,
  fetchScheduleCompletions,
  upsertScheduleEntry,
  deleteScheduleEntryRemote,
  upsertScheduleCompletion,
  deleteScheduleCompletion,
} from '@/lib/db'
import { generateId } from '@/lib/utils'
import { getTodayKey } from '@/lib/streak'

// Retorna array de 7 datas (Mon..Sun) da semana ao offset informado.
// weekOffset=0 → semana atual, -1 → anterior, +1 → próxima
function computeWeekDates(weekOffset: number): Date[] {
  const today = new Date()
  const dow = today.getDay() // 0=Dom
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// WeekDay 0=Dom=índice 6, 1=Seg=índice 0, ... 6=Sáb=índice 5
function weekDayToIndex(dayOfWeek: WeekDay): number {
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1
}

interface ScheduleStore {
  entries: Record<string, ScheduleEntry>
  completions: ScheduleCompletion[]
  weekOffset: number  // 0=atual, -N=passado, +N=futuro

  hydrate: () => void
  reset: () => void

  addEntry: (input: Omit<ScheduleEntry, 'id'>) => void
  updateEntry: (id: string, updates: Partial<Omit<ScheduleEntry, 'id'>>) => void
  deleteEntry: (id: string) => void
  toggleCompletion: (entryId: string) => void

  prevWeek: () => void
  nextWeek: () => void
  resetToCurrentWeek: () => void
  goToDate: (dateString: string) => void

  getWeekDates: () => Date[]
  getDateForDay: (dayOfWeek: WeekDay) => string
  isCurrentWeek: () => boolean
  isPastWeek: () => boolean
  isFutureWeek: () => boolean

  getEntriesForDay: (day: WeekDay) => ScheduleEntry[]
  getTodayEntries: () => ScheduleEntry[]
  isCompleted: (entryId: string, date?: string) => boolean
  getTodayCompletionCount: () => number
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  entries: getScheduleEntries(),
  completions: getScheduleCompletions(),
  weekOffset: 0,

  hydrate() {
    set({ entries: getScheduleEntries(), completions: getScheduleCompletions() })

    const userId = getActiveUserId()
    if (userId === 'default') return
    Promise.all([fetchScheduleEntries(userId), fetchScheduleCompletions(userId)])
      .then(([remoteEntries, remoteCompletions]) => {
        if (Object.keys(remoteEntries).length > 0 || remoteCompletions.length > 0) {
          localStorage.setItem(`anki_schedule_entries_${userId}`, JSON.stringify(remoteEntries))
          localStorage.setItem(`anki_schedule_completions_${userId}`, JSON.stringify(remoteCompletions))
          set({ entries: remoteEntries, completions: remoteCompletions })
        }
      })
      .catch(console.error)
  },

  reset() {
    set({ entries: {}, completions: [], weekOffset: 0 })
  },

  addEntry(input) {
    const entry: ScheduleEntry = { id: generateId(), ...input }
    const entries = { ...get().entries, [entry.id]: entry }
    saveScheduleEntries(entries)
    set({ entries })
    const userId = getActiveUserId()
    if (userId !== 'default') upsertScheduleEntry(entry, userId).catch(console.error)
  },

  updateEntry(id, updates) {
    const entries = { ...get().entries }
    if (!entries[id]) return
    entries[id] = { ...entries[id], ...updates }
    saveScheduleEntries(entries)
    set({ entries })
    const userId = getActiveUserId()
    if (userId !== 'default') upsertScheduleEntry(entries[id], userId).catch(console.error)
  },

  deleteEntry(id) {
    const entries = { ...get().entries }
    delete entries[id]
    const completions = get().completions.filter((c) => c.entryId !== id)
    saveScheduleEntries(entries)
    saveScheduleCompletions(completions)
    set({ entries, completions })
    const userId = getActiveUserId()
    if (userId !== 'default') deleteScheduleEntryRemote(id).catch(console.error)
  },

  toggleCompletion(entryId) {
    const date = getTodayKey()
    const completions = [...get().completions]
    const idx = completions.findIndex((c) => c.entryId === entryId && c.date === date)
    if (idx >= 0) {
      completions.splice(idx, 1)
      saveScheduleCompletions(completions)
      set({ completions })
      const userId = getActiveUserId()
      if (userId !== 'default') deleteScheduleCompletion(entryId, date).catch(console.error)
    } else {
      completions.push({ entryId, date })
      saveScheduleCompletions(completions)
      set({ completions })
      const userId = getActiveUserId()
      if (userId !== 'default') upsertScheduleCompletion({ entryId, date }, userId).catch(console.error)
    }
  },

  prevWeek() {
    set((s) => ({ weekOffset: s.weekOffset - 1 }))
  },

  nextWeek() {
    set((s) => ({ weekOffset: s.weekOffset + 1 }))
  },

  resetToCurrentWeek() {
    set({ weekOffset: 0 })
  },

  goToDate(dateString) {
    const target = new Date(dateString + 'T00:00:00')
    const today = new Date()
    // Encontra a segunda-feira de cada semana e calcula offset
    const todayDow = today.getDay()
    const todayMonday = new Date(today)
    todayMonday.setDate(today.getDate() - (todayDow === 0 ? 6 : todayDow - 1))
    todayMonday.setHours(0, 0, 0, 0)

    const targetDow = target.getDay()
    const targetMonday = new Date(target)
    targetMonday.setDate(target.getDate() - (targetDow === 0 ? 6 : targetDow - 1))
    targetMonday.setHours(0, 0, 0, 0)

    const diffMs = targetMonday.getTime() - todayMonday.getTime()
    const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
    set({ weekOffset: diffWeeks })
  },

  getWeekDates() {
    return computeWeekDates(get().weekOffset)
  },

  getDateForDay(dayOfWeek) {
    const dates = computeWeekDates(get().weekOffset)
    return toDateString(dates[weekDayToIndex(dayOfWeek)])
  },

  isCurrentWeek() {
    return get().weekOffset === 0
  },

  isPastWeek() {
    return get().weekOffset < 0
  },

  isFutureWeek() {
    return get().weekOffset > 0
  },

  getEntriesForDay(day) {
    return Object.values(get().entries)
      .filter((e) => e.dayOfWeek === day)
      .sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute))
  },

  getTodayEntries() {
    const today = new Date().getDay() as WeekDay
    return get().getEntriesForDay(today)
  },

  isCompleted(entryId, date) {
    const d = date ?? getTodayKey()
    return get().completions.some((c) => c.entryId === entryId && c.date === d)
  },

  getTodayCompletionCount() {
    const today = getTodayKey()
    const todayEntries = get().getTodayEntries()
    return todayEntries.filter((e) => get().isCompleted(e.id, today)).length
  },
}))
