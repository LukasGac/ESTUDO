import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Leaf, Settings, Flame, Shield, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStudyStore } from '@/store/studyStore'
import { useAuthStore } from '@/store/authStore'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getTodayKey, getEffectiveStreak } from '@/lib/streak'

export function Navbar() {
  const studyGoal = useStudyStore((s) => s.studyGoal)
  const todayStats = useStudyStore((s) => s.todayStats)
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)

  const today = getTodayKey()
  const streak = getEffectiveStreak(studyGoal, today)
  const studied = todayStats.cardsStudied
  const target = studyGoal.dailyCardTarget
  const showWidget = streak > 0 || studied > 0

  const initials = session?.username
    .split(/[\s_-]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') ?? '?'

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-surface/75 backdrop-blur-xl">
      <div className="mx-auto flex h-13 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2.5 text-text"
          style={{ textDecoration: 'none' }}
        >
          <div
            className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-white text-xs font-bold"
            style={{ letterSpacing: '-0.03em' }}
          >
            C
          </div>
          <span className="font-semibold text-text" style={{ letterSpacing: '-0.02em' }}>
            Estudo
          </span>
        </NavLink>

        {/* Widget de progresso diário */}
        {showWidget && (
          <div className="hidden items-center gap-3 sm:flex">
            {streak > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-amber-400">
                <Flame size={13} />
                <span className="tabular-nums">{streak}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <ProgressBar
                value={studied}
                max={target}
                color={studied >= target ? 'green' : 'blue'}
                className="w-16"
              />
              <span className="text-xs tabular-nums text-text-subtle">
                {studied}/{target}
              </span>
            </div>
          </div>
        )}

        {/* Nav + User */}
        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-0.5">
            <NavItem to="/" icon={<LayoutDashboard size={14} />} label="Dashboard" end />
            <NavItem to="/schedule" icon={<CalendarDays size={14} />} label="Cronograma" />
            <NavItem to="/focus" icon={<Leaf size={14} />} label="Foco" />
            <NavItem to="/manage" icon={<Settings size={14} />} label="Gerenciar" />
            {session?.role === 'admin' && (
              <NavItem to="/admin" icon={<Shield size={14} />} label="Admin" />
            )}
          </nav>

          {/* Separador + Avatar + Logout */}
          <div className="ml-2 flex items-center gap-1 border-l border-border/50 pl-2">
            <div
              title={session?.username}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-[11px] font-bold text-accent"
            >
              {initials}
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle hover:bg-surface-2 hover:text-text transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function NavItem({
  to, icon, label, end,
}: {
  to: string; icon: React.ReactNode; label: string; end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150',
          isActive
            ? 'bg-accent/10 text-accent'
            : 'text-text-subtle hover:bg-surface-2 hover:text-text-muted'
        )
      }
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  )
}
