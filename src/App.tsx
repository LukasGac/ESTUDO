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
import { useAuthStore } from '@/store/authStore'

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
  const hydrate = useDeckStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return <RouterProvider router={router} />
}
