'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * A hand-drawn botanical "preserve this month" icon:
 * a small leaf with a downward arrow tip emerging from its stem.
 */
function LeafDownloadIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {/* leaf */}
      <path d="M 14 3 C 6 5, 4 13, 7 18 C 11 17, 16 12, 18 5 C 18 4, 16 3, 14 3 Z"
        fill="currentColor" opacity="0.32" />
      <path d="M 14 3 C 6 5, 4 13, 7 18 C 11 17, 16 12, 18 5 C 18 4, 16 3, 14 3 Z"
        stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinejoin="round" />
      {/* leaf vein */}
      <path d="M 17 4 Q 12 11, 8 17" stroke="currentColor" strokeWidth="0.9" fill="none" opacity="0.55" />
      {/* stem turning into a downward arrow */}
      <path d="M 7 18 Q 11 21, 14 24" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M 11 22 L 14 24.5 L 17 22" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ExportPanel({
  disabled,
  onExportPDF,
  onExportPNG,
  onExportInstagramCarousel,
  onExportInstagramStory,
  monthLabel,
}) {
  const [open, setOpen] = useState(false)
  const [hover, setHover] = useState(false)
  const [busy, setBusy] = useState(null) // 'pdf' | 'png' | 'ig-carousel' | 'ig-story' | null
  const wrapperRef = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const tooltip = disabled
    ? 'Add memories to preserve this month.'
    : 'Preserve this month'

  const handleExport = async (type) => {
    if (busy) return
    setBusy(type)
    try {
      if (type === 'pdf') await onExportPDF?.()
      else if (type === 'png') await onExportPNG?.()
      else if (type === 'ig-carousel') await onExportInstagramCarousel?.()
      else if (type === 'ig-story') await onExportInstagramStory?.()
    } finally {
      setBusy(null)
      setOpen(false)
    }
  }

  const isBusy = Boolean(busy)

  return (
    <div
      ref={wrapperRef}
      className="absolute bottom-4 right-6 z-30"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* tooltip */}
      <AnimatePresence>
        {hover && !open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full right-0 mb-2 whitespace-nowrap"
          >
            <div className="px-3 py-1.5 rounded-full bg-card border border-border shadow-sm font-handwritten text-[15px] text-[hsl(var(--daisy-clay))] italic">
              {tooltip}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the icon button */}
      <button
        type="button"
        disabled={disabled}
        aria-label={tooltip}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all focus:outline-none ${
          disabled
            ? 'opacity-35 cursor-not-allowed text-[hsl(var(--daisy-ink))]'
            : 'opacity-70 hover:opacity-100 text-[hsl(var(--daisy-clay))] hover:text-[hsl(var(--daisy-ink))] hover:-translate-y-0.5'
        }`}
      >
        <LeafDownloadIcon size={26} />
      </button>

      {/* the menu */}
      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full right-0 mb-3 w-[250px] rounded-2xl bg-popover border border-border shadow-lg overflow-hidden"
            style={{ boxShadow: '0 14px 40px -10px hsl(var(--daisy-ink) / 0.25)' }}
          >
            <div className="px-4 pt-3 pb-2 border-b border-border/60">
              <div className="font-handwritten text-[20px] text-[hsl(var(--daisy-clay))] leading-none">preserve</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1 font-sans-clean">
                {monthLabel}
              </div>
            </div>
            <ul className="py-1">
              <li>
                <button
                  onClick={() => handleExport('pdf')}
                  disabled={isBusy && busy !== 'pdf'}
                  className="w-full text-left px-4 py-2.5 flex items-baseline justify-between gap-3 hover:bg-muted/70 transition-colors"
                >
                  <span className="font-serif-display text-[15px] text-foreground">
                    {busy === 'pdf' ? 'pressing flowers…' : 'as a PDF page'}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 font-sans-clean">A4</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleExport('png')}
                  disabled={isBusy && busy !== 'png'}
                  className="w-full text-left px-4 py-2.5 flex items-baseline justify-between gap-3 hover:bg-muted/70 transition-colors"
                >
                  <span className="font-serif-display text-[15px] text-foreground">
                    {busy === 'png' ? 'pressing flowers…' : 'as a PNG keepsake'}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 font-sans-clean">HiRes</span>
                </button>
              </li>
            </ul>
            <div className="px-4 pt-2 pb-1 border-t border-border/60">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-sans-clean">
                Export for Instagram
              </div>
            </div>
            <ul className="py-1 pb-1">
              <li>
                <button
                  onClick={() => handleExport('ig-carousel')}
                  disabled={isBusy && busy !== 'ig-carousel'}
                  className="w-full text-left px-4 py-2.5 flex items-baseline justify-between gap-3 hover:bg-muted/70 transition-colors"
                >
                  <span className="font-serif-display text-[15px] text-foreground">
                    {busy === 'ig-carousel' ? 'arranging slides…' : 'Carousel'}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 font-sans-clean">1080×1350</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleExport('ig-story')}
                  disabled={isBusy && busy !== 'ig-story'}
                  className="w-full text-left px-4 py-2.5 flex items-baseline justify-between gap-3 hover:bg-muted/70 transition-colors"
                >
                  <span className="font-serif-display text-[15px] text-foreground">
                    {busy === 'ig-story' ? 'arranging slides…' : 'Story'}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 font-sans-clean">1080×1920</span>
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
