'use client'
import { motion } from 'framer-motion'
import { PALETTES } from '@/lib/botanicals'

// Deterministic pseudo-random based on index, so positions are stable
function prand(i, salt = 0) {
  const x = Math.sin((i + 1) * 9301 + salt * 49297) * 233280
  return x - Math.floor(x)
}

// ---------- Flower head renderers (one per species) ----------
function FlowerHead({ kind, palette, scale = 1 }) {
  const s = scale
  switch (kind) {
    case 'snowdrop':
      return (
        <g transform={`scale(${s})`}>
          <line x1="0" y1="-2" x2="0" y2="2" stroke={palette.stem} strokeWidth="1" />
          <path d="M -4 -2 Q -5 4 0 6 Q 5 4 4 -2 Q 2 -1 0 -1 Q -2 -1 -4 -2 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.5" />
          <path d="M -2 0 Q -2 3 0 4 Q 2 3 2 0 Z" fill={palette.accent} opacity="0.5" />
        </g>
      )
    case 'tulip':
      return (
        <g transform={`scale(${s})`}>
          <path d="M -6 4 Q -7 -10 0 -11 Q 7 -10 6 4 Q 3 -1 0 -1 Q -3 -1 -6 4 Z" fill={palette.flower} />
          <path d="M -3 4 Q -3 -7 0 -8 Q 3 -7 3 4 Z" fill={palette.accent} opacity="0.7" />
        </g>
      )
    case 'cherry':
      return (
        <g transform={`scale(${s})`}>
          {[0, 72, 144, 216, 288].map(a => (
            <g key={a} transform={`rotate(${a})`}>
              <path d="M 0 -2 Q -3 -7 0 -9 Q 3 -7 0 -2 Z" fill={palette.flower} />
            </g>
          ))}
          <circle r="2" fill={palette.accent} />
          {Array.from({length:6}).map((_,i)=>(
            <line key={i} x1="0" y1="0" x2={Math.cos(i)*1.6} y2={Math.sin(i)*1.6} stroke={palette.accent} strokeWidth="0.4" />
          ))}
        </g>
      )
    case 'daisy':
      return (
        <g transform={`scale(${s})`}>
          {Array.from({length: 10}).map((_, i) => (
            <ellipse key={i} cx="0" cy="-7" rx="2.2" ry="6" fill={palette.flower}
              stroke={palette.accent} strokeWidth="0.3" opacity="0.95"
              transform={`rotate(${i * 36})`} />
          ))}
          <circle r="2.8" fill={palette.accent} />
          <circle r="1.4" fill={palette.stem} opacity="0.4" />
        </g>
      )
    case 'rose':
      return (
        <g transform={`scale(${s})`}>
          <circle r="8" fill={palette.flower} />
          <path d="M -6 0 Q 0 -8 6 0 Q 0 8 -6 0 Z" fill={palette.accent} opacity="0.5" />
          <circle r="5" fill={palette.flower} opacity="0.9" />
          <circle r="3" fill={palette.accent} opacity="0.7" />
          <circle r="1.4" fill={palette.flower} />
        </g>
      )
    case 'sunflower':
      return (
        <g transform={`scale(${s})`}>
          {Array.from({length: 14}).map((_, i) => (
            <ellipse key={i} cx="0" cy="-10" rx="2.6" ry="7" fill={palette.flower}
              stroke={palette.accent} strokeWidth="0.35"
              transform={`rotate(${i * (360/14)})`} />
          ))}
          <circle r="5" fill={palette.accent} />
          <circle r="3.4" fill={palette.stem} opacity="0.45" />
        </g>
      )
    case 'lavender':
      return (
        <g transform={`scale(${s})`}>
          {Array.from({length: 7}).map((_, i) => {
            const off = (i % 2 === 0) ? -1.2 : 1.2
            return (
              <g key={i} transform={`translate(${off} ${-i * 3.4})`}>
                <ellipse cx="0" cy="0" rx="1.8" ry="2.4" fill={palette.flower} />
                <ellipse cx={off*1.5} cy="-0.5" rx="1.3" ry="1.8" fill={palette.accent} opacity="0.85" />
              </g>
            )
          })}
        </g>
      )
    case 'hibiscus':
      return (
        <g transform={`scale(${s})`}>
          {[0, 72, 144, 216, 288].map(a => (
            <path key={a} transform={`rotate(${a})`}
              d="M 0 0 Q 5 -3 8 -10 Q 2 -7 0 0 Z" fill={palette.flower} />
          ))}
          <circle r="2" fill={palette.accent} />
          <line x1="0" y1="0" x2="0" y2="7" stroke={palette.accent} strokeWidth="0.8" />
          <circle cx="0" cy="8" r="1.2" fill={palette.accent} />
        </g>
      )
    case 'goldenwild':
      return (
        <g transform={`scale(${s})`}>
          {Array.from({length: 8}).map((_, i) => (
            <ellipse key={i} cx="0" cy="-6" rx="1.8" ry="5" fill={palette.flower}
              stroke={palette.accent} strokeWidth="0.3"
              transform={`rotate(${i * 45})`} />
          ))}
          <circle r="2.2" fill={palette.accent} />
        </g>
      )
    case 'maple':
      return (
        <g transform={`scale(${s})`}>
          {/* a stylized maple leaf */}
          <path
            d="M 0 -10 L 2 -6 L 5 -7 L 4 -3 L 9 -2 L 5 0 L 7 4 L 2 3 L 1 8 L 0 5 L -1 8 L -2 3 L -7 4 L -5 0 L -9 -2 L -4 -3 L -5 -7 L -2 -6 Z"
            fill={palette.flower} stroke={palette.accent} strokeWidth="0.4"
          />
          <line x1="0" y1="-10" x2="0" y2="8" stroke={palette.stem} strokeWidth="0.6" opacity="0.7" />
        </g>
      )
    case 'pineberry':
      return (
        <g transform={`scale(${s})`}>
          {/* pine sprig with berries cluster */}
          {Array.from({length: 8}).map((_,i)=>{
            const y = -10 + i*2.6
            const len = 7 - i * 0.5
            return (
              <g key={i}>
                <line x1="0" y1={y} x2={-len} y2={y - 1} stroke={palette.leaf} strokeWidth="1.2" strokeLinecap="round" />
                <line x1="0" y1={y} x2={len}  y2={y - 1} stroke={palette.leaf} strokeWidth="1.2" strokeLinecap="round" />
              </g>
            )
          })}
          <circle cx="-2" cy="3" r="2" fill={palette.flower} />
          <circle cx="2"  cy="4" r="2" fill={palette.flower} />
          <circle cx="0"  cy="6" r="2" fill={palette.flower} />
          <circle cx="-2" cy="3" r="0.6" fill="#fff" opacity="0.6" />
        </g>
      )
    case 'holly':
      return (
        <g transform={`scale(${s})`}>
          {/* holly leaves with spiky edges */}
          <path d="M 0 -10 Q 5 -8 7 -4 Q 5 -3 4 -1 Q 6 1 4 3 Q 1 5 0 8 Q -1 5 -4 3 Q -6 1 -4 -1 Q -5 -3 -7 -4 Q -5 -8 0 -10 Z"
            fill={palette.leaf} stroke={palette.stem} strokeWidth="0.4" />
          <path d="M -1 -7 Q 0 -2 1 -7" stroke={palette.stem} strokeWidth="0.4" fill="none" opacity="0.5" />
          <circle cx="-1.5" cy="2" r="1.6" fill={palette.flower} />
          <circle cx="1.5"  cy="3" r="1.6" fill={palette.flower} />
          <circle cx="0"    cy="5" r="1.6" fill={palette.flower} />
          <circle cx="-1.5" cy="2" r="0.5" fill="#fff" opacity="0.5" />
        </g>
      )
    default:
      return <circle r="5" fill={palette.flower} />
  }
}

// One realistic curved leaf
function Leaf({ x, y, rotate = 0, color = '#7a8f6a', size = 1, flipped = false }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${flipped ? -size : size} ${size})`}>
      <path d="M 0 0 Q 5 -4 12 -2 Q 8 1 0 0 Z" fill={color} opacity="0.95" />
      <path d="M 0 0 Q 6 -2 11 -2" stroke={color} strokeWidth="0.4" fill="none" opacity="0.5" />
    </g>
  )
}

// A curved stem path
function StemPath({ baseX, baseY, length, sway, color, width = 1.6 }) {
  const cx = baseX + Math.sin(sway) * 14
  const topX = baseX + sway * 8
  const topY = baseY - length
  return (
    <path
      d={`M ${baseX} ${baseY} Q ${cx} ${baseY - length / 2}, ${topX} ${topY}`}
      stroke={color} strokeWidth={width} fill="none" strokeLinecap="round"
    />
  )
}

// ---------- A full Bloom (stem + leaves + flower) ----------
function Bloom({ i, kind, palette, baseX, baseY, length, sway, scale, layer = 'front' }) {
  const topX = baseX + sway * 8
  const topY = baseY - length

  // Two optional leaves at different heights along the stem
  const showLeafA = prand(i, 17) > 0.15
  const showLeafB = prand(i, 18) > 0.55
  const leafAY = baseY - length * (0.32 + prand(i, 19) * 0.18)
  const leafBY = baseY - length * (0.6 + prand(i, 20) * 0.2)
  const leafAFlipped = prand(i, 21) > 0.5
  const leafBFlipped = !leafAFlipped
  const leafColor = palette.leaf || palette.stem

  // approximate stem x at given y (linear interp toward topX)
  const xAt = (y) => {
    const t = (baseY - y) / length
    return baseX + (topX - baseX) * t + Math.sin(t * Math.PI) * sway * 4
  }

  const stemWidth = layer === 'back' ? 1.1 : 1.6
  const stemColor = layer === 'back' ? palette.stem : palette.stem

  return (
    <>
      {/* stem */}
      <motion.g
        initial={{ opacity: 0, scaleY: 0.3 }}
        animate={{ opacity: layer === 'back' ? 0.6 : 1, scaleY: 1 }}
        style={{ transformOrigin: `${baseX}px ${baseY}px` }}
        transition={{ duration: 0.9, delay: i * 0.03, ease: 'easeOut' }}
      >
        <StemPath baseX={baseX} baseY={baseY} length={length} sway={sway} color={stemColor} width={stemWidth} />
        {showLeafA && (
          <Leaf
            x={xAt(leafAY)} y={leafAY}
            rotate={(leafAFlipped ? -20 : 20) + (prand(i, 22) - 0.5) * 14}
            color={leafColor} size={0.85 + prand(i, 23) * 0.35}
            flipped={leafAFlipped}
          />
        )}
        {showLeafB && (
          <Leaf
            x={xAt(leafBY)} y={leafBY}
            rotate={(leafBFlipped ? -25 : 25) + (prand(i, 24) - 0.5) * 14}
            color={leafColor} size={0.7 + prand(i, 25) * 0.35}
            flipped={leafBFlipped}
          />
        )}
      </motion.g>

      {/* flower head - static <g> handles position via attribute, motion.g handles scale/opacity */}
      <g transform={`translate(${topX} ${topY})`}>
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: layer === 'back' ? 0.85 : 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.35 + i * 0.03, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformOrigin: '0px 0px' }}
        >
          <g transform={`rotate(${(prand(i, 26) - 0.5) * 14})`}>
            <FlowerHead kind={kind} palette={palette} scale={scale} />
          </g>
        </motion.g>
      </g>
    </>
  )
}

export default function Botanical({ kind = 'daisy', count = 0 }) {
  const N = Math.min(count, 31)
  const palette = PALETTES[kind] || PALETTES.daisy

  // Distribute blooms across the ground naturally with slight overlap.
  // We use a wider X range and let positions overlap. Density grows with N.
  const blooms = []
  for (let i = 0; i < N; i++) {
    // place across 0..260 with small horizontal jitter
    const slot = (i / Math.max(N - 1, 1))
    const baseX = 18 + slot * 220 + (prand(i, 1) - 0.5) * 28   // allow overlap
    const baseY = 342 + (prand(i, 2) - 0.5) * 10
    const length = 60 + prand(i, 3) * 130                       // strong height variation
    const sway = (prand(i, 4) - 0.5) * 2.4
    const scale = 0.78 + prand(i, 5) * 0.55                     // size variation
    const layer = prand(i, 6) > 0.78 ? 'back' : 'front'
    blooms.push({ i, baseX, baseY, length, sway, scale, layer })
  }
  // draw back layer first so front blooms overlap them
  blooms.sort((a, b) => (a.layer === 'back' ? -1 : 1))

  return (
    <div className="relative w-full h-full flex flex-col">
      <svg viewBox="0 0 260 380" className="w-full h-full" preserveAspectRatio="xMidYMax meet">
        {/* soft ground line */}
        <path d="M 10 348 Q 130 354 250 346" stroke="hsl(var(--daisy-ink) / 0.18)" strokeWidth="1" fill="none" />

        {/* grass tufts */}
        {Array.from({length: 22}).map((_, i) => {
          const x = 10 + i * 11 + (prand(i, 9) - 0.5) * 8
          return <line key={i} x1={x} y1="348" x2={x + (prand(i,10)-0.5)*2} y2={348 - 3 - prand(i,11)*5}
            stroke="hsl(var(--daisy-ink) / 0.25)" strokeWidth="0.8" strokeLinecap="round" />
        })}

        {/* baseline subtle foliage so the garden never feels empty */}
        <g opacity="0.32">
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

        {/* blooms */}
        {blooms.map((b) => (
          <Bloom key={`b-${b.i}-${kind}`} {...b} kind={kind} palette={palette} />
        ))}
      </svg>
    </div>
  )
}
