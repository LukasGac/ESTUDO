import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { PomodoroWidget } from '@/components/pomodoro/PomodoroWidget'

export function Layout() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
      <PomodoroWidget />
    </div>
  )
}
