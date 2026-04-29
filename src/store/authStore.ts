import { create } from 'zustand'
import { AuthSession, Card, CreateUserInput, Deck, User, UserRole } from '@/types'
import {
  clearLegacyKeys,
  getAuthSession,
  getUsers,
  saveAuthSession,
  saveUsers,
  setActiveUser,
} from '@/lib/storage'
import { generateId } from '@/lib/utils'
import { SEED_DECK, SEED_CARDS } from '@/data/seed'
import { PETROBRAS_DECKS, PETROBRAS_CARDS } from '@/data/petrobras'

// ── Hash de senha ─────────────────────────────────────────────────────────────
// djb2 modificado — não é produção, mas é aceitável para localStorage local.

function hashPassword(plain: string): string {
  let h = 5381
  for (let i = 0; i < plain.length; i++) {
    h = (Math.imul(h, 33) ^ plain.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

// ── Inicialização do usuário admin ────────────────────────────────────────────

function seedAdminData(): void {
  const decks: Record<string, Deck> = { [SEED_DECK.id]: SEED_DECK }
  PETROBRAS_DECKS.forEach((d) => { decks[d.id] = d })

  const cards: Record<string, Card> = {}
  ;[...SEED_CARDS, ...PETROBRAS_CARDS].forEach((c) => { cards[c.id] = c })

  localStorage.setItem('anki_decks_admin', JSON.stringify(decks))
  localStorage.setItem('anki_cards_admin', JSON.stringify(cards))
  localStorage.setItem('anki_meta_admin', JSON.stringify({
    version: '1.0.0', dataVersion: '3.0.0', initializedAt: new Date().toISOString(),
  }))
}

function ensureAdminExists(): void {
  const users = getUsers()
  if (Object.keys(users).length > 0) return

  const admin: User = {
    id: 'admin',
    username: 'admin',
    passwordHash: hashPassword('TROQUE-ESTA-SENHA'),
    displayName: 'Administrador',
    role: 'admin',
    createdAt: new Date().toISOString(),
  }
  saveUsers({ admin })
  seedAdminData()
  // Remove dados do período anterior (sem prefixo de usuário)
  clearLegacyKeys()
}

ensureAdminExists()

// ── Store ─────────────────────────────────────────────────────────────────────

interface AuthStore {
  session: AuthSession | null

  login: (username: string, password: string) => { ok: boolean; error?: string }
  logout: () => void

  // Gestão de usuários (apenas admin)
  getUsers: () => User[]
  addUser: (input: CreateUserInput) => { ok: boolean; error?: string }
  updateUser: (id: string, updates: { displayName?: string; email?: string; password?: string; role?: UserRole }) => void
  deleteUser: (id: string) => void
  clearUserData: (userId: string) => void
}

export const useAuthStore = create<AuthStore>(() => ({
  session: getAuthSession(),

  login(username, password) {
    const users = getUsers()
    const user = Object.values(users).find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    )
    if (!user) return { ok: false, error: 'Usuário não encontrado' }
    if (user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: 'Senha incorreta' }
    }

    const session: AuthSession = {
      userId: user.id,
      username: user.username,
      role: user.role,
    }
    saveAuthSession(session)
    setActiveUser(user.id)

    // Reload completo para que todos os stores reinicializem com dados do usuário
    window.location.replace('/')
    return { ok: true }
  },

  logout() {
    saveAuthSession(null)
    window.location.replace('/login')
  },

  getUsers() {
    return Object.values(getUsers())
  },

  addUser(input) {
    const users = getUsers()
    const exists = Object.values(users).some(
      (u) => u.username.toLowerCase() === input.username.toLowerCase()
    )
    if (exists) return { ok: false, error: 'Nome de usuário já existe' }

    const id = generateId()
    const user: User = {
      id,
      username: input.username.trim(),
      passwordHash: hashPassword(input.password),
      displayName: input.displayName.trim(),
      email: input.email?.trim() || undefined,
      role: input.role,
      createdAt: new Date().toISOString(),
    }
    saveUsers({ ...users, [id]: user })
    return { ok: true }
  },

  updateUser(id, updates) {
    const users = getUsers()
    if (!users[id]) return
    const updated: User = {
      ...users[id],
      displayName: updates.displayName ?? users[id].displayName,
      email: updates.email !== undefined ? updates.email || undefined : users[id].email,
      role: updates.role ?? users[id].role,
      ...(updates.password ? { passwordHash: hashPassword(updates.password) } : {}),
    }
    saveUsers({ ...users, [id]: updated })
  },

  deleteUser(id) {
    const users = getUsers()
    const session = getAuthSession()
    if (id === session?.userId) return // não pode deletar a si mesmo
    delete users[id]
    saveUsers(users)
  },

  clearUserData(userId) {
    const userDataKeys = [
      'anki_decks', 'anki_cards', 'anki_session', 'anki_meta',
      'anki_study_goals', 'anki_daily_stats', 'anki_pomodoro',
      'anki_schedule_entries', 'anki_schedule_completions', 'anki_garden',
    ]
    userDataKeys.forEach((k) => localStorage.removeItem(`${k}_${userId}`))
  },
}))
