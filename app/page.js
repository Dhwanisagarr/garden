'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Trash2, RefreshCw, ImagePlus } from 'lucide-react'
import { toast } from 'sonner'

import DaisyToggle from '@/components/DaisyToggle'
import Botanical from '@/components/Botanical'
import SVGDefs from '@/components/SVGDefs'
import { botanicalForMonth } from '@/lib/botanicals'
import { dateKey, putImage, deleteImage, getMonthImages } from '@/lib/daisy-db'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function daysInMonth(year, month1) {
  return new Date(year, month1, 0).getDate()
}
function firstWeekday(year, month1) {
  return new Date(year, month1 - 1, 1).getDay() // 0=Sun
}

function App() {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1) // 1-indexed
  const [images, setImages] = useState({}) // dateKey -> dataURL
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [direction, setDirection] = useState(0) // -1 prev, +1 next
  const [preview, setPreview] = useState(null) // dateKey
  const [petals, setPetals] = useState([])     // ephemeral floating petals
  const [hoveredDay, setHoveredDay] = useState(null)
  const fileInputRef = useRef(null)
  const pendingDayRef = useRef(null)

  // ----- mount: theme + load images
  useEffect(() => {
    setMounted(true)
    const saved = typeof window !== 'undefined' ? localStorage.getItem('daisy-theme') : null
    const dark = saved === 'dark'
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  // Load month images whenever year/month changes
  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const imgs = await getMonthImages(year, month)
        if (!cancel) setImages(imgs)
      } catch (e) {
        console.error('load month error', e)
      }
    })()
    return () => { cancel = true }
  }, [year, month])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('daisy-theme', next ? 'dark' : 'light')
  }

  const goPrev = () => { setDirection(-1); setMonth(m => { if (m === 1) { setYear(y=>y-1); return 12 } return m-1 }) ; emitPetals() }
  const goNext = () => { setDirection(+1); setMonth(m => { if (m === 12){ setYear(y=>y+1); return 1 } return m+1 }) ; emitPetals() }

  function emitPetals() {
    const batch = Array.from({ length: 6 }).map((_, i) => ({
      id: Math.random().toString(36).slice(2),
      left: 8 + Math.random() * 84,
      top: 6 + Math.random() * 24,
      dx: (Math.random() - 0.5) * 80,
      dy: 40 + Math.random() * 80,
      rot: (Math.random() - 0.5) * 180,
      delay: Math.random() * 0.4,
    }))
    setPetals(prev => [...prev, ...batch])
    setTimeout(() => {
      setPetals(prev => prev.slice(batch.length))
    }, 2600)
  }

  // ---------------- Day tile interactions
  const openPicker = (day) => {
    pendingDayRef.current = day
    fileInputRef.current?.click()
  }
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    const day = pendingDayRef.current
    pendingDayRef.current = null
    if (!file || !day) return

    // Read as DataURL (downscale a bit for storage friendliness)
    const dataUrl = await fileToScaledDataURL(file, 1400)
    const key = dateKey(year, month, day)
    try {
      await putImage(key, dataUrl)
      setImages(prev => ({ ...prev, [key]: dataUrl }))
      toast.success('Memory added', { description: `${MONTH_NAMES[month-1]} ${day}` })
      emitPetals()
    } catch (err) {
      console.error(err)
      toast.error('Could not save image')
    }
  }

  const removeMemory = async (key) => {
    try {
      await deleteImage(key)
      setImages(prev => {
        const n = { ...prev }; delete n[key]; return n
      })
      toast.success('Memory removed')
    } catch (e) {
      toast.error('Could not remove')
    }
  }

  // ---------------- Calendar grid build
  const grid = useMemo(() => {
    const dim = daysInMonth(year, month)
    const start = firstWeekday(year, month)
    const cells = []
    // leading blanks
    for (let i = 0; i < start; i++) cells.push({ blank: true, key: `b-${i}` })
    for (let d = 1; d <= dim; d++) cells.push({ day: d, key: dateKey(year, month, d) })
    // pad to multiple of 7
    while (cells.length % 7 !== 0) cells.push({ blank: true, key: `tb-${cells.length}` })
    return cells
  }, [year, month])

  const memoryCount = Object.keys(images).length
  const botanical = botanicalForMonth(month)

  // Double click vs tap detection: desktop double-click, mobile single-tap
  const isTouchRef = useRef(false)
  useEffect(() => {
    const setTouch = () => { isTouchRef.current = true }
    window.addEventListener('touchstart', setTouch, { once: true, passive: true })
    return () => window.removeEventListener('touchstart', setTouch)
  }, [])

  if (!mounted) return null

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground relative">
      <SVGDefs />

      {/* Floating petals overlay */}
      <div className="pointer-events-none absolute inset-0 z-40">
        <AnimatePresence>
          {petals.map(p => (
            <span
              key={p.id}
              className="absolute animate-petal"
              style={{
                left: `${p.left}%`, top: `${p.top}%`,
                '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg`,
                animationDelay: `${p.delay}s`
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <ellipse cx="7" cy="7" rx="3" ry="6" fill={isDark ? '#D8D0C4' : '#E3C66A'} opacity="0.85" />
              </svg>
            </span>
          ))}
        </AnimatePresence>
      </div>

      {/* hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <div className="h-full w-full grid grid-cols-[300px_1fr] gap-0">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside className="h-full flex flex-col justify-between p-6 border-r border-border/60 relative"
          style={{ background: 'hsl(var(--daisy-paper))' }}>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-handwritten text-3xl leading-none text-[hsl(var(--daisy-clay))]">daisy</p>
                <p className="text-[11px] uppercase tracking-[0.22em] mt-1 text-muted-foreground">memory garden</p>
              </div>
              <DaisyToggle isDark={isDark} onToggle={toggleTheme} />
            </div>

            <div className="mt-8">
              <p className="font-handwritten text-2xl text-[hsl(var(--daisy-ink))]">{botanical.name}</p>
              <p className="text-xs text-muted-foreground mt-1 italic">
                {memoryCount === 0 ? 'A still garden. Plant a memory.' :
                  `${memoryCount} ${memoryCount === 1 ? 'bloom' : 'blooms'} this month`}
              </p>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-center my-4 min-h-0">
            <div className="w-full h-[58vh] min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${year}-${month}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.55 }}
                  className="w-full h-full"
                >
                  <Botanical kind={botanical.key} count={memoryCount} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground font-sans-clean leading-relaxed">
            <p className="italic">"Ordinary days, gently kept."</p>
            <p className="mt-2 opacity-70">Your memories live privately on this device.</p>
          </div>
        </aside>

        {/* ---------------- MAIN ---------------- */}
        <main className="h-full flex flex-col px-8 py-6 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6 select-none">
              <button onClick={goPrev}
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Previous month">
                <ChevronLeft className="w-6 h-6" strokeWidth={1.4} />
              </button>
              <AnimatePresence mode="wait">
                <motion.h1
                  key={`${year}-${month}`}
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -direction * 30 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="font-serif-display text-4xl md:text-5xl tracking-tight"
                  style={{ fontWeight: 500, letterSpacing: '-0.01em' }}
                >
                  <span className="text-[hsl(var(--daisy-ink))]">{MONTH_NAMES[month-1]}</span>{' '}
                  <span className="text-[hsl(var(--daisy-clay))] italic font-handwritten text-5xl md:text-6xl ml-1">{year}</span>
                </motion.h1>
              </AnimatePresence>
              <button onClick={goNext}
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Next month">
                <ChevronRight className="w-6 h-6" strokeWidth={1.4} />
              </button>
            </div>

            <button
              onClick={() => { const t = new Date(); setYear(t.getFullYear()); setMonth(t.getMonth()+1); emitPetals() }}
              className="text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors font-sans-clean"
            >
              Today
            </button>
          </div>

          {/* Weekday strip */}
          <div className="grid grid-cols-7 gap-3 mb-2 px-1">
            {WEEKDAYS.map(w => (
              <div key={w} className="text-center text-[11px] tracking-[0.18em] uppercase text-muted-foreground/70 font-sans-clean">
                {w}
              </div>
            ))}
          </div>

          {/* Calendar grid - fills remaining viewport */}
          <div className="flex-1 min-h-0 relative">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={`${year}-${month}-grid`}
                custom={direction}
                initial={{ opacity: 0, x: direction * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 50 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 grid grid-cols-7 gap-3 auto-rows-fr"
              >
                {grid.map((cell, idx) => {
                  if (cell.blank) {
                    return <div key={cell.key} className="opacity-0" />
                  }
                  const key = cell.key
                  const img = images[key]
                  const isToday = (
                    today.getFullYear() === year &&
                    today.getMonth() + 1 === month &&
                    today.getDate() === cell.day
                  )
                  return (
                    <DayTile
                      key={key}
                      day={cell.day}
                      dKey={key}
                      img={img}
                      isToday={isToday}
                      onActivate={() => openPicker(cell.day)}
                      onPreview={() => setPreview(key)}
                      onDelete={() => removeMemory(key)}
                      onReplace={() => openPicker(cell.day)}
                      isTouchRef={isTouchRef}
                      hovered={hoveredDay === cell.day}
                      onHover={(h) => setHoveredDay(h ? cell.day : null)}
                    />
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Full-screen preview */}
      <AnimatePresence>
        {preview && images[preview] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
          >
            <div className="absolute inset-0 backdrop-blur-md" style={{ background: 'hsl(var(--background) / 0.85)' }} />
            <motion.div
              className="relative max-w-[88vw] max-h-[86vh] flex flex-col items-center"
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative paper-tile hand-drawn-border rounded-lg p-3">
                <img src={images[preview]} alt="memory"
                  className="max-w-[84vw] max-h-[74vh] object-contain rounded" />
              </div>
              <div className="mt-4 flex items-center gap-4">
                <span className="font-handwritten text-2xl text-[hsl(var(--daisy-ink))]">
                  {formatDateLabel(preview)}
                </span>
                <button onClick={() => { const d = parseInt(preview.split('-')[2],10); openPicker(d); setPreview(null) }}
                  className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition">
                  <RefreshCw className="w-3.5 h-3.5" /> Replace
                </button>
                <button onClick={() => { removeMemory(preview); setPreview(null) }}
                  className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-destructive/90 hover:text-destructive-foreground transition">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------- DayTile component ----------
function DayTile({ day, dKey, img, isToday, onActivate, onPreview, onDelete, onReplace, isTouchRef, hovered, onHover }) {
  const clickTimer = useRef(null)

  const handleClick = (e) => {
    if (img) {
      // single click on filled tile -> preview
      onPreview()
      return
    }
    // empty tile
    if (isTouchRef.current) {
      onActivate()
    }
    // desktop empty: do nothing, wait for dblclick
  }
  const handleDoubleClick = () => {
    if (!img) onActivate()
    else onPreview()
  }

  return (
    <motion.div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="relative paper-tile hand-drawn-border rounded-lg overflow-hidden cursor-pointer group min-h-0 w-full h-full"
    >
      {/* Date number */}
      <div className={`absolute top-1.5 left-2 z-10 font-serif-display text-[13px] leading-none ${
        isToday ? 'text-[hsl(var(--daisy-clay))] font-semibold' : 'text-[hsl(var(--daisy-ink))]/70'
      }`}>
        {day}
        {isToday && (
          <span className="block w-1 h-1 rounded-full bg-[hsl(var(--daisy-clay))] mt-0.5" />
        )}
      </div>

      {/* Image */}
      {img ? (
        <>
          <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/10 pointer-events-none" />
          {/* hover actions */}
          <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/40 to-transparent">
            <button
              onClick={(e) => { e.stopPropagation(); onReplace() }}
              title="Replace"
              className="w-6 h-6 rounded-full bg-white/85 hover:bg-white flex items-center justify-center">
              <RefreshCw className="w-3 h-3 text-[hsl(var(--daisy-ink))]" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              title="Delete"
              className="w-6 h-6 rounded-full bg-white/85 hover:bg-white flex items-center justify-center">
              <Trash2 className="w-3 h-3 text-[hsl(var(--daisy-ink))]" />
            </button>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            animate={{ opacity: hovered ? 0.85 : 0.32, scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center"
          >
            <ImagePlus className="w-5 h-5 text-[hsl(var(--daisy-ink))]/60" strokeWidth={1.2} />
            {hovered && (
              <motion.span
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="font-handwritten text-[13px] mt-1 text-[hsl(var(--daisy-ink))]/70 text-center px-2 leading-tight"
              >
                double-click<br/>to add memory
              </motion.span>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

// ---------- helpers ----------
function formatDateLabel(key) {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

async function fileToScaledDataURL(file, maxDim = 1400) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        const scale = Math.min(1, maxDim / Math.max(width, height))
        const w = Math.round(width * scale)
        const h = Math.round(height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        // Use jpeg for size, fallback to png if has alpha (rare for photos)
        const out = canvas.toDataURL('image/jpeg', 0.88)
        resolve(out)
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default App
