'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GardenIdentityPreview from '@/components/GardenIdentityPreview'

/**
 * Onboarding modal. Asks for the user's name with a live garden preview.
 * Stays open until the user creates their garden.
 */
export default function WelcomeModal({ open, onCreate }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setName('')
      // small delay then focus
      setTimeout(() => inputRef.current?.focus(), 280)
    }
  }, [open])

  const trimmed = name.trim()
  const canCreate = trimmed.length > 0

  const submit = (e) => {
    e?.preventDefault?.()
    if (!canCreate) return
    onCreate(trimmed)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute inset-0 backdrop-blur-md"
            style={{ background: 'hsl(var(--background) / 0.85)' }} />
          <motion.div
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-2xl bg-card border border-border paper-tile hand-drawn-border overflow-hidden"
          >
            <form onSubmit={submit} className="px-8 pt-7 pb-6">
              {/* tiny daisy + tagline */}
              <div className="flex items-center gap-3 mb-5">
                <svg width="28" height="28" viewBox="0 0 60 60" aria-hidden>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ellipse key={i} cx="30" cy="14" rx="5" ry="10"
                      transform={`rotate(${i * 45} 30 30)`}
                      fill="#FBFAF3" stroke="hsl(var(--daisy-clay))" strokeWidth="0.8" />
                  ))}
                  <circle cx="30" cy="30" r="6" fill="hsl(var(--daisy-butter))" stroke="hsl(var(--daisy-clay))" strokeWidth="1" />
                </svg>
                <div className="leading-tight">
                  <div className="font-serif-display italic text-lg text-[hsl(var(--daisy-clay))]">Dhwani</div>
                  <div className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground font-sans-clean">memory garden</div>
                </div>
              </div>

              <h2 className="font-serif-display text-[26px] leading-snug text-foreground mb-1" style={{ fontWeight: 500 }}>
                What should we call your garden?
              </h2>
              <p className="text-sm text-muted-foreground italic font-serif-display mb-6">
                A quiet place to keep the ordinary days.
              </p>

              <label className="block">
                <span className="block text-[10px] uppercase tracking-[0.24em] text-muted-foreground/80 font-sans-clean mb-2">
                  Your name
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={48}
                  placeholder="Sophia"
                  className="w-full bg-transparent border-b-2 border-border focus:border-[hsl(var(--daisy-clay))] outline-none text-2xl font-serif-display py-2 text-foreground placeholder:text-muted-foreground/60 transition-colors"
                />
              </label>

              {/* live preview */}
              <div className="mt-6 rounded-lg px-4 py-3 bg-muted/40 border border-border/60">
                <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/80 font-sans-clean">
                  Your garden will appear as
                </div>
                <div className="mt-2">
                  <GardenIdentityPreview name={trimmed} nameClassName="text-[22px]" />
                </div>
              </div>

              <button
                type="submit"
                disabled={!canCreate}
                className={`mt-7 w-full rounded-full py-3 font-serif-display text-[15px] tracking-wide transition-all ${
                  canCreate
                    ? 'bg-[hsl(var(--daisy-clay))] text-[hsl(var(--daisy-bg))] hover:opacity-90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                Create Garden
              </button>

              <p className="mt-5 text-[10px] text-center uppercase tracking-[0.28em] text-muted-foreground/60 font-sans-clean">
                Crafted by Dhwani
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
