import { AnimatePresence, motion } from 'framer-motion'
import { Rating } from '@/types'

interface RatingButtonsProps {
  visible: boolean
  onRate: (r: Rating) => void
}

const RATINGS: {
  rating: Rating
  label: string
  sublabel: string
  key: string
  base: string
  pill: string
}[] = [
  {
    rating: 'wrong',
    label: 'Errei',
    sublabel: 'vejo de novo hoje',
    key: '1',
    base: 'border-red-500/25 bg-red-500/8 text-red-400 hover:bg-red-500/15 hover:border-red-500/40',
    pill: 'bg-red-500/15 text-red-500/60',
  },
  {
    rating: 'hard',
    label: 'Difícil',
    sublabel: 'intervalo reduzido',
    key: '2',
    base: 'border-amber-500/25 bg-amber-500/8 text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/40',
    pill: 'bg-amber-500/15 text-amber-500/60',
  },
  {
    rating: 'correct',
    label: 'Acertei',
    sublabel: 'próximo intervalo',
    key: '3',
    base: 'border-emerald-500/25 bg-emerald-500/8 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/40',
    pill: 'bg-emerald-500/15 text-emerald-500/60',
  },
]

export function RatingButtons({ visible, onRate }: RatingButtonsProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex gap-2.5"
        >
          {RATINGS.map(({ rating, label, sublabel, key, base, pill }) => (
            <button
              key={rating}
              onClick={() => onRate(rating)}
              aria-keyshortcuts={key}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border py-4 text-sm font-medium transition-all duration-150 active:scale-[0.98] ${base}`}
            >
              <span className={`absolute right-2.5 top-2.5 rounded px-1.5 py-0.5 text-[10px] font-mono font-medium leading-none ${pill}`}>
                {key}
              </span>
              <span className="font-semibold">{label}</span>
              <span className="text-[11px] opacity-45">{sublabel}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
