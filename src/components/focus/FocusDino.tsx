import { motion } from 'framer-motion'
import { DinoType, DinoSize } from '@/types'
import { cn } from '@/lib/utils'

// ── Tamanhos por estágio ──────────────────────────────────────────────────────

export const SIZE_PX: Record<DinoSize, number> = {
  baby:  200,
  young: 200,
  adult: 200,
  elder: 200,
}

export const SIZE_LABELS: Record<DinoSize, string> = {
  baby:  'Filhote',
  young: 'Jovem',
  adult: 'Adulto',
  elder: 'Ancião',
}

// ── Imagens por tipo e estágio (null = ainda sem imagem, usa SVG) ─────────────

const DINO_IMAGES: Partial<Record<DinoType, Record<DinoSize, string>>> = {
  't-rex': {
    baby:  '/dinos/trex/baby.png',
    young: '/dinos/trex/young.png',
    adult: '/dinos/trex/adult.png',
    elder: '/dinos/trex/elder.png',
  },
  'brachiosaurus': {
    baby:  '/dinos/brachio/baby.png',
    young: '/dinos/brachio/young.png',
    adult: '/dinos/brachio/adult.png',
    elder: '/dinos/brachio/elder.png',
  },
  "pterodactyl": {
    baby:  '/dinos/ptero/baby.png',
    young: '/dinos/ptero/young.png',
    adult: '/dinos/ptero/adult.png',
    elder: '/dinos/ptero/elder.png',
  },
  'triceratops': {
    baby:  '/dinos/trice/baby.png',
    young: '/dinos/trice/young.png',
    adult: '/dinos/trice/adult.png',
    elder: '/dinos/trice/elder.png',
  }
}

// ── Imagens de ovo por tipo ───────────────────────────────────────────────────

const DINO_EGG_IMAGES: Partial<Record<DinoType, string>> = {
  't-rex':         '/dinos/trex/egg.png',
  'brachiosaurus': '/dinos/brachio/egg.png',
  'pterodactyl':   '/dinos/ptero/egg.png',
  'triceratops':   '/dinos/trice/egg.png',
}

// ── Paleta dos dinos (fallback SVG) ──────────────────────────────────────────

const PALETTE: Record<DinoType, { body: string; shadow: string; light: string; eye: string }> = {
  't-rex':         { body: '#22c55e', shadow: '#15803d', light: '#86efac', eye: '#052e16' },
  'triceratops':   { body: '#38bdf8', shadow: '#0284c7', light: '#bae6fd', eye: '#082f49' },
  'pterodactyl':   { body: '#c084fc', shadow: '#7c3aed', light: '#ede9fe', eye: '#2e1065' },
  'brachiosaurus': { body: '#fb923c', shadow: '#c2410c', light: '#fed7aa', eye: '#431407' },
}

// ── SVG de ovo ────────────────────────────────────────────────────────────────

function DinoEgg({ body, shadow, progress }: { body: string; shadow: string; progress: number }) {
  const crackPct = Math.max(0, Math.min(1, (progress - 0.08) / 0.45))
  return (
    <g>
      <ellipse cx="50" cy="108" rx="22" ry="5" fill="black" opacity="0.12" />
      <ellipse cx="50" cy="70" rx="26" ry="32" fill={body} />
      <ellipse cx="40" cy="52" rx="7" ry="11" fill="white" opacity="0.22" transform="rotate(-12 40 52)" />
      <ellipse cx="50" cy="70" rx="26" ry="32" fill={shadow} opacity="0.08" />
      {crackPct > 0 && (
        <g opacity={crackPct} stroke={shadow} strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M50 44 L47 54 L53 60 L49 70 L55 80" />
          <path d="M53 60 L59 56 L57 64" />
          <path d="M49 70 L43 74" />
        </g>
      )}
    </g>
  )
}

// ── Fallback SVGs (cute flat) ─────────────────────────────────────────────────

function TRexSVG({ body, shadow, light, eye }: { body: string; shadow: string; light: string; eye: string }) {
  return (
    <g>
      <ellipse cx="52" cy="113" rx="28" ry="5" fill="black" opacity="0.1" />
      <path d="M20 76 Q6 88 8 72 Q10 56 26 64" fill={body} />
      <path d="M20 76 Q6 88 8 72 Q10 56 26 64" fill={shadow} opacity="0.2" />
      <ellipse cx="54" cy="76" rx="28" ry="21" fill={body} />
      <ellipse cx="48" cy="70" rx="14" ry="8" fill={light} opacity="0.3" />
      <path d="M68 60 Q72 48 76 36" stroke={body} strokeWidth="16" strokeLinecap="round" fill="none" />
      <ellipse cx="80" cy="30" rx="20" ry="16" fill={body} />
      <ellipse cx="74" cy="24" rx="9" ry="6" fill={light} opacity="0.4" />
      <path d="M66 30 Q74 24 96 26 Q98 30 96 34 Q80 30 66 34 Z" fill={shadow} />
      <path d="M68 36 Q80 42 94 38 Q96 34 96 34 Q80 34 66 34 Z" fill={shadow} opacity="0.7" />
      <circle cx="74" cy="33" r="2" fill="white" />
      <circle cx="80" cy="32" r="2" fill="white" />
      <circle cx="86" cy="31" r="2" fill="white" />
      <circle cx="75" cy="23" r="7" fill="white" />
      <circle cx="76" cy="23" r="4.5" fill={eye} />
      <circle cx="77" cy="22" r="1.5" fill="white" />
      <path d="M68 66 Q60 70 58 76 Q62 78 66 74" fill={shadow} opacity="0.6" />
      <path d="M40 93 Q36 106 30 114" stroke={shadow} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M30 114 Q22 115 20 112" stroke={shadow} strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M56 94 Q58 108 62 114" stroke={shadow} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M62 114 Q70 115 72 112" stroke={shadow} strokeWidth="7" strokeLinecap="round" fill="none" />
    </g>
  )
}

function TriceratopsSVG({ body, shadow, light, eye }: { body: string; shadow: string; light: string; eye: string }) {
  return (
    <g>
      <ellipse cx="50" cy="113" rx="36" ry="5" fill="black" opacity="0.1" />
      <path d="M14 76 Q4 86 6 70 Q8 54 24 66" fill={body} />
      <ellipse cx="50" cy="76" rx="34" ry="22" fill={body} />
      <ellipse cx="40" cy="68" rx="16" ry="9" fill={light} opacity="0.3" />
      <ellipse cx="74" cy="36" rx="18" ry="22" fill={shadow} opacity="0.6" />
      <ellipse cx="74" cy="36" rx="14" ry="18" fill={body} opacity="0.9" />
      <ellipse cx="76" cy="58" rx="16" ry="14" fill={body} />
      <ellipse cx="70" cy="52" rx="8" ry="6" fill={light} opacity="0.3" />
      <path d="M88 58 Q96 56 98 60 Q96 64 88 64 Z" fill={shadow} />
      <path d="M76 44 L74 26 Q76 22 78 26 Z" fill={shadow} />
      <path d="M68 42 L63 26 Q65 22 68 26 Z" fill={shadow} />
      <path d="M86 54 Q92 50 96 50 Q96 54 90 56 Z" fill={shadow} opacity="0.8" />
      <circle cx="80" cy="54" r="7" fill="white" />
      <circle cx="81" cy="54" r="4.5" fill={eye} />
      <circle cx="82" cy="53" r="1.5" fill="white" />
      <path d="M24 93 Q20 106 18 114" stroke={shadow} strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M38 96 Q36 108 34 114" stroke={shadow} strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M56 96 Q58 108 60 114" stroke={shadow} strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M70 93 Q74 106 76 114" stroke={shadow} strokeWidth="10" strokeLinecap="round" fill="none" />
    </g>
  )
}

function PterodactylSVG({ body, shadow, light, eye }: { body: string; shadow: string; light: string; eye: string }) {
  return (
    <g>
      <path d="M50 58 Q32 36 6 22 Q14 40 22 54 Q36 62 50 58 Z" fill={shadow} opacity="0.6" />
      <path d="M56 58 Q74 36 100 22 Q92 40 84 54 Q70 62 56 58 Z" fill={shadow} opacity="0.6" />
      <path d="M50 56 Q28 30 4 18 Q12 38 20 52 Q34 60 50 56 Z" fill={body} />
      <path d="M56 56 Q78 30 102 18 Q94 38 86 52 Q72 60 56 56 Z" fill={body} />
      <path d="M50 56 Q30 34 8 20 Q16 36 26 50" stroke={shadow} strokeWidth="1.5" opacity="0.4" fill="none" />
      <path d="M56 56 Q76 34 98 20 Q90 36 80 50" stroke={shadow} strokeWidth="1.5" opacity="0.4" fill="none" />
      <path d="M50 56 Q36 42 18 30" stroke={light} strokeWidth="4" strokeLinecap="round" opacity="0.35" fill="none" />
      <path d="M56 56 Q70 42 88 30" stroke={light} strokeWidth="4" strokeLinecap="round" opacity="0.35" fill="none" />
      <ellipse cx="53" cy="66" rx="12" ry="9" fill={body} />
      <ellipse cx="50" cy="62" rx="6" ry="4" fill={light} opacity="0.35" />
      <path d="M47 52 Q44 36 48 26 Q52 22 56 28 Q58 36 55 52 Z" fill={shadow} opacity="0.8" />
      <path d="M47 52 Q44 36 48 28 Q52 24 55 30 Q57 38 54 52 Z" fill={body} />
      <ellipse cx="55" cy="54" rx="10" ry="9" fill={body} />
      <path d="M63 56 Q80 52 90 50 Q90 56 80 58 Q68 60 63 58 Z" fill={shadow} />
      <circle cx="58" cy="51" r="5.5" fill="white" />
      <circle cx="59" cy="51" r="3.5" fill={eye} />
      <circle cx="60" cy="50" r="1.2" fill="white" />
      <path d="M44 74 Q40 84 36 90" stroke={shadow} strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M62 74 Q66 84 70 90" stroke={shadow} strokeWidth="6" strokeLinecap="round" fill="none" />
    </g>
  )
}

function BrachiosaurusSVG({ body, shadow, light, eye }: { body: string; shadow: string; light: string; eye: string }) {
  return (
    <g>
      <ellipse cx="42" cy="113" rx="30" ry="5" fill="black" opacity="0.1" />
      <path d="M12 80 Q2 90 4 74 Q6 58 22 70" fill={body} />
      <ellipse cx="44" cy="80" rx="30" ry="22" fill={body} />
      <ellipse cx="36" cy="72" rx="14" ry="8" fill={light} opacity="0.3" />
      <path d="M60 64 Q64 52 68 40 Q72 26 78 14" stroke={body} strokeWidth="17" strokeLinecap="round" fill="none" />
      <path d="M60 64 Q64 52 68 40 Q72 26 78 14" stroke={light} strokeWidth="6" strokeLinecap="round" opacity="0.25" fill="none" />
      <ellipse cx="82" cy="12" rx="13" ry="10" fill={body} />
      <ellipse cx="76" cy="7" rx="6" ry="4" fill={light} opacity="0.35" />
      <circle cx="90" cy="10" r="2" fill={shadow} opacity="0.5" />
      <path d="M88 14 Q92 12 96 12 Q96 16 92 16 Q90 16 88 14 Z" fill={shadow} opacity="0.6" />
      <circle cx="79" cy="8" r="5.5" fill="white" />
      <circle cx="80" cy="8" r="3.5" fill={eye} />
      <circle cx="81" cy="7" r="1.2" fill="white" />
      <path d="M24 97 Q20 106 18 114" stroke={shadow} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M38 100 Q36 108 34 114" stroke={shadow} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M52 100 Q54 108 56 114" stroke={shadow} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M66 97 Q70 106 72 114" stroke={shadow} strokeWidth="11" strokeLinecap="round" fill="none" />
    </g>
  )
}

function DinoSVG({ type, px }: { type: DinoType; px: number }) {
  const { body, shadow, light, eye } = PALETTE[type]
  return (
    <svg viewBox="0 0 106 120" width={px} height={px} overflow="visible">
      {type === 't-rex'         && <TRexSVG body={body} shadow={shadow} light={light} eye={eye} />}
      {type === 'triceratops'   && <TriceratopsSVG body={body} shadow={shadow} light={light} eye={eye} />}
      {type === 'pterodactyl'   && <PterodactylSVG body={body} shadow={shadow} light={light} eye={eye} />}
      {type === 'brachiosaurus' && <BrachiosaurusSVG body={body} shadow={shadow} light={light} eye={eye} />}
    </svg>
  )
}

// ── Idle animations para o jardim ─────────────────────────────────────────────

type IdleTarget = { rotate?: number[]; y?: number[]; scale?: number[] }

const IDLE: Record<DinoType, IdleTarget> = {
  't-rex':         { rotate: [-1.5, 1.5, -1.5], y: [0, -3, 0] },
  'triceratops':   { y: [0, -4, 0], scale: [1, 1.02, 1] },
  'pterodactyl':   { rotate: [-3, 3, -3], y: [-2, 2, -2] },
  'brachiosaurus': { rotate: [-1, 1, -1], y: [0, -3, 0] },
}

// ── Componente principal ──────────────────────────────────────────────────────

interface FocusDinoProps {
  type: DinoType
  size?: DinoSize
  progress?: number   // 0–1: controla transição ovo → dino na sessão ativa
  killed?: boolean
  className?: string
  animate?: boolean   // idle animation no jardim
}

export function FocusDino({
  type,
  size = 'adult',
  progress = 1,
  killed = false,
  className,
  animate = false,
}: FocusDinoProps) {
  const px = SIZE_PX[size]
  const hasImage = !!DINO_IMAGES[type]
  const imageSrc = hasImage ? DINO_IMAGES[type]![size] : null

  const BIRTH_THRESHOLD = 0.4
  const eggOpacity  = Math.max(0, Math.min(1, 1 - progress / BIRTH_THRESHOLD))
  const dinoOpacity = Math.max(0, Math.min(1, (progress - BIRTH_THRESHOLD * 0.6) / (BIRTH_THRESHOLD * 0.8)))
  const dinoScale   = 0.4 + progress * 0.6

  const killedStyle: React.CSSProperties = killed
    ? { filter: 'grayscale(1) brightness(0.35)', opacity: 0.3, transition: 'all 0.6s' }
    : {}

  // Conteúdo visual (imagem real ou SVG fallback)
  const dinoVisual = imageSrc ? (
    <img
      src={imageSrc}
      alt={`${type} ${size}`}
      width={px}
      height={px}
      className="object-contain"
      style={{ width: px, height: px, mixBlendMode: 'screen' }}
    />
  ) : (
    <DinoSVG type={type} px={px} />
  )

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: px, height: px }}
    >
      {/* Ovo (visível no início da sessão) */}
      {progress < 1 && eggOpacity > 0.02 && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: eggOpacity, transition: 'opacity 0.4s' }}
        >
          {DINO_EGG_IMAGES[type] ? (
            <img
              src={DINO_EGG_IMAGES[type]}
              alt={`ovo de ${type}`}
              width={px}
              height={px}
              className="object-contain"
              style={{ width: px, height: px, mixBlendMode: 'screen' }}
            />
          ) : (
            <svg viewBox="0 0 100 120" width={px} height={px} overflow="visible">
              <DinoEgg
                body={PALETTE[type].body}
                shadow={PALETTE[type].shadow}
                progress={progress}
              />
            </svg>
          )}
        </div>
      )}

      {/* Dino — imagem real ou SVG */}
      {animate ? (
        <motion.div
          animate={IDLE[type]}
          transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          style={killedStyle}
        >
          {dinoVisual}
        </motion.div>
      ) : (
        <div
          style={{
            opacity: progress >= 1 ? (killed ? 0.3 : 1) : dinoOpacity,
            transform: progress >= 1 ? 'scale(1)' : `scale(${dinoScale})`,
            transformOrigin: 'bottom center',
            transition: killed
              ? 'all 0.6s'
              : progress >= 1
              ? undefined
              : 'transform 0.8s ease-out, opacity 0.4s',
            ...killedStyle,
          }}
        >
          {dinoVisual}
        </div>
      )}
    </div>
  )
}
