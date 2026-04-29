import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function Login() {
  const login = useAuthStore((s) => s.login)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) return

    setLoading(true)
    setError('')

    const result = await login(username.trim(), password)
    if (!result.ok) {
      setError(result.error ?? 'Erro ao entrar')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white text-xl font-bold shadow-lg shadow-accent/25"
            style={{ letterSpacing: '-0.03em' }}
          >
            C
          </div>
          <h1 className="text-2xl font-bold text-text" style={{ letterSpacing: '-0.03em' }}>
            Estudo
          </h1>
          <p className="mt-1 text-sm text-text-subtle">Plataforma de estudos</p>
        </div>

        {/* Card de login */}
        <div className="rounded-2xl border border-border/60 bg-surface-1 p-6 shadow-2xl">
          <h2 className="mb-5 text-base font-semibold text-text">Entrar na conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">
                Usuário
              </label>
              <input
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className={cn(
                  'w-full rounded-xl border bg-surface-2 px-4 py-2.5 text-sm text-text placeholder:text-text-subtle transition-colors focus:outline-none focus:ring-2',
                  error
                    ? 'border-red-500/40 focus:ring-red-500/20'
                    : 'border-border focus:border-accent/60 focus:ring-accent/20'
                )}
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full rounded-xl border bg-surface-2 px-4 py-2.5 pr-10 text-sm text-text placeholder:text-text-subtle transition-colors focus:outline-none focus:ring-2',
                    error
                      ? 'border-red-500/40 focus:ring-red-500/20'
                      : 'border-border focus:border-accent/60 focus:ring-accent/20'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!username.trim() || !password || loading}
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
