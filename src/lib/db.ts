import { supabase } from './supabase'
import type {
  Card,
  DailyStats,
  Deck,
  DinoEntry,
  PomodoroStateData,
  ScheduleCompletion,
  ScheduleEntry,
  StudyGoal,
  User,
} from '@/types'

// ── Mappers: snake_case (DB) ↔ camelCase (TS) ────────────────────────────────

function deckFromDb(row: Record<string, unknown>): Deck {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? undefined,
    color: row.color as Deck['color'],
    icon: (row.icon as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function deckToDb(deck: Deck, userId: string) {
  return {
    id: deck.id,
    user_id: userId,
    name: deck.name,
    description: deck.description ?? null,
    color: deck.color,
    icon: deck.icon ?? null,
    created_at: deck.createdAt,
    updated_at: deck.updatedAt,
  }
}

function cardFromDb(row: Record<string, unknown>): Card {
  return {
    id: row.id as string,
    deckId: row.deck_id as string,
    front: row.front as string,
    back: row.back as string,
    hint: (row.hint as string | null) ?? undefined,
    status: row.status as Card['status'],
    intervalDays: row.interval_days as number,
    easeFactor: Number(row.ease_factor),
    repetitions: row.repetitions as number,
    dueDate: row.due_date as string,
    lastReviewed: (row.last_reviewed as string | null),
    totalReviews: row.total_reviews as number,
    correctReviews: row.correct_reviews as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function cardToDb(card: Card, userId: string) {
  return {
    id: card.id,
    user_id: userId,
    deck_id: card.deckId,
    front: card.front,
    back: card.back,
    hint: card.hint ?? null,
    status: card.status,
    interval_days: card.intervalDays,
    ease_factor: card.easeFactor,
    repetitions: card.repetitions,
    due_date: card.dueDate,
    last_reviewed: card.lastReviewed ?? null,
    total_reviews: card.totalReviews,
    correct_reviews: card.correctReviews,
    created_at: card.createdAt,
    updated_at: card.updatedAt,
  }
}

function goalFromDb(row: Record<string, unknown>): StudyGoal {
  return {
    goalType: row.goal_type as StudyGoal['goalType'],
    dailyCardTarget: row.daily_card_target as number,
    dailyMinutesTarget: row.daily_minutes_target as number,
    currentStreak: row.current_streak as number,
    longestStreak: row.longest_streak as number,
    lastStudyDate: (row.last_study_date as string | null),
  }
}

function goalToDb(goal: StudyGoal, userId: string) {
  return {
    user_id: userId,
    goal_type: goal.goalType,
    daily_card_target: goal.dailyCardTarget,
    daily_minutes_target: goal.dailyMinutesTarget,
    current_streak: goal.currentStreak,
    longest_streak: goal.longestStreak,
    last_study_date: goal.lastStudyDate ?? null,
    updated_at: new Date().toISOString(),
  }
}

function pomodoroFromDb(row: Record<string, unknown>): PomodoroStateData {
  return {
    settings: {
      focusDuration: row.focus_duration as number,
      shortBreakDuration: row.short_break_duration as number,
      longBreakDuration: row.long_break_duration as number,
      cyclesBeforeLongBreak: row.cycles_before_long_break as number,
    },
    cyclesCompletedToday: row.cycles_completed_today as number,
    lastCycleDate: (row.last_cycle_date as string | null),
  }
}

function pomodoroToDb(state: PomodoroStateData, userId: string) {
  return {
    user_id: userId,
    focus_duration: state.settings.focusDuration,
    short_break_duration: state.settings.shortBreakDuration,
    long_break_duration: state.settings.longBreakDuration,
    cycles_before_long_break: state.settings.cyclesBeforeLongBreak,
    cycles_completed_today: state.cyclesCompletedToday,
    last_cycle_date: state.lastCycleDate ?? null,
    updated_at: new Date().toISOString(),
  }
}

function scheduleEntryFromDb(row: Record<string, unknown>): ScheduleEntry {
  return {
    id: row.id as string,
    dayOfWeek: row.day_of_week as ScheduleEntry['dayOfWeek'],
    startHour: row.start_hour as number,
    startMinute: row.start_minute as 0 | 30,
    durationMinutes: row.duration_minutes as number,
    subject: row.subject as string,
    color: row.color as string,
  }
}

function scheduleEntryToDb(entry: ScheduleEntry, userId: string) {
  return {
    id: entry.id,
    user_id: userId,
    day_of_week: entry.dayOfWeek,
    start_hour: entry.startHour,
    start_minute: entry.startMinute,
    duration_minutes: entry.durationMinutes,
    subject: entry.subject,
    color: entry.color,
  }
}

function dinoFromDb(row: Record<string, unknown>): DinoEntry {
  return {
    id: row.id as string,
    type: row.type as DinoEntry['type'],
    size: row.size as DinoEntry['size'],
    habitat: row.habitat as DinoEntry['habitat'],
    grownAt: row.grown_at as string,
    durationMinutes: row.duration_minutes as number,
  }
}

function dinoToDb(dino: DinoEntry, userId: string) {
  return {
    id: dino.id,
    user_id: userId,
    type: dino.type,
    size: dino.size,
    habitat: dino.habitat,
    grown_at: dino.grownAt,
    duration_minutes: dino.durationMinutes,
  }
}

function userFromDb(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    username: row.username as string,
    displayName: row.display_name as string,
    email: (row.email as string | null) ?? undefined,
    role: row.role as User['role'],
    createdAt: row.created_at as string,
  }
}

// ── Decks ─────────────────────────────────────────────────────────────────────

export async function fetchDecks(userId: string): Promise<Record<string, Deck>> {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId)
  if (error || !data) return {}
  return Object.fromEntries(data.map((row) => [row.id, deckFromDb(row)]))
}

export async function upsertAllDecks(decks: Record<string, Deck>, userId: string): Promise<void> {
  const rows = Object.values(decks).map((d) => deckToDb(d, userId))
  if (rows.length === 0) return
  await supabase.from('decks').upsert(rows, { onConflict: 'id' })
}

export async function upsertDeck(deck: Deck, userId: string): Promise<void> {
  await supabase.from('decks').upsert(deckToDb(deck, userId), { onConflict: 'id' })
}

export async function deleteDeckRemote(id: string): Promise<void> {
  await supabase.from('decks').delete().eq('id', id)
}

// ── Cards ─────────────────────────────────────────────────────────────────────

export async function fetchCards(userId: string): Promise<Record<string, Card>> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
  if (error || !data) return {}
  return Object.fromEntries(data.map((row) => [row.id, cardFromDb(row)]))
}

export async function upsertCard(card: Card, userId: string): Promise<void> {
  await supabase.from('cards').upsert(cardToDb(card, userId), { onConflict: 'id' })
}

export async function upsertAllCards(cards: Record<string, Card>, userId: string): Promise<void> {
  const rows = Object.values(cards).map((c) => cardToDb(c, userId))
  if (rows.length === 0) return
  // Upsert em lotes de 500 para evitar payload muito grande
  for (let i = 0; i < rows.length; i += 500) {
    await supabase.from('cards').upsert(rows.slice(i, i + 500), { onConflict: 'id' })
  }
}

export async function deleteCardRemote(cardId: string): Promise<void> {
  await supabase.from('cards').delete().eq('id', cardId)
}

// ── Study Goals ───────────────────────────────────────────────────────────────

export async function fetchStudyGoal(userId: string): Promise<StudyGoal | null> {
  const { data } = await supabase
    .from('study_goals')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data ? goalFromDb(data) : null
}

export async function upsertStudyGoal(goal: StudyGoal, userId: string): Promise<void> {
  await supabase.from('study_goals').upsert(goalToDb(goal, userId), { onConflict: 'user_id' })
}

// ── Daily Stats ───────────────────────────────────────────────────────────────

export async function fetchDailyStats(userId: string): Promise<Record<string, DailyStats>> {
  const { data } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
  if (!data) return {}
  return Object.fromEntries(
    data.map((row) => [
      row.date as string,
      {
        date: row.date as string,
        cardsStudied: row.cards_studied as number,
        cardsCorrect: row.cards_correct as number,
        minutesStudied: row.minutes_studied as number,
      } satisfies DailyStats,
    ])
  )
}

export async function upsertDailyStats(stats: Record<string, DailyStats>, userId: string): Promise<void> {
  const rows = Object.values(stats).map((s) => ({
    user_id: userId,
    date: s.date,
    cards_studied: s.cardsStudied,
    cards_correct: s.cardsCorrect,
    minutes_studied: s.minutesStudied,
  }))
  if (rows.length === 0) return
  await supabase.from('daily_stats').upsert(rows, { onConflict: 'user_id,date' })
}

// ── Pomodoro ──────────────────────────────────────────────────────────────────

export async function fetchPomodoroState(userId: string): Promise<PomodoroStateData | null> {
  const { data } = await supabase
    .from('pomodoro_state')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data ? pomodoroFromDb(data) : null
}

export async function upsertPomodoroState(state: PomodoroStateData, userId: string): Promise<void> {
  await supabase.from('pomodoro_state').upsert(pomodoroToDb(state, userId), { onConflict: 'user_id' })
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export async function fetchScheduleEntries(userId: string): Promise<Record<string, ScheduleEntry>> {
  const { data } = await supabase
    .from('schedule_entries')
    .select('*')
    .eq('user_id', userId)
  if (!data) return {}
  return Object.fromEntries(data.map((row) => [row.id, scheduleEntryFromDb(row)]))
}

export async function upsertScheduleEntry(entry: ScheduleEntry, userId: string): Promise<void> {
  await supabase.from('schedule_entries').upsert(scheduleEntryToDb(entry, userId), { onConflict: 'id' })
}

export async function deleteScheduleEntryRemote(id: string): Promise<void> {
  await supabase.from('schedule_entries').delete().eq('id', id)
}

export async function fetchScheduleCompletions(userId: string): Promise<ScheduleCompletion[]> {
  const { data } = await supabase
    .from('schedule_completions')
    .select('entry_id, date')
    .eq('user_id', userId)
  if (!data) return []
  return data.map((row) => ({ entryId: row.entry_id as string, date: row.date as string }))
}

export async function upsertScheduleCompletion(comp: ScheduleCompletion, userId: string): Promise<void> {
  await supabase.from('schedule_completions').upsert(
    { user_id: userId, entry_id: comp.entryId, date: comp.date },
    { onConflict: 'user_id,entry_id,date' }
  )
}

export async function deleteScheduleCompletion(entryId: string, date: string): Promise<void> {
  await supabase.from('schedule_completions').delete()
    .eq('entry_id', entryId)
    .eq('date', date)
}

// ── Dinos ─────────────────────────────────────────────────────────────────────

export async function fetchDinos(userId: string): Promise<DinoEntry[]> {
  const { data } = await supabase
    .from('dinos')
    .select('*')
    .eq('user_id', userId)
    .order('grown_at', { ascending: true })
  return data ? data.map(dinoFromDb) : []
}

export async function insertDino(dino: DinoEntry, userId: string): Promise<void> {
  await supabase.from('dinos').insert(dinoToDb(dino, userId))
}

// ── Users (admin) ─────────────────────────────────────────────────────────────

export async function fetchUsers(): Promise<User[]> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true })
  return data ? data.map(userFromDb) : []
}

export async function updateUserProfile(
  id: string,
  updates: { display_name?: string; email?: string | null; role?: string }
): Promise<void> {
  await supabase.from('users').update(updates).eq('id', id)
}

// ── Limpar todos os dados de um usuário (admin) ────────────────────────────────

export async function clearUserDataRemote(userId: string): Promise<void> {
  await Promise.all([
    supabase.from('cards').delete().eq('user_id', userId),
    supabase.from('schedule_completions').delete().eq('user_id', userId),
  ])
  await Promise.all([
    supabase.from('decks').delete().eq('user_id', userId),
    supabase.from('schedule_entries').delete().eq('user_id', userId),
    supabase.from('dinos').delete().eq('user_id', userId),
    supabase.from('study_goals').delete().eq('user_id', userId),
    supabase.from('daily_stats').delete().eq('user_id', userId),
    supabase.from('pomodoro_state').delete().eq('user_id', userId),
    supabase.from('active_sessions').delete().eq('user_id', userId),
  ])
}
