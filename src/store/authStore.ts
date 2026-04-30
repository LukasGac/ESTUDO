import { create } from 'zustand'
import { AuthSession, CreateUserInput, User, UserRole } from '@/types'
import { setActiveUser } from '@/lib/storage'
import { supabase } from '@/lib/supabase'
import { fetchUsers, updateUserProfile, clearUserDataRemote } from '@/lib/db'

interface AuthStore {
  session: AuthSession | null
  isLoading: boolean
  users: User[]

  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUsers: () => Promise<void>

  addUser: (input: CreateUserInput) => Promise<{ ok: boolean; error?: string }>
  updateUser: (id: string, updates: { displayName?: string; email?: string; password?: string; role?: UserRole }) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  clearUserData: (userId: string) => Promise<void>
}

// ── Listener de autenticação ──────────────────────────────────────────────────

async function resolveSession(userId: string): Promise<AuthSession | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 15000))
  const query = supabase.rpc('get_my_profile').then(({ data, error }) => {
    if (error || !data || (data as unknown[]).length === 0) return null
    const row = (data as { username: string; role: string }[])[0]
    return { userId, username: row.username, role: row.role as UserRole } as AuthSession
  })
  return Promise.race([query, timeout])
}

supabase.auth.onAuthStateChange(async (event, sbSession) => {
  try {
    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
      if (sbSession?.user) {
        const session = await resolveSession(sbSession.user.id)
        if (session) {
          setActiveUser(session.userId)
          useAuthStore.setState({ session, isLoading: false })
        } else {
          await supabase.auth.signOut()
          useAuthStore.setState({ session: null, isLoading: false })
        }
      } else {
        useAuthStore.setState({ session: null, isLoading: false })
      }
    } else if (event === 'SIGNED_OUT') {
      setActiveUser('default')
      useAuthStore.setState({ session: null, isLoading: false, users: [] })
    }
  } catch (err) {
    console.error('[auth] onAuthStateChange error:', err)
    useAuthStore.setState({ session: null, isLoading: false })
  }
})

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>(() => ({
  session: null,
  isLoading: true,
  users: [],

  async login(username, password) {
    const deadline = new Promise<{ ok: false; error: string }>((resolve) =>
      setTimeout(() => resolve({ ok: false, error: 'Tempo esgotado. Verifique sua conexão.' }), 12000)
    )

    const attempt = async (): Promise<{ ok: boolean; error?: string }> => {
      const { data: email, error: rpcError } = await supabase.rpc('get_auth_email_by_username', {
        p_username: username.trim(),
      })
      if (rpcError || !email) return { ok: false, error: 'Usuário não encontrado' }

      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) return { ok: false, error: 'Senha incorreta' }

      return { ok: true }
    }

    return Promise.race([attempt(), deadline])
  },

  async logout() {
    await supabase.auth.signOut()
    // onAuthStateChange dispara SIGNED_OUT e limpa o store
  },

  async refreshUsers() {
    const users = await fetchUsers()
    useAuthStore.setState({ users })
  },

  async addUser(input) {
    const { data, error } = await supabase.functions.invoke('admin-ops', {
      body: {
        action: 'create',
        username: input.username,
        displayName: input.displayName,
        email: input.email,
        password: input.password,
        role: input.role,
      },
    })
    if (error || data?.error) {
      return { ok: false, error: data?.error ?? 'Erro ao criar usuário' }
    }
    await useAuthStore.getState().refreshUsers()
    return { ok: true }
  },

  async updateUser(id, updates) {
    if (updates.password) {
      await supabase.functions.invoke('admin-ops', {
        body: { action: 'updatePassword', userId: id, password: updates.password },
      })
    }

    const profileUpdates: Record<string, unknown> = {}
    if (updates.displayName !== undefined) profileUpdates.display_name = updates.displayName
    if (updates.email !== undefined) profileUpdates.email = updates.email || null
    if (updates.role !== undefined) profileUpdates.role = updates.role

    if (Object.keys(profileUpdates).length > 0) {
      await updateUserProfile(id, profileUpdates as Parameters<typeof updateUserProfile>[1])
    }

    await useAuthStore.getState().refreshUsers()
  },

  async deleteUser(id) {
    await supabase.functions.invoke('admin-ops', {
      body: { action: 'delete', userId: id },
    })
    await useAuthStore.getState().refreshUsers()
  },

  async clearUserData(userId) {
    await clearUserDataRemote(userId)
    // Limpa também o localStorage desse usuário
    const keys = [
      'anki_decks', 'anki_cards', 'anki_session', 'anki_meta',
      'anki_study_goals', 'anki_daily_stats', 'anki_pomodoro',
      'anki_schedule_entries', 'anki_schedule_completions', 'anki_garden', 'anki_dinos',
    ]
    keys.forEach((k) => localStorage.removeItem(`${k}_${userId}`))
  },
}))
