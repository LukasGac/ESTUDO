import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { Study } from '@/pages/Study'
import { Manage } from '@/pages/Manage'
import { Schedule } from '@/pages/Schedule'
import { Focus } from '@/pages/Focus'
import { Login } from '@/pages/Login'
import { Admin } from '@/pages/Admin'
import { useDeckStore } from '@/store/deckStore'
import { useStudyStore } from '@/store/studyStore'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { useScheduleStore } from '@/store/scheduleStore'
import { useFocusStore } from '@/store/focusStore'
import { useAuthStore } from '@/store/authStore'
import { runMigration } from '@/lib/migration'

function AuthGuard() {
  const session = useAuthStore((s) => s.session)
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

function GuestGuard() {
  const session = useAuthStore((s) => s.session)
  if (session) return <Navigate to="/" replace />
  return <Outlet />
}

const router = createBrowserRouter([
  {
    element: <GuestGuard />,
    children: [
      { path: '/login', element: <Login /> },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'study/:deckId', element: <Study /> },
          { path: 'manage', element: <Manage /> },
          { path: 'manage/:deckId', element: <Manage /> },
          { path: 'schedule', element: <Schedule /> },
          { path: 'focus', element: <Focus /> },
          { path: 'admin', element: <Admin /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export function App() {
  const isLoading = useAuthStore((s) => s.isLoading)
  const sessionUserId = useAuthStore((s) => s.session?.userId)

  const hydrateDecks = useDeckStore((s) => s.hydrate)
  const resetDecks = useDeckStore((s) => s.reset)
  const hydrateStudy = useStudyStore((s) => s.hydrate)
  const resetStudy = useStudyStore((s) => s.reset)
  const hydratePomodoro = usePomodoroStore((s) => s.hydrate)
  const resetPomodoro = usePomodoroStore((s) => s.resetStore)
  const hydrateSchedule = useScheduleStore((s) => s.hydrate)
  const resetSchedule = useScheduleStore((s) => s.reset)
  const hydrateFocus = useFocusStore((s) => s.hydrate)
  const resetFocus = useFocusStore((s) => s.reset)

  useEffect(() => {
    if (!sessionUserId) {
      resetDecks()
      resetStudy()
      resetPomodoro()
      resetSchedule()
      resetFocus()
      return
    }

    // Migração one-time de dados do localStorage para Supabase
    runMigration(sessionUserId).catch(console.error)

    // Hidrata todos os stores com dados do usuário logado
    hydrateDecks()
    hydrateStudy()
    hydratePomodoro()
    hydrateSchedule()
    hydrateFocus()
  }, [sessionUserId])  // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  return <RouterProvider router={router} />
}
