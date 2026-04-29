import {
  getDecks,
  getCards,
  getStudyGoal,
  getDailyStats,
  getPomodoroState,
  getScheduleEntries,
  getScheduleCompletions,
  getDinos,
} from './storage'
import {
  upsertAllDecks,
  upsertAllCards,
  upsertStudyGoal,
  upsertDailyStats,
  upsertPomodoroState,
  upsertScheduleEntry,
  upsertScheduleCompletion,
  insertDino,
  fetchDecks,
} from './db'

const MIGRATION_FLAG = (userId: string) => `anki_migrated_to_supabase_${userId}`

export async function runMigration(userId: string): Promise<void> {
  if (localStorage.getItem(MIGRATION_FLAG(userId))) return

  // Se Supabase já tem dados, não sobrescreve
  const remoteDecks = await fetchDecks(userId)
  if (Object.keys(remoteDecks).length > 0) {
    localStorage.setItem(MIGRATION_FLAG(userId), 'done')
    return
  }

  // Lê dados do localStorage (usando o userId atual como namespace)
  const decks = getDecks()
  const cards = getCards()
  const goal = getStudyGoal()
  const stats = getDailyStats()
  const pomodoro = getPomodoroState()
  const scheduleEntries = getScheduleEntries()
  const scheduleCompletions = getScheduleCompletions()
  const dinos = getDinos()

  const uploads: Promise<void>[] = []

  if (Object.keys(decks).length > 0) uploads.push(upsertAllDecks(decks, userId))
  if (Object.keys(cards).length > 0) uploads.push(upsertAllCards(cards, userId))
  uploads.push(upsertStudyGoal(goal, userId))
  if (Object.keys(stats).length > 0) uploads.push(upsertDailyStats(stats, userId))
  uploads.push(upsertPomodoroState(pomodoro, userId))

  for (const entry of Object.values(scheduleEntries)) {
    uploads.push(upsertScheduleEntry(entry, userId))
  }
  for (const comp of scheduleCompletions) {
    uploads.push(upsertScheduleCompletion(comp, userId))
  }
  for (const dino of dinos) {
    uploads.push(insertDino(dino, userId))
  }

  await Promise.allSettled(uploads)
  localStorage.setItem(MIGRATION_FLAG(userId), 'done')
}
