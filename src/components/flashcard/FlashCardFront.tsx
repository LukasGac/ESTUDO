interface FlashCardFrontProps {
  front: string
  hint?: string
}

export function FlashCardFront({ front, hint }: FlashCardFrontProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-10 text-center">
      <p
        className="text-2xl font-semibold leading-snug text-text"
        style={{ letterSpacing: '-0.02em' }}
      >
        {front}
      </p>
      {hint && (
        <p className="text-sm italic text-text-subtle">💡 {hint}</p>
      )}
    </div>
  )
}
