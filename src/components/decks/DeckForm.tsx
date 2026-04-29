import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { CreateDeckInput, Deck, DeckColor } from '@/types'
import { cn } from '@/lib/utils'

const COLORS: { value: DeckColor; label: string; cls: string }[] = [
  { value: 'blue', label: 'Azul', cls: 'bg-blue-500' },
  { value: 'violet', label: 'Violeta', cls: 'bg-violet-500' },
  { value: 'emerald', label: 'Verde', cls: 'bg-emerald-500' },
  { value: 'amber', label: 'Âmbar', cls: 'bg-amber-500' },
  { value: 'rose', label: 'Rosa', cls: 'bg-rose-500' },
  { value: 'cyan', label: 'Ciano', cls: 'bg-cyan-500' },
]

interface DeckFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: CreateDeckInput) => void
  initial?: Partial<Deck>
  title?: string
}

export function DeckForm({ open, onClose, onSubmit, initial, title = 'Novo baralho' }: DeckFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [color, setColor] = useState<DeckColor>(initial?.color ?? 'blue')
  const [icon, setIcon] = useState(initial?.icon ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), description: description.trim() || undefined, color, icon: icon.trim() || undefined })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="w-16">
            <Input
              label="Ícone"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="📚"
              maxLength={2}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Direito Constitucional"
              required
              autoFocus
            />
          </div>
        </div>

        <Textarea
          label="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tópicos cobertos neste baralho..."
          className="min-h-16"
        />

        <div>
          <p className="mb-2 text-sm font-medium text-text-muted">Cor</p>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={cn(
                  'h-7 w-7 rounded-full transition-all',
                  c.cls,
                  color === c.value ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-surface-1 scale-110' : 'opacity-60 hover:opacity-100'
                )}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">Salvar</Button>
        </div>
      </form>
    </Modal>
  )
}
