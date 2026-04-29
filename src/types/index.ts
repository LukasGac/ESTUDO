export type Rating = 'wrong' | 'hard' | 'correct'

export type CardStatus = 'new' | 'learning' | 'review' | 'mastered'

export type DeckColor = 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan'

export interface Card {
  id: string
  deckId: string
  front: string
  back: string
  hint?: string
  status: CardStatus
  intervalDays: number
  easeFactor: number
  repetitions: number
  dueDate: string
  lastReviewed: string | null
  totalReviews: number
  correctReviews: number
  createdAt: string
  updatedAt: string
}

export interface Deck {
  id: string
  name: string
  description?: string
  color: DeckColor
  icon?: string
  createdAt: string
  updatedAt: string
}

export interface DeckStats {
  totalCards: number
  dueToday: number
  newCards: number
  masteredCards: number
  accuracy: number
}

export interface DeckWithStats extends Deck {
  stats: DeckStats
}

export interface StudySession {
  deckId: string
  queue: string[]
  currentIndex: number
  startedAt: string
  reviewedCount: number
  correctCount: number
}

export interface SRSResult {
  newIntervalDays: number
  newEaseFactor: number
  newRepetitions: number
  newStatus: CardStatus
  newDueDate: string
}

export type CreateDeckInput = Pick<Deck, 'name' | 'color'> & {
  description?: string
  icon?: string
}

export type CreateCardInput = Pick<Card, 'deckId' | 'front' | 'back'> & {
  hint?: string
}

export type GoalType = 'cards' | 'hours'

export interface StudyGoal {
  goalType: GoalType
  dailyCardTarget: number
  dailyMinutesTarget: number
  currentStreak: number
  longestStreak: number
  lastStudyDate: string | null
}

export interface DailyStats {
  date: string
  cardsStudied: number
  cardsCorrect: number
  minutesStudied: number
}

// ── Auth / Usuários ───────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  username: string
  displayName: string
  email?: string
  role: UserRole
  createdAt: string
}

export interface AuthSession {
  userId: string
  username: string
  role: UserRole
}

export type CreateUserInput = {
  username: string
  password: string
  displayName: string
  email?: string
  role: UserRole
}

// ── Pomodoro ──────────────────────────────────────────────────────────────────

export type PomodoroMode = 'focus' | 'short-break' | 'long-break'

export interface PomodoroSettings {
  focusDuration: number        // minutes
  shortBreakDuration: number
  longBreakDuration: number
  cyclesBeforeLongBreak: number
}

export interface PomodoroStateData {
  settings: PomodoroSettings
  cyclesCompletedToday: number
  lastCycleDate: string | null
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = domingo

export interface ScheduleEntry {
  id: string
  dayOfWeek: WeekDay
  startHour: number
  startMinute: 0 | 30
  durationMinutes: number
  subject: string
  color: string
}

export interface ScheduleCompletion {
  date: string    // YYYY-MM-DD
  entryId: string
}

// ── Focus / Mundo Jurássico ───────────────────────────────────────────────────

export type DinoType = 't-rex' | 'triceratops' | 'pterodactyl' | 'brachiosaurus'

export type DinoSize = 'baby' | 'young' | 'adult' | 'elder'

export type DinoHabitat = 'volcano' | 'forest' | 'sky' | 'savanna'

export interface DinoEntry {
  id: string
  type: DinoType
  size: DinoSize
  habitat: DinoHabitat
  grownAt: string  // ISO
  durationMinutes: number
}

export type AmbientSound = 'none' | 'rain' | 'forest' | 'cafe'

export function getDinoSize(minutes: number): DinoSize {
  if (minutes <= 15) return 'baby'
  if (minutes <= 30) return 'young'
  if (minutes <= 60) return 'adult'
  return 'elder'
}

export const DINO_HABITAT: Record<DinoType, DinoHabitat> = {
  't-rex': 'volcano',
  'triceratops': 'forest',
  'pterodactyl': 'sky',
  'brachiosaurus': 'savanna',
}
