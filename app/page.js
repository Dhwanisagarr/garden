'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Trash2, RefreshCw, ImagePlus, Search } from 'lucide-react'
import { toast } from 'sonner'

import DaisyToggle from '@/components/DaisyToggle'
import Botanical from '@/components/Botanical'
import SVGDefs from '@/components/SVGDefs'
import { ParticleSVG, Butterfly, Firefly } from '@/components/Particles'
import ExportPanel from '@/components/ExportPanel'
import ExportSheet from '@/components/ExportSheet'
import YearInBloom from '@/components/YearInBloom'
import WelcomeModal from '@/components/WelcomeModal'
import SettingsPanel from '@/components/SettingsPanel'
import { exportAsPDF, exportAsPNG } from '@/lib/export'
import { botanicalForMonth } from '@/lib/botanicals'
import { gardenTitle, buildExportFilename } from '@/lib/garden'
import { dateKey, putImage, deleteImage, getMonthImages, listAllMemoryKeys } from '@/lib/daisy-db'

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
  const [highlightDay, setHighlightDay] = useState(null)
  const [celebration, setCelebration] = useState(null) // { kind, message } or null
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [view, setView] = useState('month')              // 'month' | 'year'
  const [yearCounts, setYearCounts] = useState({})       // { 1: 5, 2: 12, ... } for the active year
  const [gardenName, setGardenName] = useState('')       // user's personalized name
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const fileInputRef = useRef(null)
  const pendingDayRef = useRef(null)
  const exportSheetRef = useRef(null)

  // Export handlers (delegated to lib/export with the offscreen ExportSheet)
  const buildExportName = (ext) =>
    buildExportFilename({ name: gardenName, monthName: MONTH_NAMES[month - 1], year, ext })

  const handleExportPDF = async () => {
    if (!exportSheetRef.current) return
    try {
      await exportAsPDF(exportSheetRef.current, buildExportName('pdf'), { isDark })
      toast.success('Saved as PDF', { description: `${MONTH_NAMES[month-1]} ${year}` })
    } catch (e) {
      console.error('PDF export failed', e)
      toast.error('Could not export PDF')
    }
  }
  const handleExportPNG = async () => {
    if (!exportSheetRef.current) return
    try {
      await exportAsPNG(exportSheetRef.current, buildExportName('png'), { isDark })
      toast.success('Saved as PNG', { description: `${MONTH_NAMES[month-1]} ${year}` })
    } catch (e) {
      console.error('PNG export failed', e)
      toast.error('Could not export PNG')
    }
  }

  // ----- mount: theme + load images + load garden name
  useEffect(() => {
    setMounted(true)
    const saved = typeof window !== 'undefined' ? localStorage.getItem('daisy-theme') : null
    const dark = saved === 'dark'
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)

    // load garden name
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('daisy-garden-name') : null
    if (savedName && savedName.trim()) {
      setGardenName(savedName.trim())
    } else {
      setWelcomeOpen(true)
    }
  }, [])

  const handleCreateGarden = (name) => {
    const clean = name.trim()
    if (!clean) return
    setGardenName(clean)
    try { localStorage.setItem('daisy-garden-name', clean) } catch {}
    setWelcomeOpen(false)
    emitPetals({ kind: botanical?.key, count: 8 })
    toast.success('Your garden has been planted', { description: gardenTitle(clean) })
  }

  const handleRenameGarden = (name) => {
    const clean = name.trim()
    if (!clean) return
    setGardenName(clean)
    try { localStorage.setItem('daisy-garden-name', clean) } catch {}
    toast.success('Garden renamed', { description: gardenTitle(clean) })
  }

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

  // Atomic month navigation using native Date arithmetic.
  // Setting setYear inside a setMonth updater is impure and React 18
  // StrictMode double-invokes updaters — that caused the year-skipping bug.
  const navigateBy = (delta) => {
    setDirection(delta > 0 ? +1 : -1)
    const next = new Date(year, (month - 1) + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth() + 1)
    emitPetals()
  }
  const goPrev = () => navigateBy(-1)
  const goNext = () => navigateBy(+1)

  function emitPetals(opts = {}) {
    const kind = opts.kind // explicit kind wins; otherwise petal renders with month botanical at draw time
    const count = opts.count || 6
    const batch = Array.from({ length: count }).map((_, i) => ({
      id: Math.random().toString(36).slice(2),
      kind,
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
      const next = { ...images, [key]: dataUrl }
      setImages(next)
      toast.success('Memory added', { description: `${MONTH_NAMES[month-1]} ${day}` })
      emitPetals({ kind: botanical.key, count: 8 })

      // ----- Full month completion celebration (once per month) -----
      const dim = daysInMonth(year, month)
      const filledNow = Object.keys(next).length
      const celebKey = `daisy-celebrated-${year}-${String(month).padStart(2,'0')}`
      if (filledNow === dim && typeof window !== 'undefined' && !localStorage.getItem(celebKey)) {
        localStorage.setItem(celebKey, '1')
        const messages = [
          `Your ${MONTH_NAMES[month-1]} garden has fully bloomed.`,
          'Every day found its place.',
        ]
        const msg = messages[Math.floor(Math.random() * messages.length)]
        setCelebration({ kind: botanical.key, message: msg })
        // gentle additional petal drift
        emitPetals({ kind: botanical.key, count: 18 })
        setTimeout(() => setCelebration(null), 5500)
      }
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

  // Search index: when query changes, scan IndexedDB keys + current month days
  useEffect(() => {
    let cancelled = false
    const q = searchQuery.trim().toLowerCase()
    if (!q) { setSearchResults([]); return }
    ;(async () => {
      try {
        const all = await listAllMemoryKeys()
        const parsed = parseSearchQuery(q, year, month)
        const results = filterByQuery(all, q, parsed, year, month, today)
        if (!cancelled) setSearchResults(results.slice(0, 8))
      } catch (e) {
        if (!cancelled) setSearchResults([])
      }
    })()
    return () => { cancelled = true }
  }, [searchQuery, year, month])

  // Year-in-bloom counts: load count of memories per month for the active year
  useEffect(() => {
    if (view !== 'year') return
    let cancelled = false
    ;(async () => {
      try {
        const all = await listAllMemoryKeys()
        const counts = {}
        for (let m = 1; m <= 12; m++) counts[m] = 0
        for (const k of all) {
          const m = String(k).match(/^(\d{4})-(\d{2})-/)
          if (!m) continue
          if (+m[1] !== year) continue
          counts[+m[2]] = (counts[+m[2]] || 0) + 1
        }
        if (!cancelled) setYearCounts(counts)
      } catch (e) {
        if (!cancelled) setYearCounts({})
      }
    })()
    return () => { cancelled = true }
  }, [view, year, images]) // recompute when current-month images change too

  // Year navigation helpers (used only in 'year' view)
  const goPrevYear = () => { setYear(y => y - 1); emitPetals({ count: 4 }) }
  const goNextYear = () => { setYear(y => y + 1); emitPetals({ count: 4 }) }
  const openYearView = () => { setView('year') }
  const closeYearView = () => { setView('month') }
  const handlePickMonth = (m) => {
    setMonth(m)
    setView('month')
    emitPetals({ kind: botanicalForMonth(m).key, count: 6 })
  }

  if (!mounted) return null

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground relative">
      <SVGDefs />

      {/* Floating petals overlay - themed to current month botanical */}
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
              <ParticleSVG kind={p.kind || botanical.key} isDark={isDark} />
            </span>
          ))}
        </AnimatePresence>
      </div>

      {/* hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <div className="h-full w-full grid grid-cols-[300px_1fr] gap-0">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside className="h-full min-h-0 flex flex-col justify-between p-6 border-r border-border/60 relative"
          style={{ background: 'hsl(var(--daisy-paper))' }}>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="font-serif-display italic leading-none text-[hsl(var(--daisy-clay))]"
                  style={{ fontSize: '1.7rem', fontWeight: 400, letterSpacing: '0.01em' }}
                >
                  Dhwani
                </p>
                <p className="text-[11px] uppercase tracking-[0.22em] mt-2 text-muted-foreground">memory garden</p>
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
            <p className="mt-3 text-[9px] uppercase tracking-[0.28em] opacity-60">made with Dhwani</p>
          </div>
        </aside>

        {/* ---------------- MAIN ---------------- */}
        <main className="h-full min-h-0 flex flex-col px-8 py-6 relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6 select-none">
              <button onClick={() => view === 'month' ? goPrev() : goPrevYear()}
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label={view === 'month' ? 'Previous month' : 'Previous year'}>
                <ChevronLeft className="w-6 h-6" strokeWidth={1.4} />
              </button>
              <AnimatePresence mode="wait">
                {view === 'month' ? (
                  <motion.div
                    key={`m-${year}-${month}`}
                    initial={{ opacity: 0, x: direction * 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -direction * 30 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="flex flex-col leading-none"
                  >
                    {gardenName && (
                      <h2 className="font-serif-display italic text-[hsl(var(--daisy-clay))] text-2xl md:text-3xl mb-1" style={{ fontWeight: 400, letterSpacing: '0.005em' }}>
                        {gardenTitle(gardenName)}
                      </h2>
                    )}
                    <h1
                      className="font-serif-display text-3xl md:text-4xl tracking-tight"
                      style={{ fontWeight: 500, letterSpacing: '-0.01em' }}
                    >
                      <span className="text-[hsl(var(--daisy-ink))]">{MONTH_NAMES[month-1]}</span>{' '}
                      <span className="text-[hsl(var(--daisy-clay))] italic font-handwritten text-4xl md:text-5xl ml-1">{year}</span>
                    </h1>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`y-${year}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="flex flex-col leading-none"
                  >
                    {gardenName && (
                      <h2 className="font-serif-display italic text-[hsl(var(--daisy-clay))] text-2xl md:text-3xl mb-1" style={{ fontWeight: 400, letterSpacing: '0.005em' }}>
                        {gardenTitle(gardenName)}
                      </h2>
                    )}
                    <h1
                      className="font-serif-display text-3xl md:text-4xl tracking-tight flex items-baseline gap-3"
                      style={{ fontWeight: 500, letterSpacing: '-0.01em' }}
                    >
                      <span className="text-[hsl(var(--daisy-clay))] italic font-handwritten text-4xl md:text-5xl">{year}</span>
                      <span className="text-[11px] tracking-[0.32em] uppercase text-muted-foreground font-sans-clean">in bloom</span>
                    </h1>
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => view === 'month' ? goNext() : goNextYear()}
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label={view === 'month' ? 'Next month' : 'Next year'}>
                <ChevronRight className="w-6 h-6" strokeWidth={1.4} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {view === 'month' && (
                <SearchField
                  isDark={isDark}
                  value={searchQuery}
                  onChange={setSearchQuery}
                  results={searchResults}
                  open={searchOpen}
                  onOpenChange={setSearchOpen}
                  onPickResult={(r) => {
                    setDirection(r.year > year || (r.year === year && r.month > month) ? +1 : -1)
                    setYear(r.year); setMonth(r.month)
                    setSearchOpen(false); setSearchQuery('')
                    if (r.day) {
                      setHighlightDay(r.day)
                      setTimeout(() => setHighlightDay(null), 2400)
                    }
                    emitPetals({ kind: botanicalForMonth(r.month).key, count: 4 })
                  }}
                />
              )}

              {/* Year-in-Bloom toggle */}
              <button
                type="button"
                onClick={() => view === 'month' ? openYearView() : closeYearView()}
                aria-label={view === 'month' ? 'Year in Bloom' : 'Back to month'}
                title={view === 'month' ? 'Year in Bloom' : 'Back to month'}
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-[hsl(var(--daisy-clay))] hover:bg-muted/70 transition-colors"
              >
                <YearGridIcon active={view === 'year'} />
              </button>

              {/* Settings */}
              <SettingsPanel gardenName={gardenName} onSave={handleRenameGarden} />

              <button
                onClick={() => {
                  const t = new Date()
                  setYear(t.getFullYear())
                  setMonth(t.getMonth()+1)
                  setView('month')
                  emitPetals()
                }}
                className="text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors font-sans-clean"
              >
                Today
              </button>
            </div>
          </div>

          {/* Body: either month grid or year-in-bloom */}
          <AnimatePresence mode="wait">
            {view === 'month' ? (
              <motion.div
                key="month-body"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 min-h-0 flex flex-col"
              >
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
                            highlighted={highlightDay === cell.day}
                          />
                        )
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="year-body"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 min-h-0"
              >
                <YearInBloom
                  year={year}
                  memoryCounts={yearCounts}
                  currentMonth={month}
                  onSelectMonth={handlePickMonth}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Export — botanical icon at bottom-right of the calendar page (month view only) */}
          {view === 'month' && (
            <ExportPanel
              disabled={Object.keys(images).length === 0}
              monthLabel={`${MONTH_NAMES[month-1]} ${year}`}
              onExportPDF={handleExportPDF}
              onExportPNG={handleExportPNG}
            />
          )}
        </main>
      </div>

      {/* Welcome / first-time setup */}
      <WelcomeModal open={welcomeOpen && mounted} onCreate={handleCreateGarden} />

      {/* Offscreen export sheet (rendered hidden, captured by html2canvas) */}
      <ExportSheet ref={exportSheetRef} year={year} month={month} images={images} isDark={isDark} gardenName={gardenName} />

      {/* Celebration overlay (full month bloomed) */}
      <CelebrationOverlay celebration={celebration} isDark={isDark} />

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

// ---------- Year-in-Bloom entry icon (4 tiny botanical squares) ----------
function YearGridIcon({ active = false }) {
  const fill = active ? 'currentColor' : 'transparent'
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      {[[3,3],[12,3],[3,12],[12,12]].map(([x,y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="7" height="7" rx="1.4"
            stroke="currentColor" strokeWidth="1.2" fill={fill} fillOpacity={active ? 0.12 : 0} />
          {/* tiny bloom inside */}
          <circle cx={x+3.5} cy={y+3.5} r="1.4" fill="currentColor" opacity={active ? 0.85 : 0.55} />
          <line x1={x+3.5} y1={y+3.5} x2={x+3.5} y2={y+6} stroke="currentColor" strokeWidth="0.9" opacity={active ? 0.7 : 0.45} />
        </g>
      ))}
    </svg>
  )
}

// ---------- DayTile component ----------
function DayTile({ day, dKey, img, isToday, onActivate, onPreview, onDelete, onReplace, isTouchRef, hovered, onHover, highlighted }) {
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
      animate={highlighted ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22, duration: highlighted ? 1.2 : undefined }}
      className="relative paper-tile hand-drawn-border rounded-lg overflow-hidden cursor-pointer group min-h-0 w-full h-full"
    >
      {highlighted && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.6, 1, 0] }}
          transition={{ duration: 2.2 }}
          className="pointer-events-none absolute inset-0 z-20 rounded-lg ring-2 ring-offset-0"
          style={{ boxShadow: '0 0 0 3px hsl(var(--daisy-clay) / 0.55), 0 0 28px 6px hsl(var(--daisy-butter) / 0.55)' }}
        />
      )}
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

// ---------------- Search helpers ----------------
function parseSearchQuery(qRaw, currYear, currMonth) {
  const q = qRaw.trim().toLowerCase()
  if (!q) return null
  const out = { monthMatches: [], yearMatches: [], exactDate: null, dayInCurrent: null }

  // exact date yyyy-mm-dd or yyyy/mm/dd or m/d or m/d/yyyy
  const iso = q.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (iso) {
    out.exactDate = { year: +iso[1], month: +iso[2], day: +iso[3] }
  }
  const md = q.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/)
  if (md && !iso) {
    let y = md[3] ? +md[3] : currYear
    if (y < 100) y = 2000 + y
    out.exactDate = { year: y, month: +md[1], day: +md[2] }
  }

  // year only
  const yOnly = q.match(/^(19|20)\d{2}$/)
  if (yOnly) out.yearMatches.push(+q)

  // month names (full or 3-letter)
  for (let m = 1; m <= 12; m++) {
    const full = MONTH_NAMES[m-1].toLowerCase()
    if (full.startsWith(q) || q.startsWith(full.slice(0, 3))) {
      out.monthMatches.push(m)
    }
  }

  // "june 2025" type
  const mYear = q.match(/^([a-z]+)\s+(\d{4})$/)
  if (mYear) {
    const mIdx = MONTH_NAMES.findIndex(n => n.toLowerCase().startsWith(mYear[1]))
    if (mIdx >= 0) {
      out.exactDate = null
      out.monthMatches = [mIdx + 1]
      out.yearMatches = [+mYear[2]]
    }
  }

  // pure day number 1..31 -> day in current month
  if (/^\d{1,2}$/.test(q)) {
    const n = +q
    if (n >= 1 && n <= 31) out.dayInCurrent = n
  }

  return out
}

function filterByQuery(allKeys, qRaw, parsed, currYear, currMonth, today) {
  if (!parsed) return []
  const results = []
  const push = (r) => {
    if (!results.find(x => x.year === r.year && x.month === r.month && x.day === r.day)) results.push(r)
  }

  // exact date
  if (parsed.exactDate) {
    push({ ...parsed.exactDate, label: `${MONTH_NAMES[parsed.exactDate.month-1]} ${parsed.exactDate.day}, ${parsed.exactDate.year}`, sub: 'Exact date', kind: 'date' })
  }

  // day in current month
  if (parsed.dayInCurrent) {
    push({ year: currYear, month: currMonth, day: parsed.dayInCurrent, label: `${MONTH_NAMES[currMonth-1]} ${parsed.dayInCurrent}, ${currYear}`, sub: 'This month', kind: 'day' })
  }

  // memories matching month/year filters
  const monthOk = parsed.monthMatches.length === 0 ? null : new Set(parsed.monthMatches)
  const yearOk  = parsed.yearMatches.length === 0  ? null : new Set(parsed.yearMatches)

  // From existing memories
  for (const k of allKeys) {
    const m = String(k).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) continue
    const y = +m[1], mo = +m[2], d = +m[3]
    if (monthOk && !monthOk.has(mo)) continue
    if (yearOk && !yearOk.has(y)) continue
    push({ year: y, month: mo, day: d, label: `${MONTH_NAMES[mo-1]} ${d}, ${y}`, sub: 'Memory', kind: 'memory' })
  }

  // If only a month or only a year was given (no memories matched), still suggest navigating
  if (results.length === 0) {
    if (parsed.monthMatches.length && parsed.yearMatches.length) {
      for (const mo of parsed.monthMatches) for (const y of parsed.yearMatches)
        push({ year: y, month: mo, day: null, label: `${MONTH_NAMES[mo-1]} ${y}`, sub: 'Open month', kind: 'month' })
    } else if (parsed.monthMatches.length) {
      for (const mo of parsed.monthMatches)
        push({ year: currYear, month: mo, day: null, label: `${MONTH_NAMES[mo-1]} ${currYear}`, sub: 'Open month', kind: 'month' })
    } else if (parsed.yearMatches.length) {
      for (const y of parsed.yearMatches)
        push({ year: y, month: 1, day: null, label: `January ${y}`, sub: 'Open year', kind: 'year' })
    }
  }

  return results
}

// ---------------- Search field ----------------
function SearchField({ value, onChange, results, open, onOpenChange, onPickResult, isDark }) {
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target)) onOpenChange(false)
    }
    if (open) document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, onOpenChange])

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-2 px-3 h-9 rounded-full bg-card/70 border border-border/70 hover:border-border focus-within:border-[hsl(var(--daisy-clay))] transition-colors min-w-[230px]">
        <Search className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); onOpenChange(true) }}
          onFocus={() => onOpenChange(true)}
          placeholder="Find a memory..."
          className="w-full bg-transparent outline-none text-sm font-serif-display italic placeholder:text-muted-foreground/70 placeholder:italic text-foreground"
        />
        {value && (
          <button onClick={() => { onChange(''); inputRef.current?.focus() }}
            className="text-muted-foreground hover:text-foreground" aria-label="Clear">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && value && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-[300px] rounded-xl bg-popover border border-border shadow-lg overflow-hidden z-50"
          >
            {results.length === 0 ? (
              <div className="px-4 py-5 text-sm text-muted-foreground italic font-serif-display">
                Nothing in the garden by that name.
              </div>
            ) : (
              <ul className="py-1 max-h-[60vh] overflow-auto">
                {results.map((r, i) => (
                  <li key={`${r.year}-${r.month}-${r.day}-${i}`}>
                    <button
                      onClick={() => onPickResult(r)}
                      className="w-full text-left px-4 py-2.5 hover:bg-muted/70 transition-colors flex items-baseline justify-between gap-3"
                    >
                      <span className="font-serif-display text-sm text-foreground">{r.label}</span>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 font-sans-clean">{r.sub}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------- Celebration overlay ----------------
function CelebrationOverlay({ celebration, isDark }) {
  if (!celebration) return null
  const N = 14
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* creatures */}
      {Array.from({ length: N }).map((_, i) => {
        const startX = 10 + Math.random() * 80
        const startY = 20 + Math.random() * 50
        const dx = (Math.random() - 0.5) * 220
        const dy = (Math.random() - 0.3) * 160
        const delay = Math.random() * 1.2
        const duration = 3 + Math.random() * 1.5
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.7 }}
            animate={{
              opacity: [0, 0.9, 0.9, 0],
              x: [0, dx, dx * 0.6, dx * 1.2],
              y: [0, dy * 0.4, dy, dy * 1.2],
              scale: [0.7, 1, 1, 0.85],
            }}
            transition={{ delay, duration, ease: 'easeInOut', times: [0, 0.2, 0.7, 1] }}
            className="absolute"
            style={{ left: `${startX}%`, top: `${startY}%` }}
          >
            {isDark ? <Firefly /> : <Butterfly color="#9A744A" />}
          </motion.div>
        )
      })}

      {/* gentle drifting petals/leaves */}
      {Array.from({ length: 18 }).map((_, i) => {
        const startX = Math.random() * 100
        const startY = -5 - Math.random() * 12
        const dx = (Math.random() - 0.5) * 80
        const dy = 80 + Math.random() * 40
        const delay = Math.random() * 1.5
        const duration = 4 + Math.random() * 1.5
        const rot = (Math.random() - 0.5) * 360
        return (
          <motion.div
            key={`p-${i}`}
            initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: [0, 0.9, 0.9, 0], x: dx, y: `${dy}vh`, rotate: rot }}
            transition={{ delay, duration, ease: 'easeIn' }}
            className="absolute"
            style={{ left: `${startX}%`, top: `${startY}%` }}
          >
            <ParticleSVG kind={celebration.kind} isDark={isDark} />
          </motion.div>
        )
      })}

      {/* subtle message */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: [0, 1, 1, 0], y: 0 }}
        transition={{ duration: 5.2, times: [0, 0.15, 0.8, 1] }}
        className="absolute inset-x-0 top-[26%] flex justify-center"
      >
        <div className="px-7 py-3 rounded-full bg-card/90 backdrop-blur border border-border shadow-sm">
          <span className="font-handwritten text-2xl text-[hsl(var(--daisy-clay))]">
            {celebration.message}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

export default App
