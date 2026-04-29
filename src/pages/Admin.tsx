import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Shield, User as UserIcon, Key, Edit2, X, Check } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { CreateUserInput, User, UserRole } from '@/types'
import { cn } from '@/lib/utils'

export function Admin() {
  const session = useAuthStore((s) => s.session)
  const users = useAuthStore((s) => s.users)
  const refreshUsers = useAuthStore((s) => s.refreshUsers)
  const addUser = useAuthStore((s) => s.addUser)
  const deleteUser = useAuthStore((s) => s.deleteUser)
  const updateUser = useAuthStore((s) => s.updateUser)
  const clearUserData = useAuthStore((s) => s.clearUserData)

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    refreshUsers()
  }, [refreshUsers])

  if (session?.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Shield size={16} className="text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">Administração</span>
          </div>
          <h1 className="text-3xl font-bold text-text" style={{ letterSpacing: '-0.03em' }}>
            Usuários
          </h1>
          <p className="mt-1.5 text-sm text-text-muted">
            {users.length} {users.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddForm(true)}>
          <Plus size={15} />
          Novo usuário
        </Button>
      </div>

      {/* Lista de usuários */}
      <div className="space-y-3">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isSelf={user.id === session.userId}
            onDelete={async () => { await deleteUser(user.id) }}
            onUpdate={async (updates) => { await updateUser(user.id, updates) }}
            onClearData={async () => { await clearUserData(user.id) }}
            editing={editingId === user.id}
            onEditStart={() => setEditingId(user.id)}
            onEditEnd={() => setEditingId(null)}
          />
        ))}
      </div>

      {/* Modal de adicionar usuário */}
      <AddUserModal
        open={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={async (input) => {
          const result = await addUser(input)
          if (result.ok) setShowAddForm(false)
          return result
        }}
      />
    </div>
  )
}

// ── UserCard ──────────────────────────────────────────────────────────────────

function UserCard({
  user, isSelf, onDelete, onUpdate, onClearData, editing, onEditStart, onEditEnd,
}: {
  user: User
  isSelf: boolean
  onDelete: () => Promise<void>
  onUpdate: (u: { displayName?: string; email?: string; password?: string; role?: UserRole }) => Promise<void>
  onClearData: () => Promise<void>
  editing: boolean
  onEditStart: () => void
  onEditEnd: () => void
}) {
  const [displayName, setDisplayName] = useState(user.displayName)
  const [email, setEmail] = useState(user.email ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [role, setRole] = useState<UserRole>(user.role)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  const initials = user.displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  async function handleSave() {
    await onUpdate({
      displayName: displayName.trim() || user.displayName,
      email: email.trim(),
      ...(newPassword ? { password: newPassword } : {}),
      role,
    })
    setNewPassword('')
    onEditEnd()
  }

  return (
    <div className="rounded-xl border border-border/60 bg-surface-1 p-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold',
          user.role === 'admin' ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-text-muted'
        )}>
          {initials || <UserIcon size={16} />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome completo">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-base"
                  />
                </Field>
                <Field label="E-mail">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="opcional"
                    className="input-base"
                  />
                </Field>
                <Field label="Nova senha">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="deixe em branco para manter"
                    className="input-base"
                  />
                </Field>
                <Field label="Perfil">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    disabled={isSelf}
                    className="input-base"
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </Field>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={handleSave}>
                  <Check size={13} /> Salvar
                </Button>
                <Button size="sm" variant="secondary" onClick={onEditEnd}>
                  <X size={13} /> Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-text">{user.displayName}</p>
                <RoleBadge role={user.role} />
                {isSelf && (
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] text-text-subtle">você</span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-text-subtle">
                @{user.username}
                {user.email && <span className="ml-2">· {user.email}</span>}
              </p>
              <p className="mt-0.5 text-[10px] text-text-subtle">
                Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </>
          )}
        </div>

        {/* Ações */}
        {!editing && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={onEditStart}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-surface-2 hover:text-text transition-colors"
              title="Editar"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => setShowConfirmClear(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
              title="Limpar dados"
            >
              <Key size={13} />
            </button>
            {!isSelf && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Excluir usuário"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmar delete */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden rounded-lg border border-red-500/20 bg-red-500/5 p-3"
          >
            <p className="text-sm text-red-400 mb-2">
              Excluir <strong>{user.displayName}</strong>? Os dados do usuário permanecerão no localStorage.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="danger" onClick={async () => { setShowConfirmDelete(false); await onDelete() }}>
                Excluir
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowConfirmDelete(false)}>
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmar limpar dados */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
          >
            <p className="text-sm text-amber-400 mb-2">
              Apagar todos os dados de <strong>{user.displayName}</strong>? (decks, cards, cronograma, jardim…)
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="danger" onClick={async () => { setShowConfirmClear(false); await onClearData() }}>
                Apagar dados
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowConfirmClear(false)}>
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── AddUserModal ──────────────────────────────────────────────────────────────

function AddUserModal({
  open, onClose, onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (input: CreateUserInput) => Promise<{ ok: boolean; error?: string }>
}) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [error, setError] = useState('')

  function reset() {
    setUsername(''); setDisplayName(''); setEmail('')
    setPassword(''); setRole('user'); setError('')
  }

  function handleClose() { reset(); onClose() }

  async function handleSubmit() {
    if (!username.trim() || !displayName.trim() || !password) {
      setError('Preencha usuário, nome e senha')
      return
    }
    const result = await onAdd({ username: username.trim(), displayName: displayName.trim(), email: email.trim(), password, role })
    if (!result.ok) { setError(result.error ?? 'Erro'); return }
    reset()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Novo usuário" className="max-w-lg">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Usuário *">
            <input autoFocus value={username} onChange={(e) => setUsername(e.target.value)} placeholder="login" className="input-base" />
          </Field>
          <Field label="Nome completo *">
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nome Sobrenome" className="input-base" />
          </Field>
          <Field label="E-mail">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="opcional" className="input-base" />
          </Field>
          <Field label="Senha *">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-base" />
          </Field>
          <Field label="Perfil" className="sm:col-span-2">
            <div className="flex gap-2">
              {(['user', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                    role === r
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-border bg-surface-2 text-text-subtle hover:text-text'
                  )}
                >
                  {r === 'admin' ? 'Administrador' : 'Usuário'}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={handleClose}>Cancelar</Button>
          <Button variant="primary" className="flex-1" onClick={handleSubmit}>
            <Plus size={14} /> Criar usuário
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
      role === 'admin'
        ? 'bg-accent/15 text-accent'
        : 'bg-surface-2 text-text-subtle'
    )}>
      {role === 'admin' && <Shield size={9} />}
      {role === 'admin' ? 'Admin' : 'Usuário'}
    </span>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-text-muted">{label}</label>
      {children}
    </div>
  )
}
