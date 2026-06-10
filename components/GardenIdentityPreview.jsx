'use client'

/**
 * Shared left-identity preview: {Name} / MEMORY GARDEN / 🌼
 */
export default function GardenIdentityPreview({ name, nameClassName = '', compact = false }) {
  const displayName = (name || '').trim() || 'Your name'

  return (
    <div>
      <div
        className={`font-serif-display italic text-[hsl(var(--daisy-clay))] ${nameClassName}`}
        style={{ fontWeight: 400, letterSpacing: '0.01em' }}
      >
        {displayName}
      </div>
      <div className={`${compact ? 'text-[9px] tracking-[0.24em]' : 'text-[10px] tracking-[0.28em]'} uppercase text-muted-foreground font-sans-clean mt-1.5`}>
        memory garden
      </div>
      <div className={`${compact ? 'text-sm' : 'text-base'} mt-1 leading-none`} aria-hidden>🌼</div>
    </div>
  )
}
