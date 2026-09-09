'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings as SettingsIcon, X, Image as ImageIcon, RotateCcw, Check, Palette } from 'lucide-react'
import GardenIdentityPreview from '@/components/GardenIdentityPreview'

const PRESET_COLORS = [
  { name: 'Default Linen', hex: '#F7F3EA' },
  { name: 'Sage Leaf',    hex: '#8DAA91' },
  { name: 'Golden Sun',   hex: '#F4E04D' },
  { name: 'Dusty Rose',   hex: '#E88D9E' },
  { name: 'Slate Blue',   hex: '#6C8EA4' },
  { name: 'Terracotta',   hex: '#C86D51' },
  { name: 'Amber Dusk',   hex: '#D99B26' },
  { name: 'Plum Mist',    hex: '#A0718F' },
]

/**
 * Settings popover: Garden Name + Background Personalization (Colors & Image Upload).
 */
export default function SettingsPanel({
  gardenName,
  bgColor,
  bgImage,
  onSaveName,
  onSaveBgColor,
  onSaveBgImage,
  onResetBg,
  onOpenLanding,
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('name') // 'name' | 'color' | 'image'
  const [draftName, setDraftName] = useState(gardenName)
  const [customColor, setCustomColor] = useState(bgColor || '#F7F3EA')
  const wrapperRef = useRef(null)
  const nameInputRef = useRef(null)
  const imageInputRef = useRef(null)

  useEffect(() => { setDraftName(gardenName) }, [gardenName])
  useEffect(() => { setCustomColor(bgColor || '#F7F3EA') }, [bgColor])

  useEffect(() => {
    if (!open) return
    if (tab === 'name') {
      setTimeout(() => nameInputRef.current?.focus(), 120)
    }
    function onDoc(e) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, tab])

  const trimmedName = draftName.trim()
  const canSaveName = trimmedName.length > 0 && trimmedName !== gardenName

  const saveName = (e) => {
    e?.preventDefault?.()
    if (!canSaveName) return
    onSaveName(trimmedName)
    setOpen(false)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target.result
      onSaveBgImage(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Settings"
        title="Settings & Personalization"
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
            className="absolute right-0 mt-2 w-[340px] rounded-2xl bg-popover border border-border shadow-lg overflow-hidden z-50"
            style={{ boxShadow: '0 14px 40px -10px hsl(var(--daisy-ink) / 0.25)' }}
          >
            <div className="px-5 pt-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-handwritten text-[22px] text-[hsl(var(--daisy-clay))] leading-none">
                  personalization
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Settings Tabs */}
              <div className="flex items-center gap-1 border-b border-border mb-4 pb-1.5">
                <button
                  type="button"
                  onClick={() => setTab('name')}
                  className={`text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-md font-sans-clean transition-colors ${
                    tab === 'name'
                      ? 'bg-muted text-[hsl(var(--daisy-clay))] font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Garden Name
                </button>
                <button
                  type="button"
                  onClick={() => setTab('color')}
                  className={`text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-md font-sans-clean transition-colors flex items-center gap-1 ${
                    tab === 'color'
                      ? 'bg-muted text-[hsl(var(--daisy-clay))] font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Palette className="w-3 h-3" /> Color
                </button>
                <button
                  type="button"
                  onClick={() => setTab('image')}
                  className={`text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-md font-sans-clean transition-colors flex items-center gap-1 ${
                    tab === 'image'
                      ? 'bg-muted text-[hsl(var(--daisy-clay))] font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" /> Wallpaper
                </button>
              </div>

              {/* TAB 1: Garden Name */}
              {tab === 'name' && (
                <form onSubmit={saveName}>
                  <label className="block">
                    <span className="block text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80 font-sans-clean mb-1.5">
                      Garden Name
                    </span>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      maxLength={48}
                      placeholder="Dhwani"
                      className="w-full bg-transparent border-b border-border focus:border-[hsl(var(--daisy-clay))] outline-none text-lg font-serif-display py-1.5 text-foreground transition-colors"
                    />
                  </label>

                  <div className="mt-3 rounded-md px-3 py-2 bg-muted/40 border border-border/60">
                    <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/80 font-sans-clean">
                      Preview
                    </div>
                    <div className="mt-1.5">
                      <GardenIdentityPreview name={trimmedName} nameClassName="text-[16px]" compact />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors font-sans-clean"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!canSaveName}
                      className={`text-xs uppercase tracking-[0.22em] px-4 py-1.5 rounded-full font-sans-clean transition-all ${
                        canSaveName
                          ? 'bg-[hsl(var(--daisy-clay))] text-[hsl(var(--daisy-bg))] hover:opacity-90'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      Save
                    </button>
                  </div>

                  {onOpenLanding && (
                    <div className="mt-4 pt-3 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          onOpenLanding()
                        }}
                        className="text-xs text-muted-foreground hover:text-[hsl(var(--daisy-clay))] italic font-serif-display flex items-center gap-1.5 transition-colors"
                      >
                        <span>Return to Entrance Landing →</span>
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* TAB 2: Background Color */}
              {tab === 'color' && (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80 font-sans-clean mb-2">
                    Curated Color Palette
                  </div>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {PRESET_COLORS.map(p => {
                      const isSelected = (bgColor || '#F7F3EA').toUpperCase() === p.hex.toUpperCase()
                      return (
                        <button
                          key={p.hex}
                          type="button"
                          onClick={() => onSaveBgColor(p.hex)}
                          title={p.name}
                          className="h-8 rounded-lg border border-border relative flex items-center justify-center transition-transform hover:scale-105"
                          style={{ backgroundColor: p.hex }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-neutral-800" strokeWidth={2.5} />}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3 mt-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-sans-clean">
                        Custom Color
                      </span>
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value)
                          onSaveBgColor(e.target.value)
                        }}
                        className="w-7 h-7 rounded-md border-0 cursor-pointer bg-transparent"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => onResetBg()}
                      className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground flex items-center gap-1 font-sans-clean"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Background Image */}
              {tab === 'image' && (
                <div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80 font-sans-clean mb-2">
                    Custom Wallpaper
                  </div>

                  {bgImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-border h-32 group mb-3">
                      <img src={bgImage} alt="Custom Background" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="px-3 py-1 bg-white/90 text-neutral-900 text-xs rounded-full font-sans-clean uppercase tracking-wider"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => onSaveBgImage(null)}
                          className="px-3 py-1 bg-rose-600/90 text-white text-xs rounded-full font-sans-clean uppercase tracking-wider"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full h-28 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-[hsl(var(--daisy-clay))] hover:text-foreground transition-colors mb-3"
                    >
                      <ImageIcon className="w-6 h-6 mb-1 opacity-70" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-sans-clean">Upload Background Image</span>
                    </button>
                  )}

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[9px] text-muted-foreground italic">
                      Contrast veil dynamically preserves text readability.
                    </span>
                    <button
                      type="button"
                      onClick={() => onResetBg()}
                      className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground flex items-center gap-1 font-sans-clean shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 text-[9px] text-center uppercase tracking-[0.28em] text-muted-foreground/60 font-sans-clean">
                Crafted by Dhwani
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
