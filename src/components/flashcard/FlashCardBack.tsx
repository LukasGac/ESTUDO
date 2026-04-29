interface FlashCardBackProps {
  back: string
}

export function FlashCardBack({ back }: FlashCardBackProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-10 text-center">
      <div className="mb-5 h-px w-12 rounded-full bg-accent/30" />
      <p className="whitespace-pre-wrap text-base leading-relaxed text-text">{back}</p>
    </div>
  )
}
