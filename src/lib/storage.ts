import {
  AuthSession,
  Card,
  Deck,
  DailyStats,
  DinoEntry,
  PomodoroStateData,
  ScheduleCompletion,
  ScheduleEntry,
  StudyGoal,
  StudySession,
  User,
} from '@/types'

// ── Namespace por usuário ─────────────────────────────────────────────────────

let _userId = 'default'

// Lê a sessão do localStorage ao iniciar o módulo para que todos os stores
// já usem o prefixo correto na primeira renderização.
;(() => {
  try {
    const raw = localStorage.getItem('anki_auth_session')
    if (raw) {
      const s = JSON.parse(raw) as Partial<AuthSession>
      if (s?.userId) _userId = s.userId
    }
  } catch { /* ok */ }
})()

export function setActiveUser(userId: string): void {
  _userId = userId
}

/** Gera chave com prefixo do usuário atual */
function u(base: string): string {
  return `${base}_${_userId}`
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

// ── Decks ─────────────────────────────────────────────────────────────────────

export function getDecks(): Record<string, Deck> {
  return parse(u('anki_decks'), {})
}
export function saveDecks(decks: Record<string, Deck>): void {
  localStorage.setItem(u('anki_decks'), JSON.stringify(decks))
}

// ── Cards ─────────────────────────────────────────────────────────────────────

export function getCards(): Record<string, Card> {
  return parse(u('anki_cards'), {})
}
export function saveCard(card: Card): void {
  const all = getCards()
  all[card.id] = card
  localStorage.setItem(u('anki_cards'), JSON.stringify(all))
}
export function deleteCardFromStorage(cardId: string): void {
  const all = getCards()
  delete all[cardId]
  localStorage.setItem(u('anki_cards'), JSON.stringify(all))
}
export function saveAllCards(cards: Record<string, Card>): void {
  localStorage.setItem(u('anki_cards'), JSON.stringify(cards))
}

// ── Session ───────────────────────────────────────────────────────────────────

export function getSession(): StudySession | null {
  return parse<StudySession | null>(u('anki_session'), null)
}
export function saveSession(session: StudySession | null): void {
  if (session === null) localStorage.removeItem(u('anki_session'))
  else localStorage.setItem(u('anki_session'), JSON.stringify(session))
}

// ── Meta / Init ───────────────────────────────────────────────────────────────

const VERSION = '1.0.0'
export const DATA_VERSION = '3.0.0'

export function isInitialized(): boolean {
  return localStorage.getItem(u('anki_meta')) !== null
}
export function markInitialized(): void {
  localStorage.setItem(u('anki_meta'), JSON.stringify({
    version: VERSION,
    dataVersion: DATA_VERSION,
    initializedAt: new Date().toISOString(),
  }))
}
export function getDataVersion(): string {
  const meta = parse<{ dataVersion?: string }>(u('anki_meta'), {})
  return meta.dataVersion ?? '1.0.0'
}
export function updateDataVersion(): void {
  const raw = localStorage.getItem(u('anki_meta'))
  const meta = raw ? (JSON.parse(raw) as Record<string, string>) : {}
  meta.dataVersion = DATA_VERSION
  localStorage.setItem(u('anki_meta'), JSON.stringify(meta))
}

// ── Study Goal ────────────────────────────────────────────────────────────────

const DEFAULT_GOAL: StudyGoal = {
  goalType: 'cards',
  dailyCardTarget: 20,
  dailyMinutesTarget: 60,
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
}
export function getStudyGoal(): StudyGoal {
  return parse(u('anki_study_goals'), DEFAULT_GOAL)
}
export function saveStudyGoal(goal: StudyGoal): void {
  localStorage.setItem(u('anki_study_goals'), JSON.stringify(goal))
}

// ── Daily Stats ───────────────────────────────────────────────────────────────

export function getDailyStats(): Record<string, DailyStats> {
  return parse(u('anki_daily_stats'), {})
}
export function saveDailyStats(stats: Record<string, DailyStats>): void {
  localStorage.setItem(u('anki_daily_stats'), JSON.stringify(stats))
}

// ── Pomodoro ──────────────────────────────────────────────────────────────────

const DEFAULT_POMODORO: PomodoroStateData = {
  settings: { focusDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, cyclesBeforeLongBreak: 4 },
  cyclesCompletedToday: 0,
  lastCycleDate: null,
}
export function getPomodoroState(): PomodoroStateData {
  return parse(u('anki_pomodoro'), DEFAULT_POMODORO)
}
export function savePomodoroState(state: PomodoroStateData): void {
  localStorage.setItem(u('anki_pomodoro'), JSON.stringify(state))
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export function getScheduleEntries(): Record<string, ScheduleEntry> {
  return parse(u('anki_schedule_entries'), {})
}
export function saveScheduleEntries(entries: Record<string, ScheduleEntry>): void {
  localStorage.setItem(u('anki_schedule_entries'), JSON.stringify(entries))
}
export function getScheduleCompletions(): ScheduleCompletion[] {
  return parse(u('anki_schedule_completions'), [])
}
export function saveScheduleCompletions(completions: ScheduleCompletion[]): void {
  localStorage.setItem(u('anki_schedule_completions'), JSON.stringify(completions))
}

// ── Dinos ─────────────────────────────────────────────────────────────────────

export function getDinos(): DinoEntry[] {
  // Migração: se existir dado legado de garden, ignora (tipos incompatíveis)
  return parse(u('anki_dinos'), [])
}
export function saveDinos(dinos: DinoEntry[]): void {
  localStorage.setItem(u('anki_dinos'), JSON.stringify(dinos))
}

// ── Auth (global — sem prefixo de usuário) ────────────────────────────────────

export function getUsers(): Record<string, User> {
  return parse('anki_users', {})
}
export function saveUsers(users: Record<string, User>): void {
  localStorage.setItem('anki_users', JSON.stringify(users))
}
export function getAuthSession(): AuthSession | null {
  return parse<AuthSession | null>('anki_auth_session', null)
}
export function saveAuthSession(session: AuthSession | null): void {
  if (session === null) localStorage.removeItem('anki_auth_session')
  else localStorage.setItem('anki_auth_session', JSON.stringify(session))
}

// ── Limpeza de dados legados (sem prefixo) ────────────────────────────────────

export function clearLegacyKeys(): void {
  const legacy = [
    'anki_decks', 'anki_cards', 'anki_session', 'anki_meta',
    'anki_study_goals', 'anki_daily_stats', 'anki_pomodoro',
    'anki_schedule_entries', 'anki_schedule_completions', 'anki_garden', 'anki_dinos',
  ]
  legacy.forEach((k) => localStorage.removeItem(k))
}

// ── Limpar todos os dados do usuário atual ────────────────────────────────────

export function clearCurrentUserData(): void {
  const userKeys = [
    'anki_decks', 'anki_cards', 'anki_session', 'anki_meta',
    'anki_study_goals', 'anki_daily_stats', 'anki_pomodoro',
    'anki_schedule_entries', 'anki_schedule_completions', 'anki_garden', 'anki_dinos',
  ]
  userKeys.forEach((k) => localStorage.removeItem(u(k)))
}
