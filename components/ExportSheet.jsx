'use client'
import { forwardRef } from 'react'
import Botanical from '@/components/Botanical'
import { botanicalForMonth } from '@/lib/botanicals'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function daysInMonth(year, month1) {
  return new Date(year, month1, 0).getDate()
}
function firstWeekday(year, month1) {
  return new Date(year, month1 - 1, 1).getDay()
}

/**
 * Beautiful printable composition. Rendered offscreen at exactly
 * A4 portrait base size (794 x 1123 px at 96 DPI); html2canvas
 * scales x3 to get ~288 DPI.
 *
 * Uses explicit DAISY light palette so prints are always warm-paper
 * regardless of UI theme.
 */
const ExportSheet = forwardRef(function ExportSheet({ year, month, images }, ref) {
  const botanical = botanicalForMonth(month)
  const dim = daysInMonth(year, month)
  const startDay = firstWeekday(year, month)
  const memoryCount = Object.keys(images || {}).length
  const fullyBloomed = memoryCount === dim && memoryCount > 0

  // Build grid (5 or 6 rows depending on month). We always render 6 rows for consistent height.
  const totalCells = 42
  const cells = []
  for (let i = 0; i < startDay; i++) cells.push({ blank: true })
  for (let d = 1; d <= dim; d++) {
    const key = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    cells.push({ day: d, key, img: images?.[key] })
  }
  while (cells.length < totalCells) cells.push({ blank: true, trail: true })

  // ---------- color tokens (light palette, fixed) ----------
  const C = {
    bg:      '#F7F3EA',
    paper:   '#FBF8EE',
    ink:     '#4F4A44',
    inkSoft: 'rgba(79, 74, 68, 0.55)',
    border:  'rgba(79, 74, 68, 0.22)',
    clay:    '#9A744A',
    butter:  '#E3C66A',
    sage:    '#C6D3B2',
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: '-10000px',
        top: 0,
        width: '794px',
        height: '1123px',
        backgroundColor: C.bg,
        color: C.ink,
        fontFamily: "'Fraunces', Georgia, serif",
        overflow: 'hidden',
        // subtle paper texture via two small dot patterns
        backgroundImage:
          'radial-gradient(rgba(79,74,68,0.045) 1px, transparent 1px), radial-gradient(rgba(79,74,68,0.028) 1px, transparent 1px)',
        backgroundSize: '32px 32px, 17px 17px',
        backgroundPosition: '0 0, 8px 11px',
      }}
      aria-hidden
    >
      {/* outer hand-drawn frame */}
      <div
        style={{
          position: 'absolute',
          inset: '28px',
          border: `1.4px solid ${C.border}`,
          borderRadius: '14px',
          padding: '36px 44px 28px 44px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* daisy logo */}
            <svg width="42" height="42" viewBox="0 0 60 60">
              {Array.from({ length: 8 }).map((_, i) => (
                <ellipse key={i} cx="30" cy="14" rx="5" ry="10"
                  transform={`rotate(${i * 45} 30 30)`}
                  fill="#FBFAF3" stroke={C.clay} strokeWidth="0.8" />
              ))}
              <circle cx="30" cy="30" r="6" fill={C.butter} stroke={C.clay} strokeWidth="1" />
            </svg>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 38, color: C.clay, lineHeight: 1 }}>daisy</div>
              <div style={{ fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.inkSoft, marginTop: 4 }}>memory garden</div>
            </div>
          </div>

          <div style={{ textAlign: 'right', lineHeight: 1.1 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: C.inkSoft }}>
              Preserved on {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.clay, marginTop: 6 }}>
              {botanical.name.toLowerCase()}
            </div>
          </div>
        </div>

        {/* MONTH TITLE */}
        <div style={{ textAlign: 'center', margin: '6px 0 14px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.01em', color: C.ink }}>
              {MONTH_NAMES[month - 1]}
            </span>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: 64, color: C.clay, lineHeight: 1 }}>
              {year}
            </span>
          </div>
          <div style={{ marginTop: 4, fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.inkSoft }}>
            {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}{fullyBloomed ? ' · fully bloomed' : ''}
          </div>
        </div>

        {/* WEEKDAYS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
          {WEEKDAYS.map(w => (
            <div key={w} style={{
              textAlign: 'center', fontSize: 9, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: C.inkSoft, fontFamily: 'Inter, sans-serif'
            }}>{w}</div>
          ))}
        </div>

        {/* CALENDAR GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: 'repeat(6, 1fr)',
          gap: 6,
          flex: '0 0 auto',
          height: 540,
        }}>
          {cells.map((c, idx) => {
            if (c.blank) {
              return (
                <div key={`b-${idx}`} style={{
                  background: 'transparent',
                  borderRadius: 6,
                }} />
              )
            }
            return (
              <div key={c.key || `d-${c.day}`}
                style={{
                  position: 'relative',
                  backgroundColor: C.paper,
                  borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  boxShadow: '0 1px 2px rgba(79,74,68,0.06)',
                  overflow: 'hidden',
                }}
              >
                {/* date */}
                <div style={{
                  position: 'absolute', top: 4, left: 6, zIndex: 2,
                  fontSize: 10, lineHeight: 1, color: C.inkSoft,
                }}>{c.day}</div>
                {c.img ? (
                  <img
                    src={c.img}
                    alt=""
                    crossOrigin="anonymous"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(79,74,68,0.15)', fontSize: 18,
                  }}>·</div>
                )}
              </div>
            )
          })}
        </div>

        {/* BOTTOM: botanical strip + quote */}
        <div style={{
          marginTop: 18,
          flex: '1 1 auto',
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: 18,
          alignItems: 'end',
          minHeight: 0,
        }}>
          {/* Botanical illustration */}
          <div style={{ height: 230, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', height: '100%' }}>
              <Botanical kind={botanical.key} count={memoryCount} />
            </div>
          </div>

          {/* Quote + completion note */}
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            paddingBottom: 8,
          }}>
            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 32,
              color: C.clay,
              lineHeight: 1.1,
              fontStyle: 'italic',
            }}>
              "Ordinary days, gently kept."
            </div>
            {fullyBloomed && (
              <div style={{
                marginTop: 10,
                fontFamily: "'Caveat', cursive",
                fontSize: 22,
                color: C.ink,
              }}>
                Your {MONTH_NAMES[month - 1]} garden fully bloomed.
              </div>
            )}
            <div style={{
              marginTop: 14,
              fontSize: 9,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: C.inkSoft,
              fontFamily: 'Inter, sans-serif',
            }}>
              daisy · {MONTH_NAMES[month - 1]} {year}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ExportSheet
