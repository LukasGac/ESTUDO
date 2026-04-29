import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  color?: 'blue' | 'green' | 'amber'
}

const colors = {
  blue: 'bg-accent',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
}

export function ProgressBar({ value, max = 100, className, color = 'blue' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-3', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colors[color])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
