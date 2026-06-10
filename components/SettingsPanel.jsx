'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings as SettingsIcon, X } from 'lucide-react'
import { gardenTitle } from '@/lib/garden'

/**
 * Tiny header button -> popover with editable Garden Name.
 */
export default function SettingsPanel({ gardenName, onSave }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(gardenName)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { setDraft(gardenName) }, [gardenName])

  useEffect(() => {
    if (!open) return
    setTimeout(() => inputRef.current?.focus(), 120)
    function onDoc(e) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const trimmed = draft.trim()
  const canSave = trimmed.length > 0 && trimmed !== gardenName

  const save = (e) => {
    e?.preventDefault?.()
    if (!canSave) return
    onSave(trimmed)
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Settings"
        title="Settings"
        className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-[hsl(var(--daisy-clay))] hover:bg-muted/70 transition-colors"
      >
        <SettingsIcon className="w-4 h-4" strokeWidth={1.4} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 mt-2 w-[300px] rounded-2xl bg-popover border border-border shadow-lg overflow-hidden z-50"
            style={{ boxShadow: '0 14px 40px -10px hsl(var(--daisy-ink) / 0.25)' }}
          >
            <form onSubmit={save} className="px-5 pt-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-handwritten text-[20px] text-[hsl(var(--daisy-clay))] leading-none">settings</div>
                <button type="button" onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground" aria-label="Close">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <label className="block">
                <span className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80 font-sans-clean mb-1.5">
                  Garden Name
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={48}
                  placeholder="Sophia"
                  className="w-full bg-transparent border-b border-border focus:border-[hsl(var(--daisy-clay))] outline-none text-lg font-serif-display py-1.5 text-foreground transition-colors"
                />
              </label>

              <div className="mt-3 rounded-md px-3 py-2 bg-muted/40 border border-border/60">
                <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/80 font-sans-clean">
                  Preview
                </div>
                <div className="font-serif-display italic text-[16px] text-[hsl(var(--daisy-clay))] mt-0.5">
                  {trimmed ? gardenTitle(trimmed) : 'Your Garden'}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors font-sans-clean">
                  Cancel
                </button>
                <button type="submit" disabled={!canSave}
                  className={`text-xs uppercase tracking-[0.22em] px-4 py-1.5 rounded-full font-sans-clean transition-all ${
                    canSave
                      ? 'bg-[hsl(var(--daisy-clay))] text-[hsl(var(--daisy-bg))] hover:opacity-90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}>
                  Save
                </button>
              </div>

              <div className="mt-3 text-[9px] text-center uppercase tracking-[0.28em] text-muted-foreground/60 font-sans-clean">
                made with DHWANI
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
