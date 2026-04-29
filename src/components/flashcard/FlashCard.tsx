import { motion } from 'framer-motion'
import { Card } from '@/types'
import { FlashCardFront } from './FlashCardFront'
import { FlashCardBack } from './FlashCardBack'

interface FlashCardProps {
  card: Card
  isFlipped: boolean
  onClick: () => void
}

export function FlashCard({ card, isFlipped, onClick }: FlashCardProps) {
  return (
    <div
      className="perspective w-full cursor-pointer"
      style={{ height: '360px' }}
      onClick={onClick}
    >
      <motion.div
        className="preserve-3d relative h-full w-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformOrigin: 'center' }}
      >
        {/* Frente */}
        <div
          className="backface-hidden absolute inset-0 rounded-2xl border border-border/60 bg-surface-1"
          style={{
            backfaceVisibility: 'hidden',
            boxShadow: '0 0 0 1px rgb(255 255 255 / 0.04) inset, 0 24px 48px -12px rgb(0 0 0 / 0.5)',
          }}
        >
          <FlashCardFront front={card.front} hint={card.hint} />
        </div>

        {/* Verso */}
        <div
          className="backface-hidden absolute inset-0 rounded-2xl border border-accent/30"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #16161a 0%, #1a1a22 100%)',
            boxShadow: '0 0 0 1px rgb(79 142 247 / 0.15) inset, 0 24px 48px -12px rgb(0 0 0 / 0.5)',
          }}
        >
          <FlashCardBack back={card.back} />
        </div>
      </motion.div>
    </div>
  )
}
