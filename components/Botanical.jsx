'use client'
import { motion } from 'framer-motion'

// Deterministic pseudo-random based on index, so positions are stable
function prand(i, salt = 0) {
  const x = Math.sin((i + 1) * 9301 + salt * 49297) * 233280
  return x - Math.floor(x)
}

function Stem({ x, y, length = 90, sway = 0, color = '#5E7253' }) {
  const cx = x + Math.sin(sway) * 12
  return (
    <path
      d={`M ${x} ${y} Q ${cx} ${y - length / 2}, ${x + sway * 6} ${y - length}`}
      stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"
    />
  )
}

function Leaf({ x, y, rotate = 0, color = '#7a8f6a' }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d="M 0 0 Q 8 -4 14 0 Q 8 4 0 0 Z" fill={color} opacity="0.9" />
    </g>
  )
}

// Generic flower renderer per botanical
function FlowerHead({ kind, palette }) {
  switch (kind) {
    case 'snowdrop':
      return (
        <g>
          <ellipse cx="0" cy="0" rx="5" ry="8" fill={palette.flower} />
          <ellipse cx="-3" cy="-2" rx="2" ry="6" fill="#fff" opacity="0.7" />
          <circle cx="0" cy="6" r="2" fill={palette.accent} />
        </g>
      )
    case 'tulip':
      return (
        <g>
          <path d="M -6 4 Q -6 -8 0 -10 Q 6 -8 6 4 Z" fill={palette.flower} />
          <path d="M -3 4 Q -3 -6 0 -8 Q 3 -6 3 4 Z" fill={palette.accent} opacity="0.7" />
        </g>
      )
    case 'cherry':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-6" rx="3.4" ry="5" fill={palette.flower}
              transform={`rotate(${a})`} />
          ))}
          <circle r="2" fill={palette.accent} />
        </g>
      )
    case 'daisy':
      return (
        <g>
          {Array.from({length: 8}).map((_, i) => (
            <ellipse key={i} cx="0" cy="-6" rx="2.4" ry="5" fill={palette.flower}
              transform={`rotate(${i * 45})`} />
          ))}
          <circle r="2.6" fill={palette.accent} />
        </g>
      )
    case 'rose':
      return (
        <g>
          <circle r="7" fill={palette.flower} />
          <circle r="5" fill={palette.accent} opacity="0.65" />
          <circle r="3" fill={palette.flower} />
          <circle r="1.4" fill={palette.accent} />
        </g>
      )
    case 'sunflower':
      return (
        <g>
          {Array.from({length: 12}).map((_, i) => (
            <ellipse key={i} cx="0" cy="-8" rx="2.6" ry="6" fill={palette.flower}
              transform={`rotate(${i * 30})`} />
          ))}
          <circle r="4" fill={palette.accent} />
        </g>
      )
    case 'lavender':
      return (
        <g>
          {Array.from({length: 6}).map((_, i) => (
            <circle key={i} cx="0" cy={-i * 4} r={2.4 - i * 0.15} fill={palette.flower} />
          ))}
        </g>
      )
    case 'hibiscus':
      return (
        <g>
          {[0,72,144,216,288].map(a => (
            <path key={a} transform={`rotate(${a})`} d="M 0 0 Q 6 -2 8 -8 Q 4 -6 0 0 Z" fill={palette.flower} />
          ))}
          <circle r="2" fill={palette.accent} />
          <line x1="0" y1="0" x2="0" y2="6" stroke={palette.accent} strokeWidth="1" />
        </g>
      )
    case 'goldenleaf':
      return (
        <g>
          <path d="M 0 -10 Q 7 -2 0 8 Q -7 -2 0 -10 Z" fill={palette.flower} />
          <line x1="0" y1="-10" x2="0" y2="8" stroke={palette.accent} strokeWidth="0.8" />
        </g>
      )
    case 'autumnvine':
      return (
        <g>
          <path d="M -6 0 Q -3 -7 0 0 Q 3 7 6 0 Q 3 -7 0 0 Q -3 7 -6 0 Z" fill={palette.flower} opacity="0.85" />
          <circle r="2" fill={palette.accent} />
        </g>
      )
    case 'pine':
      return (
        <g>
          {Array.from({length:7}).map((_,i)=>(
            <line key={i} x1="0" y1={-i*3} x2={i%2?6:-6} y2={-i*3 - 2}
              stroke={palette.flower} strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </g>
      )
    case 'berries':
      return (
        <g>
          <circle cx="-3" cy="-3" r="3" fill={palette.flower} />
          <circle cx="3" cy="-1" r="3" fill={palette.flower} />
          <circle cx="0" cy="3" r="3" fill={palette.flower} />
          <circle cx="-3" cy="-3" r="1" fill="#fff" opacity="0.5" />
        </g>
      )
    default:
      return <circle r="5" fill={palette.flower} />
  }
}

const PALETTES = {
  snowdrop:   { stem:'#6b8a5a', flower:'#f3f5ef', accent:'#cdd6a8' },
  tulip:      { stem:'#6b8a5a', flower:'#e07a6b', accent:'#f2c46a' },
  cherry:     { stem:'#7a5a4a', flower:'#f3c8d0', accent:'#c97a8c' },
  daisy:      { stem:'#7a8f6a', flower:'#fbfaf3', accent:'#E3C66A' },
  rose:       { stem:'#6b8a5a', flower:'#c8556a', accent:'#f0c5c9' },
  sunflower:  { stem:'#6b8a5a', flower:'#E3C66A', accent:'#9A744A' },
  lavender:   { stem:'#6b8a5a', flower:'#a98bc4', accent:'#cdbedf' },
  hibiscus:   { stem:'#6b8a5a', flower:'#d65a6b', accent:'#f5e07b' },
  goldenleaf: { stem:'#9A744A', flower:'#d8a04a', accent:'#9A744A' },
  autumnvine: { stem:'#9A744A', flower:'#c4663a', accent:'#7b3a1a' },
  pine:       { stem:'#4a5e3f', flower:'#5E7253', accent:'#9A744A' },
  berries:    { stem:'#4a5e3f', flower:'#b23a4a', accent:'#5E7253' },
}

export default function Botanical({ kind = 'daisy', count = 0, month = 'June', monthName, themeMode }) {
  // count caps at 31. Each "plant" has a stem + flower head. We draw up to count stems.
  const max = 31
  const N = Math.min(count, max)
  const palette = PALETTES[kind] || PALETTES.daisy

  // Generate stable stem positions across a wide base
  const stems = []
  for (let i = 0; i < N; i++) {
    const t = i / Math.max(N - 1, 1)
    const baseX = 30 + prand(i, 1) * 200 // 30..230
    const baseY = 340 + prand(i, 2) * 8
    const length = 70 + prand(i, 3) * 110
    const sway = (prand(i, 4) - 0.5) * 1.8
    const headX = baseX + sway * 6
    const headY = baseY - length
    stems.push({ baseX, baseY, length, sway, headX, headY, i })
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      <svg viewBox="0 0 260 380" className="w-full h-full" preserveAspectRatio="xMidYMax meet">
        {/* soft ground line */}
        <path d="M 10 348 Q 130 354 250 346" stroke="hsl(var(--daisy-ink) / 0.18)" strokeWidth="1" fill="none" />
        {/* tiny grass tufts */}
        {Array.from({length: 18}).map((_, i) => {
          const x = 15 + i * 13 + (prand(i, 9) - 0.5) * 6
          return <line key={i} x1={x} y1="348" x2={x + (prand(i,10)-0.5)*2} y2={348 - 3 - prand(i,11)*5}
            stroke="hsl(var(--daisy-ink) / 0.25)" strokeWidth="0.8" strokeLinecap="round" />
        })}

        {/* baseline subtle foliage so the garden never feels empty */}
        <g opacity="0.35">
          {Array.from({length: 5}).map((_, i) => {
            const x = 40 + i * 45 + (prand(i, 21) - 0.5) * 18
            const h = 22 + prand(i, 22) * 14
            return (
              <g key={`base-${i}`}>
                <path d={`M ${x} 348 Q ${x + 2} ${348 - h/2}, ${x + (prand(i,23)-0.5)*8} ${348 - h}`}
                  stroke={palette.stem} strokeWidth="1.4" fill="none" strokeLinecap="round" />
                <ellipse cx={x + (prand(i,24)-0.5)*6} cy={348 - h} rx="3" ry="2.4" fill={palette.stem} opacity="0.7" />
              </g>
            )
          })}
        </g>

        {/* stems */}
        {stems.map((s) => (
          <motion.g key={`stem-${s.i}`}
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            style={{ transformOrigin: `${s.baseX}px ${s.baseY}px` }}
            transition={{ duration: 0.9, delay: s.i * 0.04, ease: 'easeOut' }}
          >
            <Stem x={s.baseX} y={s.baseY} length={s.length} sway={s.sway} color={palette.stem} />
            {/* maybe a leaf */}
            {prand(s.i, 5) > 0.5 && (
              <Leaf x={s.baseX + s.sway * 3} y={s.baseY - s.length * 0.55}
                rotate={prand(s.i, 6) > 0.5 ? 25 : -25} color={palette.stem} />
            )}
          </motion.g>
        ))}

        {/* flower heads */}
        {stems.map((s) => (
          <motion.g key={`head-${s.i}`}
            transform={`translate(${s.headX} ${s.headY})`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 + s.i * 0.04, ease: 'backOut' }}
          >
            <FlowerHead kind={kind} palette={palette} />
          </motion.g>
        ))}
      </svg>
    </div>
  )
}
