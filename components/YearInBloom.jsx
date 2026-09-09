'use client'
import { motion } from 'framer-motion'
import Botanical from '@/components/Botanical'
import { botanicalForMonth } from '@/lib/botanicals'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

function daysInMonth(year, month1) {
  return new Date(year, month1, 0).getDate()
}

export default function YearInBloom({ year, memoryCounts = {}, onSelectMonth, currentMonth }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 h-full overflow-y-auto md:overflow-hidden p-1">
      {Array.from({ length: 12 }).map((_, i) => {
        const m = i + 1
        const count = memoryCounts[m] || 0
        const dim = daysInMonth(year, m)
        const full = count === dim && count > 0
        const botanical = botanicalForMonth(m, year)
        const isCurrent = currentMonth === m

        return (
          <motion.button
            key={m}
            type="button"
            onClick={() => onSelectMonth(m)}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, scale: 1.012 }}
            whileTap={{ scale: 0.995 }}
            className={`paper-tile hand-drawn-border rounded-xl px-4 pt-3 pb-3 flex flex-col text-left relative overflow-hidden focus:outline-none group min-h-0 ${
              isCurrent ? 'ring-1 ring-[hsl(var(--daisy-clay))]/40' : ''
            }`}
            style={full ? {
              boxShadow:
                '0 0 0 1px hsl(var(--daisy-butter) / 0.55), 0 6px 22px -8px hsl(var(--daisy-butter) / 0.35), 0 1px 3px hsl(var(--daisy-ink) / 0.08)'
            } : {}}
          >
            {/* fully-bloomed soft glow */}
            {full && (
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-1 rounded-2xl opacity-50"
                style={{
                  background:
                    'radial-gradient(60% 50% at 50% 100%, hsl(var(--daisy-butter) / 0.18), transparent 70%)'
                }}
              />
            )}

            {/* Header row: month name + (optional) bloom note */}
            <div className="relative flex items-baseline justify-between gap-2">
              <span className="font-serif-display text-[20px] tracking-tight text-[hsl(var(--daisy-ink))]">
                {MONTH_NAMES[i]}
              </span>
              {full ? (
                <span className="font-handwritten text-[15px] text-[hsl(var(--daisy-clay))] leading-none">
                  fully bloomed
                </span>
              ) : count > 0 ? (
                <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80 font-sans-clean">
                  {Math.round((count / dim) * 100)}%
                </span>
              ) : null}
            </div>

            {/* botanical species name */}
            <div className="relative text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80 font-sans-clean mt-1">
              {botanical.name}
            </div>

            {/* botanical preview - fills the card */}
            <div className="relative flex-1 min-h-0 mt-1 mb-1">
              <Botanical kind={botanical.key} count={count} year={year} />
            </div>

            {/* memories label */}
            <div className="relative flex items-baseline justify-between gap-2 mt-auto">
              <span className="font-serif-display italic text-[13px] text-muted-foreground">
                {count === 0
                  ? 'A still garden'
                  : `${count}/${dim} ${count === 1 ? 'memory' : 'memories'}`}
              </span>
              {isCurrent && (
                <span className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--daisy-clay))]/80 font-sans-clean">
                  here
                </span>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
