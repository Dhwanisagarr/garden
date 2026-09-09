'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Trash2, RefreshCw, ImagePlus, Search } from 'lucide-react'

import DaisyToggle from '@/components/DaisyToggle'
import Botanical from '@/components/Botanical'
import SVGDefs from '@/components/SVGDefs'
import { ParticleSVG, Butterfly, Firefly } from '@/components/Particles'
import ExportPanel from '@/components/ExportPanel'
import ExportSheet from '@/components/ExportSheet'
import ExportInstagram from '@/components/ExportInstagram'
import YearInBloom from '@/components/YearInBloom'
import WelcomeModal from '@/components/WelcomeModal'
import SettingsPanel from '@/components/SettingsPanel'
import LandingPage from '@/components/LandingPage'
import GuestNotesModal from '@/components/GuestNotesModal'
import CommunityWallModal from '@/components/CommunityWallModal'
import { exportAsPDF, exportAsPNG, exportInstagramCarousel, exportInstagramStory } from '@/lib/export'
import { botanicalForMonth } from '@/lib/botanicals'
import { getEcosystemForYear } from '@/lib/ecosystems'
import { deriveDarkModeColor, generateUnifiedPalette, paletteToStyleObject } from '@/lib/color-utils'
import { buildExportFilename, gardenFilenameStem } from '@/lib/garden'
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

function SidebarContent({ gardenName, ecosystem, isDark, toggleTheme, botanical, memoryCount, year, month, onOpenCommunity, onOpenGuestNotes }) {
  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <div>
            <p
              className="font-serif-display italic leading-none text-[hsl(var(--daisy-clay))]"
              style={{ fontSize: '1.7rem', fontWeight: 400, letterSpacing: '0.01em' }}
            >
              {gardenName || 'Dhwani'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">memory garden</p>
              <span className="text-[9px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full bg-[hsl(var(--daisy-clay))]/15 text-[hsl(var(--daisy-clay))] font-sans-clean font-medium shrink-0">
                {ecosystem.badge}
              </span>
            </div>
            <p className="mt-1.5 text-base leading-none" aria-hidden>{ecosystem.icon || '🌼'}</p>
          </div>
          <DaisyToggle isDark={isDark} onToggle={toggleTheme} />
        </div>

        <div className="mt-6">
          <p className="font-handwritten text-2xl text-[hsl(var(--daisy-ink))]">{botanical.name}</p>
          <p className="text-xs text-muted-foreground mt-1 italic">
            {memoryCount === 0 ? 'A still garden. Plant a memory.' :
              `${memoryCount} ${memoryCount === 1 ? 'bloom' : 'blooms'} this month`}
          </p>
        </div>

        {/* Community & Guest Notes Navigation Buttons */}
        <div className="mt-4 flex flex-col gap-2">
          {onOpenCommunity && (
            <button
              type="button"
              onClick={onOpenCommunity}
              className="w-full text-left px-3 py-2 rounded-xl bg-card border border-border/80 hover:border-[hsl(var(--daisy-clay))] text-xs text-foreground font-medium transition-all flex items-center justify-between shadow-xs group"
            >
              <span className="flex items-center gap-2">
                <span>🌸</span> <span className="font-serif-display">Community Wall</span>
              </span>
              <span className="text-[10px] text-muted-foreground group-hover:text-[hsl(var(--daisy-clay))] transition-colors">Discover →</span>
            </button>
          )}

          {onOpenGuestNotes && (
            <button
              type="button"
              onClick={onOpenGuestNotes}
              className="w-full text-left px-3 py-2 rounded-xl bg-card border border-border/80 hover:border-[hsl(var(--daisy-clay))] text-xs text-foreground font-medium transition-all flex items-center justify-between shadow-xs group"
            >
              <span className="flex items-center gap-2">
                <span>✍️</span> <span className="font-serif-display">Guest Notes</span>
              </span>
              <span className="text-[10px] text-muted-foreground group-hover:text-[hsl(var(--daisy-clay))] transition-colors">Write →</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-end justify-center my-2 sm:my-4 min-h-0">
        <div className="w-full h-[160px] sm:h-[180px] md:h-[50vh] md:min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${year}-${month}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.55 }}
              className="w-full h-full"
            >
              <Botanical kind={botanical.key} count={memoryCount} year={year} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground font-sans-clean leading-relaxed">
        <p className="italic">"Ordinary days, gently kept."</p>
        <p className="mt-2 opacity-70">Your memories live privately on this device.</p>
        <p className="mt-3 text-[9px] uppercase tracking-[0.28em] opacity-60">Crafted by Dhwani</p>
      </div>
    </>
  )
}

function SearchField({ isDark, value, onChange, results, open, onOpenChange, onPickResult }) {
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onOpenChange(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onOpenChange])

  return (
    <div ref={containerRef} className="relative select-none">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-label="Search memories"
          title="Search memories by month, year or date"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-[hsl(var(--daisy-clay))] hover:bg-muted/70 transition-colors"
        >
          <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={1.7} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-11 z-50 w-72 sm:w-80 rounded-2xl bg-card border border-border shadow-xl p-3"
          >
            <div className="relative flex items-center mb-2">
              <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search e.g. Sep 2026 or 15..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-muted/50 text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-1 focus:ring-[hsl(var(--daisy-clay))]"
                autoFocus
              />
              {value && (
                <button
                  onClick={() => onChange('')}
                  className="absolute right-2.5 p-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {value.trim() && (
              <div className="max-h-56 overflow-y-auto space-y-1">
                {results.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4 italic font-serif-display">
                    No matching memories found
                  </p>
                ) : (
                  results.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => onPickResult(r)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-muted/70 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-serif-display font-medium text-foreground group-hover:text-[hsl(var(--daisy-clay))]">
                          {r.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{r.subtitle}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        Go →
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function YearGridIcon({ active }) {
  return (
    <svg className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-colors ${active ? 'text-[hsl(var(--daisy-clay))]' : 'text-current'}`} viewBox="0 0 20 20" fill="currentColor">
      <rect x="2" y="2" width="4.5" height="4.5" rx="1.2" />
      <rect x="7.75" y="2" width="4.5" height="4.5" rx="1.2" />
      <rect x="13.5" y="2" width="4.5" height="4.5" rx="1.2" />
      <rect x="2" y="7.75" width="4.5" height="4.5" rx="1.2" />
      <rect x="7.75" y="7.75" width="4.5" height="4.5" rx="1.2" />
      <rect x="13.5" y="7.75" width="4.5" height="4.5" rx="1.2" />
      <rect x="2" y="13.5" width="4.5" height="4.5" rx="1.2" />
      <rect x="7.75" y="13.5" width="4.5" height="4.5" rx="1.2" />
      <rect x="13.5" y="13.5" width="4.5" height="4.5" rx="1.2" />
    </svg>
  )
}

function DayTile({ day, dKey, img, isToday, onActivate, onPreview, onDelete, onReplace, isTouchRef, hovered, onHover, highlighted }) {
  return (
    <div
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onClick={() => {
        if (img) onPreview()
        else onActivate()
      }}
      className={`group relative rounded-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between p-2 sm:p-2.5 min-h-[78px] sm:min-h-[96px] md:min-h-0 md:h-full select-none ${
        img ? 'has-photo' : 'empty-tile'
      } ${highlighted ? 'ring-2 ring-[hsl(var(--daisy-clay))] scale-102' : ''}`}
      style={{
        backgroundColor: img ? 'transparent' : 'hsl(var(--daisy-paper))',
        border: '1px solid hsl(var(--border) / 0.8)',
      }}
    >
      <div className="flex items-center justify-between z-10">
        <span
          className={`text-xs sm:text-sm font-sans-clean font-medium ${
            isToday
              ? 'w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[hsl(var(--daisy-clay))] text-white flex items-center justify-center font-semibold shadow-xs'
              : img
              ? 'text-white drop-shadow-md'
              : 'text-muted-foreground'
          }`}
        >
          {day}
        </span>
        {img && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/40 backdrop-blur-xs p-1 rounded-lg">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReplace() }}
              className="p-1 text-white hover:text-amber-300 transition-colors"
              title="Replace image"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="p-1 text-white hover:text-red-400 transition-colors"
              title="Delete memory"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {img ? (
        <img
          src={img}
          alt={`Memory for day ${day}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground/60">
          <ImagePlus className="w-4 h-4 sm:w-5 sm:h-5 stroke-1" />
        </div>
      )}
    </div>
  )
}

function CelebrationOverlay({ celebration, isDark }) {
  if (!celebration) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-popover border border-border shadow-2xl rounded-3xl p-8 max-w-sm text-center backdrop-blur-md"
        >
          <div className="w-20 h-20 mx-auto mb-4">
            <Botanical kind={celebration.kind} count={31} year={2026} />
          </div>
          <p className="font-serif-display italic text-2xl text-[hsl(var(--daisy-clay))] mb-2 font-medium">
            Full Bloom
          </p>
          <p className="font-handwritten text-xl text-foreground leading-relaxed">
            {celebration.message}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function fileToScaledDataURL(file, maxDimension = 1400) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.88))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function parseSearchQuery(q, currentYear, currentMonth) {
  const mMatch = q.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/i)
  const yMatch = q.match(/\b(20\d{2})\b/)
  const dMatch = q.match(/\b([1-9]|[12]\d|3[01])\b/)

  return {
    monthStr: mMatch ? mMatch[1].toLowerCase() : null,
    yearNum: yMatch ? parseInt(yMatch[1], 10) : null,
    dayNum: dMatch ? parseInt(dMatch[1], 10) : null,
  }
}

function filterByQuery(allKeys, query, parsed, activeYear, activeMonth, today) {
  const monthMap = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
  }

  const results = []

  for (const k of allKeys) {
    const match = String(k).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) continue
    const [, yStr, mStr, dStr] = match
    const y = parseInt(yStr, 10)
    const m = parseInt(mStr, 10)
    const d = parseInt(dStr, 10)

    let score = 0

    if (parsed.monthStr) {
      const targetM = monthMap[parsed.monthStr]
      if (targetM === m) score += 40
    }
    if (parsed.yearNum && parsed.yearNum === y) score += 40
    if (parsed.dayNum && parsed.dayNum === d) score += 30

    if (`${y}-${m}-${d}`.includes(query) || `${MONTH_NAMES[m - 1]} ${y}`.toLowerCase().includes(query)) {
      score += 20
    }

    if (score > 0) {
      results.push({
        key: k,
        year: y,
        month: m,
        day: d,
        score,
        label: `${MONTH_NAMES[m - 1]} ${d}, ${y}`,
        subtitle: `Day ${d} memory`,
      })
    }
  }

  return results.sort((a, b) => b.score - a.score)
}

export default function GardenApp() {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1) // 1-indexed
  const [images, setImages] = useState({}) // dateKey -> dataURL
  const [isDark, setIsDark] = useState(false)
  const [bgColor, setBgColor] = useState(null)
  const [bgImage, setBgImage] = useState(null)
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
  const [showLanding, setShowLanding] = useState(true)   // whether to display landing page entrance
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [guestNotesOpen, setGuestNotesOpen] = useState(false)
  const [communityOpen, setCommunityOpen] = useState(false)
  const fileInputRef = useRef(null)
  const pendingDayRef = useRef(null)
  const exportSheetRef = useRef(null)
  const exportInstagramRef = useRef(null)

  // Export handlers
  const buildExportName = (ext) =>
    buildExportFilename({ name: gardenName, monthName: MONTH_NAMES[month - 1], year, ext })

  const buildInstagramName = (suffix, ext) =>
    `${gardenFilenameStem(gardenName)}_${MONTH_NAMES[month - 1]}_${year}_${suffix}.${ext}`

  const handleExportPDF = async () => {
    if (!exportSheetRef.current) return
    try {
      await exportAsPDF(exportSheetRef.current, buildExportName('pdf'), { isDark, bgColor, bgImage })
    } catch (e) {
      console.error('PDF export failed', e)
    }
  }
  const handleExportPNG = async () => {
    if (!exportSheetRef.current) return
    try {
      await exportAsPNG(exportSheetRef.current, buildExportName('png'), { isDark, bgColor, bgImage })
    } catch (e) {
      console.error('PNG export failed', e)
    }
  }
  const handleExportInstagramCarousel = async () => {
    if (!exportInstagramRef.current) return
    try {
      const elements = exportInstagramRef.current.getCarouselElements()
      if (!elements.length) return
      await exportInstagramCarousel(
        elements,
        buildInstagramName('instagram_carousel', 'zip'),
        { isDark, bgColor, bgImage }
      )
    } catch (e) {
      console.error('Instagram carousel export failed', e)
    }
  }
  const handleExportInstagramStory = async () => {
    if (!exportInstagramRef.current) return
    try {
      const el = exportInstagramRef.current.getStoryElement()
      if (!el) return
      await exportInstagramStory(
        el,
        buildInstagramName('instagram_story', 'png'),
        { isDark, bgColor, bgImage }
      )
    } catch (e) {
      console.error('Instagram story export failed', e)
    }
  }

  // ----- mount: theme + load images + load garden name & background
  useEffect(() => {
    setMounted(true)
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('daisy-theme') : null
    const dark = savedTheme === 'dark'
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)

    // load garden name
    const savedName = typeof window !== 'undefined' ? localStorage.getItem('daisy-garden-name') : null
    if (savedName && savedName.trim()) {
      setGardenName(savedName.trim())
      setShowLanding(false)
    } else {
      setShowLanding(true)
    }

    // load custom background preferences
    const savedBgColor = typeof window !== 'undefined' ? localStorage.getItem('daisy-bg-color') : null
    if (savedBgColor) setBgColor(savedBgColor)

    const savedBgImage = typeof window !== 'undefined' ? localStorage.getItem('daisy-bg-image') : null
    if (savedBgImage) setBgImage(savedBgImage)
  }, [])

  const handleCreateGarden = (name) => {
    const clean = name.trim()
    if (!clean) return
    setGardenName(clean)
    try { localStorage.setItem('daisy-garden-name', clean) } catch {}
    setShowLanding(false)
    setWelcomeOpen(false)
    emitPetals({ kind: botanical?.key, count: 8 })
  }

  const handleRenameGarden = (name) => {
    const clean = name.trim()
    if (!clean) return
    setGardenName(clean)
    try { localStorage.setItem('daisy-garden-name', clean) } catch {}
  }

  const handleSaveBgColor = (color) => {
    setBgColor(color)
    try { localStorage.setItem('daisy-bg-color', color) } catch {}
  }

  const handleSaveBgImage = (dataUrl) => {
    setBgImage(dataUrl)
    if (dataUrl) {
      try { localStorage.setItem('daisy-bg-image', dataUrl) } catch {}
    } else {
      try { localStorage.removeItem('daisy-bg-image') } catch {}
    }
  }

  const handleResetBg = () => {
    setBgColor(null)
    setBgImage(null)
    try {
      localStorage.removeItem('daisy-bg-color')
      localStorage.removeItem('daisy-bg-image')
    } catch {}
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
    const kind = opts.kind
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

    const dataUrl = await fileToScaledDataURL(file, 1400)
    const key = dateKey(year, month, day)
    try {
      await putImage(key, dataUrl)
      const next = { ...images, [key]: dataUrl }
      setImages(next)
      emitPetals({ kind: botanical.key, count: 8 })

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
        emitPetals({ kind: botanical.key, count: 18 })
        setTimeout(() => setCelebration(null), 5500)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const removeMemory = async (key) => {
    try {
      await deleteImage(key)
      setImages(prev => {
        const n = { ...prev }; delete n[key]; return n
      })
    } catch (e) {
      console.error('Could not remove image', e)
    }
  }

  const memoryCount = Object.keys(images).length
  const ecosystem = getEcosystemForYear(year)
  const botanical = botanicalForMonth(month, year)

  // Unified Theme Palette generation
  const unifiedPalette = useMemo(() => {
    return generateUnifiedPalette(bgColor, isDark)
  }, [bgColor, isDark])

  const paletteStyles = useMemo(() => {
    return paletteToStyleObject(unifiedPalette)
  }, [unifiedPalette])

  // ---------------- Calendar grid build
  const grid = useMemo(() => {
    const dim = daysInMonth(year, month)
    const start = firstWeekday(year, month)
    const cells = []
    for (let i = 0; i < start; i++) cells.push({ blank: true, key: `b-${i}` })
    for (let d = 1; d <= dim; d++) cells.push({ day: d, key: dateKey(year, month, d) })
    while (cells.length % 7 !== 0) cells.push({ blank: true, key: `tb-${cells.length}` })
    return cells
  }, [year, month])

  const isTouchRef = useRef(false)
  useEffect(() => {
    const setTouch = () => { isTouchRef.current = true }
    window.addEventListener('touchstart', setTouch, { once: true, passive: true })
    return () => window.removeEventListener('touchstart', setTouch)
  }, [])

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
  }, [view, year, images])

  const goPrevYear = () => { setYear(y => y - 1); emitPetals({ count: 4 }) }
  const goNextYear = () => { setYear(y => y + 1); emitPetals({ count: 4 }) }
  const openYearView = () => { setView('year') }
  const closeYearView = () => { setView('month') }
  const handlePickMonth = (m) => {
    setMonth(m)
    setView('month')
    emitPetals({ kind: botanicalForMonth(m, year).key, count: 6 })
  }

  return (
    <div
      className={`h-[100dvh] min-h-[100dvh] w-full overflow-hidden text-foreground relative transition-colors duration-300 ${bgImage ? 'has-bg-image' : ''}`}
      style={{
        ...paletteStyles,
        backgroundColor: 'hsl(var(--background))',
        ...(bgImage ? {
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        } : {}),
      }}
    >
      <AnimatePresence mode="wait">
        {showLanding && (
          <LandingPage
            key="landing-entrance"
            onGetStarted={handleCreateGarden}
            defaultName={gardenName}
          />
        )}
      </AnimatePresence>

      {/* Background Wallpaper Contrast Overlay */}
      {bgImage && (
        <div
          className={`absolute inset-0 pointer-events-none z-0 ${
            isDark ? 'bg-black/50 backdrop-blur-[2px]' : 'bg-white/40 backdrop-blur-[2px]'
          }`}
        />
      )}

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
              <ParticleSVG kind={p.kind || botanical.key} isDark={isDark} />
            </span>
          ))}
        </AnimatePresence>
      </div>

      {/* hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {/* Edge Arrow Trigger for Mobile Navigation */}
      <button
        type="button"
        onClick={() => setMobileNavOpen(prev => !prev)}
        aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
        title={mobileNavOpen ? "Close menu" : "Open menu"}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 md:hidden flex items-center justify-center w-7 h-12 rounded-r-2xl bg-[hsl(var(--daisy-paper))] border-y border-r border-border/80 shadow-md text-[hsl(var(--daisy-ink))] hover:text-[hsl(var(--daisy-clay))] transition-all duration-200 active:scale-95"
      >
        {mobileNavOpen ? (
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        ) : (
          <ChevronRight className="w-5 h-5" strokeWidth={2} />
        )}
      </button>

      {/* Mobile Sidebar Slide-Over Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-40 w-[290px] max-w-[85vw] flex flex-col justify-between p-6 border-r border-border/60 backdrop-blur-md shadow-2xl md:hidden overflow-y-auto"
              style={{ background: bgImage ? 'hsl(var(--daisy-paper) / 0.94)' : 'hsl(var(--daisy-paper))' }}
            >
              <SidebarContent
                gardenName={gardenName}
                ecosystem={ecosystem}
                isDark={isDark}
                toggleTheme={toggleTheme}
                botanical={botanical}
                memoryCount={memoryCount}
                year={year}
                month={month}
                onOpenCommunity={() => setCommunityOpen(true)}
                onOpenGuestNotes={() => setGuestNotesOpen(true)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="h-full w-full flex flex-col md:grid md:grid-cols-[270px_1fr] lg:grid-cols-[300px_1fr] gap-0 relative z-10 overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <aside
          className="hidden md:flex md:w-full md:h-full md:min-h-0 flex-col justify-between p-5 lg:p-6 border-r border-border/60 relative backdrop-blur-md transition-colors duration-300"
          style={{ background: bgImage ? 'hsl(var(--daisy-paper) / 0.88)' : 'hsl(var(--daisy-paper))' }}
        >
          <SidebarContent
            gardenName={gardenName}
            ecosystem={ecosystem}
            isDark={isDark}
            toggleTheme={toggleTheme}
            botanical={botanical}
            memoryCount={memoryCount}
            year={year}
            month={month}
            onOpenCommunity={() => setCommunityOpen(true)}
            onOpenGuestNotes={() => setGuestNotesOpen(true)}
          />
        </aside>

        {/* ---------------- MAIN ---------------- */}
        <main className="w-full h-full min-h-0 flex-1 flex flex-col justify-start gap-2 sm:gap-3 px-3 sm:px-5 md:px-6 lg:px-8 py-3 sm:py-5 lg:py-6 relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-1 sm:mb-2 w-full shrink-0">
            <div className="flex items-center gap-1 sm:gap-4 select-none">
              <button onClick={() => view === 'month' ? goPrev() : goPrevYear()}
                className="p-1.5 sm:p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label={view === 'month' ? 'Previous month' : 'Previous year'}>
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.4} />
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
                    <h1
                      className="font-serif-display text-2xl sm:text-3xl md:text-4xl tracking-tight flex items-baseline gap-1.5 sm:gap-2"
                      style={{ fontWeight: 500, letterSpacing: '-0.01em' }}
                    >
                      <span className="text-[hsl(var(--daisy-ink))]">{MONTH_NAMES[month-1]}</span>{' '}
                      <span className="text-[hsl(var(--daisy-clay))] italic font-handwritten text-3xl sm:text-4xl md:text-5xl ml-0.5 sm:ml-1">{year}</span>
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
                    <h1
                      className="font-serif-display text-2xl sm:text-3xl md:text-4xl tracking-tight flex items-baseline gap-2 sm:gap-3"
                      style={{ fontWeight: 500, letterSpacing: '-0.01em' }}
                    >
                      <span className="text-[hsl(var(--daisy-clay))] italic font-handwritten text-3xl sm:text-4xl md:text-5xl">{year}</span>
                      <span className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.32em] uppercase text-muted-foreground font-sans-clean">
                        {ecosystem.name}
                      </span>
                    </h1>
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => view === 'month' ? goNext() : goNextYear()}
                className="p-1.5 sm:p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                aria-label={view === 'month' ? 'Next month' : 'Next year'}>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.4} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
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
                    emitPetals({ kind: botanicalForMonth(r.month, r.year).key, count: 4 })
                  }}
                />
              )}

              {/* Year-in-Bloom toggle */}
              <button
                type="button"
                onClick={() => view === 'month' ? openYearView() : closeYearView()}
                aria-label={view === 'month' ? 'Year Overview' : 'Back to month'}
                title={view === 'month' ? 'Year Overview' : 'Back to month'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-[hsl(var(--daisy-clay))] hover:bg-muted/70 transition-colors"
              >
                <YearGridIcon active={view === 'year'} />
              </button>

              {/* Settings Panel */}
              <SettingsPanel
                gardenName={gardenName}
                bgColor={bgColor}
                bgImage={bgImage}
                onSaveName={handleRenameGarden}
                onSaveBgColor={handleSaveBgColor}
                onSaveBgImage={handleSaveBgImage}
                onResetBg={handleResetBg}
                onOpenLanding={() => setShowLanding(true)}
              />

              {/* Community Wall Button */}
              <button
                type="button"
                onClick={() => setCommunityOpen(true)}
                aria-label="Community Wall"
                title="Community Wall - Browse Shared Memories"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-[hsl(var(--daisy-clay))] hover:bg-muted/70 transition-colors text-sm"
              >
                🌸
              </button>

              {/* Guest Notes Button */}
              <button
                type="button"
                onClick={() => setGuestNotesOpen(true)}
                aria-label="Guest Notes"
                title="Guest Notes - Write a Memory"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-[hsl(var(--daisy-clay))] hover:bg-muted/70 transition-colors text-sm"
              >
                ✍️
              </button>

              <button
                onClick={() => {
                  const t = new Date()
                  setYear(t.getFullYear())
                  setMonth(t.getMonth()+1)
                  setView('month')
                  emitPetals()
                }}
                className="text-[10px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors font-sans-clean"
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
                className="flex-1 min-h-0 flex flex-col justify-start w-full md:h-full gap-1"
              >
                {/* Weekday strip */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 md:gap-3 shrink-0 mb-1 px-0.5 sm:px-1">
                  {WEEKDAYS.map(w => (
                    <div key={w} className="text-center text-[10px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.18em] uppercase text-muted-foreground/70 font-sans-clean">
                      {w}
                    </div>
                  ))}
                </div>

                {/* Calendar grid - natural aspect ratio on mobile, full grid on desktop */}
                <div className="w-full relative md:flex-1 md:h-full md:min-h-0">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={`${year}-${month}-grid`}
                      custom={direction}
                      initial={{ opacity: 0, x: direction * 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -direction * 50 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="grid grid-cols-7 gap-1.5 sm:gap-2.5 md:gap-3 w-full md:absolute md:inset-0 md:auto-rows-fr md:h-full"
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
              onExportInstagramCarousel={handleExportInstagramCarousel}
              onExportInstagramStory={handleExportInstagramStory}
            />
          )}
        </main>
      </div>

      {/* Welcome / first-time setup */}
      <WelcomeModal open={welcomeOpen && mounted} onCreate={handleCreateGarden} />

      {/* Public Guest Notes Modal (Submission Only) */}
      <GuestNotesModal isOpen={guestNotesOpen} onClose={() => setGuestNotesOpen(false)} />

      {/* Public Community Wall Modal (Approved Public Memories Grid) */}
      <CommunityWallModal
        isOpen={communityOpen}
        onClose={() => setCommunityOpen(false)}
        onOpenWriteNote={() => setGuestNotesOpen(true)}
      />

      {/* Offscreen export sheet (rendered hidden, captured by html2canvas) */}
      <ExportSheet ref={exportSheetRef} year={year} month={month} images={images} isDark={isDark} bgColor={bgColor} bgImage={bgImage} gardenName={gardenName} />
      <ExportInstagram ref={exportInstagramRef} year={year} month={month} images={images} isDark={isDark} bgColor={bgColor} bgImage={bgImage} gardenName={gardenName} />

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
                <img
                  src={images[preview]}
                  alt="Memory preview"
                  className="max-h-[75vh] max-w-[80vw] object-contain rounded-md shadow-lg"
                />
                <button
                  onClick={() => setPreview(null)}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-popover border border-border shadow-md flex items-center justify-center text-foreground hover:scale-105 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
