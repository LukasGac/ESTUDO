import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const statusBadge: Record<string, { label: string; variant: 'default' | 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'cyan' }> = {
  new: { label: 'Novo', variant: 'blue' },
  learning: { label: 'Aprendendo', variant: 'amber' },
  review: { label: 'Revisão', variant: 'violet' },
  mastered: { label: 'Dominado', variant: 'green' },
}

interface CardItemProps {
  card: Card
  onEdit: (card: Card) => void
  onDelete: (cardId: string) => void
}

export function CardItem({ card, onEdit, onDelete }: CardItemProps) {
  const [expanded, setExpanded] = useState(false)
  const status = statusBadge[card.status]

  return (
    <div className={cn('rounded-lg border border-border bg-surface-1 transition-colors', expanded && 'bg-surface-2')}>
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-start gap-3 text-left"
        >
          {expanded ? (
            <ChevronUp size={14} className="mt-0.5 shrink-0 text-text-subtle" />
          ) : (
            <ChevronDown size={14} className="mt-0.5 shrink-0 text-text-subtle" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{card.front}</p>
            {!expanded && (
              <p className="mt-0.5 truncate text-xs text-text-muted">{card.back}</p>
            )}
          </div>
        </button>

        <Badge variant={status.variant}>{status.label}</Badge>

        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(card)} aria-label="Editar card">
            <Pencil size={13} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(card.id)} aria-label="Excluir card" className="text-red-400 hover:text-red-300">
            <Trash2 size={13} />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="mb-2">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-text-subtle">Resposta</p>
            <p className="whitespace-pre-wrap text-sm text-text-muted">{card.back}</p>
          </div>
          {card.hint && (
            <p className="mt-2 text-xs italic text-text-subtle">💡 {card.hint}</p>
          )}
          <div className="mt-3 flex gap-4 text-xs text-text-subtle">
            <span>Revisões: {card.totalReviews}</span>
            <span>Acertos: {card.correctReviews}</span>
            <span>Intervalo: {card.intervalDays}d</span>
          </div>
        </div>
      )}
    </div>
  )
}
