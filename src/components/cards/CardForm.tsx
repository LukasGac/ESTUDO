import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card, CreateCardInput } from '@/types'

interface CardFormProps {
  open: boolean
  onClose: () => void
  deckId: string
  onSubmit: (input: CreateCardInput) => void
  initial?: Partial<Card>
  title?: string
}

export function CardForm({ open, onClose, deckId, onSubmit, initial, title = 'Novo card' }: CardFormProps) {
  const [front, setFront] = useState(initial?.front ?? '')
  const [back, setBack] = useState(initial?.back ?? '')
  const [hint, setHint] = useState(initial?.hint ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!front.trim() || !back.trim()) return
    onSubmit({
      deckId,
      front: front.trim(),
      back: back.trim(),
      hint: hint.trim() || undefined,
    })
    setFront('')
    setBack('')
    setHint('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Pergunta (frente)"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="O que é...?"
          required
          autoFocus
          className="min-h-20"
        />
        <Textarea
          label="Resposta (verso)"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="A resposta é..."
          required
          className="min-h-24"
        />
        <Input
          label="Dica (opcional)"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Uma dica para lembrar..."
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">Salvar card</Button>
        </div>
      </form>
    </Modal>
  )
}
