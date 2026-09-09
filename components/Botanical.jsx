'use client'
import { motion } from 'framer-motion'
import { PALETTES } from '@/lib/botanicals'
import { getEcosystemForYear } from '@/lib/ecosystems'

// Stable pseudo-random generator
function prand(i, salt = 0) {
  const x = Math.sin((i + 1) * 9301 + salt * 49297) * 233280
  return x - Math.floor(x)
}

// ---------- 2026 BLOOM ECOSYSTEM: Hand-drawn Flower Heads ----------
function FlowerHead({ kind, palette, scale = 1, stage = 'full' }) {
  const s = scale
  switch (kind) {
    case 'snowdrop':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <path d="M 0 0 Q -2 -4 0 -7" stroke={palette.stem} strokeWidth="1.6" fill="none" />
            <path d="M 0 -6 Q -4 2 0 8 Q 4 2 0 -6 Z" fill={palette.stem} opacity="0.85" />
            <path d="M -1 0 Q 0 6 1 0 Z" fill={palette.flower} />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            <path d="M 0 0 Q -3 -5 0 -8" stroke={palette.stem} strokeWidth="1.8" fill="none" />
            <circle cx="0" cy="-8" r="2" fill={palette.stem} />
            <path d="M 0 -7 Q -9 4 -4 15 Q 0 18 0 8 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.5" />
            <path d="M 0 -7 Q 9 4 4 15 Q 0 18 0 8 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.5" />
            <path d="M -3 3 Q -3 10 0 12 Q 3 10 3 3 Z" fill={palette.accent} opacity="0.6" />
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          <path d="M 0 0 Q -2 -5 0 -8" stroke={palette.stem} strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="0" cy="-8" r="2.4" fill={palette.stem} />
          <path d="M 0 -7 Q -14 6 -7 20 Q 0 24 0 10 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.6" />
          <path d="M 0 -7 Q 14 6 7 20 Q 0 24 0 10 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.6" />
          <path d="M 0 -7 Q -7 9 0 22 Q 7 9 0 -7 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.5" />
          <path d="M -4 5 Q -5 13 0 16 Q 5 13 4 5 Z" fill={palette.accent} opacity="0.75" />
          <path d="M -2 11 Q 0 15 2 11" stroke={palette.stem} strokeWidth="1.2" fill="none" />
        </g>
      )

    case 'tulip':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <path d="M -5 4 Q -6 -12 0 -16 Q 6 -12 5 4 Z" fill={palette.stem} opacity="0.9" />
            <path d="M -3 4 Q -3 -14 0 -15 Q 3 -14 3 4 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            <path d="M -10 5 Q -12 -18 0 -21 Q 4 0 -10 5 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.5" />
            <path d="M 10 5 Q 12 -18 0 -21 Q -4 0 10 5 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.5" />
            <path d="M -6 5 Q -7 -19 0 -22 Q 7 -19 6 5 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.6" />
            <path d="M -3 5 Q -3 -12 0 -15 Q 3 -12 3 5 Z" fill={palette.accent} opacity="0.6" />
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          <path d="M -15 6 Q -20 -20 0 -25 Q -4 2 -15 6 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.6" />
          <path d="M 15 6 Q 20 -20 0 -25 Q 4 2 15 6 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.6" />
          <path d="M -10 6 Q -11 -23 0 -26 Q 11 -23 10 6 Q 0 2 -10 6 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.7" />
          <path d="M -5 6 Q -6 -16 0 -19 Q 6 -16 5 6 Z" fill={palette.accent} opacity="0.6" />
          <path d="M -2 4 Q -2 -11 0 -13" stroke="#fff" strokeWidth="0.9" opacity="0.45" fill="none" />
          <path d="M -5 6 Q 0 10 5 6 Z" fill={palette.stem} />
        </g>
      )

    case 'cherry':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <circle r="4" fill={palette.stem} />
            <circle r="3" fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            {[-35, 0, 35].map((a, i) => (
              <g key={i} transform={`rotate(${a})`}>
                <path d="M 0 -2 Q -7 -10 -4 -16 Q 0 -14 0 -18 Q 0 -14 4 -16 Q 7 -10 0 -2 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
              </g>
            ))}
            <circle r="3" fill={palette.accent} />
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          {[0, 72, 144, 216, 288].map(a => (
            <g key={a} transform={`rotate(${a})`}>
              <path
                d="M 0 -4 Q -11 -16 -7 -23 Q 0 -20 0 -25 Q 0 -20 7 -23 Q 11 -16 0 -4 Z"
                fill={palette.flower} stroke={palette.accent} strokeWidth="0.5"
              />
            </g>
          ))}
          <circle r="4.5" fill={palette.accent} opacity="0.95" />
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i * 36 * Math.PI) / 180
            const x2 = Math.cos(angle) * 8.5
            const y2 = Math.sin(angle) * 8.5
            return (
              <g key={i}>
                <line x1="0" y1="0" x2={x2} y2={y2} stroke={palette.accent} strokeWidth="0.75" />
                <circle cx={x2 * 1.12} cy={y2 * 1.12} r="1.1" fill={palette.accent} />
              </g>
            )
          })}
        </g>
      )

    case 'daisy':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <circle r="4.5" fill={palette.stem} />
            <circle r="3.2" fill={palette.accent} />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ellipse
                key={i} cx="0" cy="-10" rx="3" ry="8"
                fill={palette.flower} stroke={palette.accent} strokeWidth="0.4"
                transform={`rotate(${-60 + i * 18})`}
              />
            ))}
            <circle r="4.5" fill={palette.accent} />
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          {Array.from({ length: 14 }).map((_, i) => (
            <ellipse
              key={i} cx="0" cy="-15" rx="4.2" ry="12"
              fill={palette.flower} stroke={palette.accent} strokeWidth="0.45" opacity="0.96"
              transform={`rotate(${i * (360 / 14)})`}
            />
          ))}
          <circle r="6.5" fill={palette.accent} />
          <circle r="4.5" fill={palette.stem} opacity="0.25" />
          <circle r="2.2" fill={palette.accent} />
        </g>
      )

    case 'rose':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <path d="M -5 2 Q -6 -12 0 -16 Q 6 -12 5 2 Z" fill={palette.leaf || palette.stem} />
            <path d="M -3 2 Q -4 -13 0 -15 Q 4 -13 3 2 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            <path d="M -10 2 Q -14 -12 0 -16 Q 14 -12 10 2 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.5" />
            <circle r="7" fill={palette.accent} opacity="0.5" />
            <circle r="4" fill={palette.flower} />
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          <path d="M -17 2 Q -24 -15 0 -22 Q 24 -15 17 2 Q 0 13 -17 2 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.6" />
          <path d="M -13 -2 Q -17 -15 0 -18 Q 17 -15 13 -2 Q 0 9 -13 -2 Z" fill={palette.accent} opacity="0.35" />
          <circle r="12" fill={palette.flower} stroke={palette.accent} strokeWidth="0.5" />
          <path d="M -10 0 Q 0 -13 10 0 Q 0 13 -10 0 Z" fill={palette.accent} opacity="0.5" />
          <circle r="7" fill={palette.flower} />
          <circle r="4.2" fill={palette.accent} opacity="0.75" />
          <circle r="2.2" fill={palette.flower} />
        </g>
      )

    case 'sunflower':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <circle r="7" fill={palette.stem} />
            <circle r="5" fill={palette.accent} />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            {Array.from({ length: 10 }).map((_, i) => (
              <ellipse
                key={i} cx="0" cy="-12" rx="3.5" ry="9"
                fill={palette.flower} stroke={palette.accent} strokeWidth="0.4"
                transform={`rotate(${-70 + i * 15})`}
              />
            ))}
            <circle r="6.5" fill={palette.accent} />
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          {Array.from({ length: 16 }).map((_, i) => (
            <ellipse
              key={i} cx="0" cy="-18" rx="4.8" ry="13"
              fill={palette.flower} stroke={palette.accent} strokeWidth="0.5"
              transform={`rotate(${i * (360 / 16)})`}
            />
          ))}
          <circle r="9.5" fill={palette.accent} />
          <circle r="7" fill={palette.stem} opacity="0.5" />
          <circle r="3.8" fill={palette.accent} opacity="0.85" />
        </g>
      )

    case 'lavender':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <ellipse cx="0" cy="-10" rx="2.5" ry="6" fill={palette.flower} />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <ellipse key={i} cx={i % 2 === 0 ? -2 : 2} cy={-i * 4} rx="2.8" ry="3.8" fill={palette.flower} />
            ))}
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          {Array.from({ length: 9 }).map((_, i) => {
            const off = i % 2 === 0 ? -2.5 : 2.5
            const y = -i * 4.5
            return (
              <g key={i} transform={`translate(${off} ${y})`}>
                <ellipse cx="0" cy="0" rx="3.4" ry="4.5" fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
                <ellipse cx={off * 1.2} cy="-0.8" rx="2.4" ry="3.2" fill={palette.accent} opacity="0.8" />
              </g>
            )
          })}
          <ellipse cx="0" cy="-43" rx="2.6" ry="3.8" fill={palette.flower} />
        </g>
      )

    case 'hibiscus':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <path d="M -4 0 Q -5 -12 0 -16 Q 5 -12 4 0 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            {[0, 72, 144].map(a => (
              <path key={a} transform={`rotate(${a})`} d="M 0 0 Q 8 -5 13 -14 Q 5 -16 0 0 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
            ))}
            <circle r="3" fill={palette.accent} />
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          {[0, 72, 144, 216, 288].map(a => (
            <path
              key={a} transform={`rotate(${a})`}
              d="M 0 0 Q 11 -6 18 -20 Q 6 -22 0 0 Z"
              fill={palette.flower} stroke={palette.accent} strokeWidth="0.5"
            />
          ))}
          <circle r="4.5" fill={palette.accent} />
          <path d="M 0 0 Q 4 -13 9 -22" stroke={palette.accent} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="9" cy="-22" r="2.8" fill={palette.accent} />
          <circle cx="7" cy="-18" r="1.6" fill="#fff" opacity="0.75" />
          <circle cx="11" cy="-20" r="1.6" fill="#fff" opacity="0.75" />
        </g>
      )

    case 'goldenwild':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <circle r="4" fill={palette.accent} />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ellipse key={i} cx="0" cy="-9" rx="2.8" ry="7" fill={palette.flower} transform={`rotate(${i * 60})`} />
            ))}
            <circle r="3.5" fill={palette.accent} />
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          {Array.from({ length: 10 }).map((_, i) => (
            <ellipse
              key={i} cx="0" cy="-13" rx="3.5" ry="10"
              fill={palette.flower} stroke={palette.accent} strokeWidth="0.4"
              transform={`rotate(${i * 36})`}
            />
          ))}
          <circle r="4.8" fill={palette.accent} />
          <circle r="2.4" fill={palette.stem} opacity="0.3" />
        </g>
      )

    case 'maple':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <path d="M 0 -10 L 3 -6 L 7 -7 L 4 -2 Z" fill={palette.flower} />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            <path d="M 0 -14 L 3 -8 L 9 -10 L 7 -4 L 13 -2 L 7 2 Z" fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          <path
            d="M 0 -20 L 4 -12 L 13 -14 L 10 -6 L 19 -4 L 11 3 L 15 12 L 4 9 L 2 18 L 0 11 L -2 18 L -4 9 L -15 12 L -11 3 L -19 -4 L -10 -6 L -13 -14 L -4 -12 Z"
            fill={palette.flower} stroke={palette.accent} strokeWidth="0.6"
          />
          <line x1="0" y1="-20" x2="0" y2="15" stroke={palette.stem} strokeWidth="1" opacity="0.75" />
          <line x1="0" y1="-6" x2="-9" y2="-11" stroke={palette.stem} strokeWidth="0.6" opacity="0.65" />
          <line x1="0" y1="-6" x2="9" y2="-11" stroke={palette.stem} strokeWidth="0.6" opacity="0.65" />
        </g>
      )

    case 'pineberry':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <circle cx="0" cy="0" r="3.5" fill={palette.flower} />
            <circle cx="0" cy="0" r="1" fill="#fff" opacity="0.7" />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={i} x1="0" y1={-10 + i * 3} x2={i % 2 === 0 ? -8 : 8} y2={-12 + i * 3} stroke={palette.leaf} strokeWidth="1.6" strokeLinecap="round" />
            ))}
            <circle cx="0" cy="4" r="3.5" fill={palette.flower} />
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          {Array.from({ length: 9 }).map((_, i) => {
            const y = -17 + i * 3.6
            const len = 12 - i * 0.9
            return (
              <g key={i}>
                <line x1="0" y1={y} x2={-len} y2={y - 2} stroke={palette.leaf} strokeWidth="1.9" strokeLinecap="round" />
                <line x1="0" y1={y} x2={len}  y2={y - 2} stroke={palette.leaf} strokeWidth="1.9" strokeLinecap="round" />
              </g>
            )
          })}
          <circle cx="-3.8" cy="4" r="3.8" fill={palette.flower} />
          <circle cx="3.8"  cy="5" r="3.8" fill={palette.flower} />
          <circle cx="0"    cy="10" r="4.2" fill={palette.flower} />
          <circle cx="-3.8" cy="4" r="1.1" fill="#fff" opacity="0.75" />
          <circle cx="3.8"  cy="5" r="1.1" fill="#fff" opacity="0.75" />
          <circle cx="0"    cy="10" r="1.3" fill="#fff" opacity="0.75" />
        </g>
      )

    case 'holly':
      if (stage === 'bud') {
        return (
          <g transform={`scale(${s})`}>
            <circle cx="0" cy="0" r="3" fill={palette.flower} />
          </g>
        )
      }
      if (stage === 'half') {
        return (
          <g transform={`scale(${s})`}>
            <path d="M 0 -12 Q 6 -9 8 -4 Q 4 -2 0 6 Q -4 -2 -8 -4 Q -6 -9 0 -12 Z" fill={palette.leaf} stroke={palette.stem} strokeWidth="0.5" />
            <circle cx="0" cy="4" r="3" fill={palette.flower} />
          </g>
        )
      }
      return (
        <g transform={`scale(${s})`}>
          <path
            d="M 0 -19 Q 9 -15 12 -7 Q 8 -5 7 -2 Q 11 2 7 7 Q 2 10 0 15 Q -2 10 -7 7 Q -11 2 -7 -2 Q -8 -5 -12 -7 Q -9 -15 0 -19 Z"
            fill={palette.leaf} stroke={palette.stem} strokeWidth="0.6"
          />
          <path d="M 0 -15 Q 0 -2 0 11" stroke={palette.stem} strokeWidth="0.6" fill="none" opacity="0.5" />
          <circle cx="-3" cy="3" r="3.5" fill={palette.flower} />
          <circle cx="3"  cy="4" r="3.5" fill={palette.flower} />
          <circle cx="0"  cy="8" r="3.5" fill={palette.flower} />
          <circle cx="-3" cy="3" r="1" fill="#fff" opacity="0.75" />
          <circle cx="3"  cy="4" r="1" fill="#fff" opacity="0.75" />
          <circle cx="0"  cy="8" r="1" fill="#fff" opacity="0.75" />
        </g>
      )

    default:
      return <circle r="10" fill={palette.flower} />
  }
}

// ---------- 2027 HARVEST ECOSYSTEM: Hand-drawn Fruit & Harvest Botanical Heads ----------
function HarvestHead({ kind, palette, scale = 1, stage = 'full' }) {
  const s = scale
  switch (kind) {
    case 'citrus':
      return (
        <g transform={`scale(${s})`}>
          {/* Orange fruit */}
          <circle cx="0" cy="-6" r="13" fill={palette.flower} stroke={palette.stem} strokeWidth="0.7" />
          <circle cx="-3" cy="-9" r="3" fill={palette.accent} opacity="0.4" />
          <circle cx="0" cy="-19" r="2.2" fill={palette.stem} />
          <path d="M 0 -19 Q 10 -26 16 -18 Q 8 -14 0 -19 Z" fill={palette.leaf} />
        </g>
      )

    case 'blackberry':
      return (
        <g transform={`scale(${s})`}>
          {/* Cluster of blackberry drupelets */}
          {[
            { cx: -5, cy: -12, r: 4 }, { cx: 5, cy: -12, r: 4 },
            { cx: -7, cy: -6,  r: 4.5 }, { cx: 0, cy: -7,  r: 5 }, { cx: 7, cy: -6,  r: 4.5 },
            { cx: -4, cy: 0,   r: 4.5 }, { cx: 4, cy: 0,   r: 4.5 },
            { cx: 0,  cy: 5,   r: 4 }
          ].map((d, i) => (
            <g key={i}>
              <circle cx={d.cx} cy={d.cy} r={d.r} fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
              <circle cx={d.cx - 1} cy={d.cy - 1} r={d.r * 0.35} fill="#fff" opacity="0.3" />
            </g>
          ))}
          {/* Calyx leaves */}
          <path d="M 0 -16 L -5 -22 L 0 -19 L 5 -22 Z" fill={palette.leaf} />
        </g>
      )

    case 'olive':
      return (
        <g transform={`scale(${s})`}>
          {/* Slender olive leaves */}
          <path d="M 0 0 Q -14 -16 -24 -8 Q -10 -4 0 0 Z" fill={palette.leaf} stroke={palette.stem} strokeWidth="0.4" />
          <path d="M 0 0 Q 14 -16 24 -8 Q 10 -4 0 0 Z" fill={palette.leaf} stroke={palette.stem} strokeWidth="0.4" />
          {/* Olives */}
          <ellipse cx="-6" cy="-8" rx="5" ry="7" fill={palette.flower} stroke={palette.accent} strokeWidth="0.5" transform="rotate(-15 -6 -8)" />
          <ellipse cx="6" cy="-6" rx="5" ry="7.5" fill={palette.accent} stroke={palette.stem} strokeWidth="0.5" transform="rotate(20 6 -6)" />
          <circle cx="-7" cy="-10" r="1.2" fill="#fff" opacity="0.3" />
        </g>
      )

    case 'strawberry':
      return (
        <g transform={`scale(${s})`}>
          {/* Strawberry body */}
          <path d="M 0 -18 Q 12 -16 10 -2 Q 0 12 -10 -2 Q -12 -16 0 -18 Z" fill={palette.flower} stroke={palette.stem} strokeWidth="0.6" />
          {/* Seeds */}
          {[-6, 0, 6].map(x => (
            <circle key={`s1-${x}`} cx={x} cy="-8" r="0.9" fill={palette.accent} />
          ))}
          {[-4, 4].map(x => (
            <circle key={`s2-${x}`} cx={x} cy="-2" r="0.9" fill={palette.accent} />
          ))}
          <circle cx="0" cy="4" r="0.9" fill={palette.accent} />
          {/* Calyx leaves */}
          <path d="M 0 -18 L -7 -23 L -2 -19 L 0 -24 L 2 -19 L 7 -23 Z" fill={palette.leaf} />
        </g>
      )

    case 'cherryberry':
      return (
        <g transform={`scale(${s})`}>
          {/* Dangling stem */}
          <path d="M 0 -22 Q -8 -12 -10 0" stroke={palette.stem} strokeWidth="1.6" fill="none" />
          <path d="M 0 -22 Q 8 -12 10 2" stroke={palette.stem} strokeWidth="1.6" fill="none" />
          {/* Cherries */}
          <circle cx="-10" cy="2" r="8.5" fill={palette.flower} stroke={palette.stem} strokeWidth="0.5" />
          <circle cx="10" cy="4" r="8.5" fill={palette.flower} stroke={palette.stem} strokeWidth="0.5" />
          <circle cx="-12" cy="-1" r="2" fill="#fff" opacity="0.35" />
          <circle cx="8" cy="1" r="2" fill="#fff" opacity="0.35" />
          <path d="M 0 -22 Q -10 -26 -14 -20 Q -6 -18 0 -22 Z" fill={palette.leaf} />
        </g>
      )

    case 'fig':
      return (
        <g transform={`scale(${s})`}>
          {/* Fig teardrop shape */}
          <path d="M 0 -20 Q 5 -16 11 -6 Q 14 6 0 10 Q -14 6 -11 -6 Q -5 -16 0 -20 Z" fill={palette.flower} stroke={palette.stem} strokeWidth="0.6" />
          <path d="M -3 -12 Q -7 0 -2 7" stroke={palette.accent} strokeWidth="1" fill="none" opacity="0.4" />
          {/* Fig leaf */}
          <path d="M 0 -20 Q 12 -28 18 -18 Q 8 -14 0 -20 Z" fill={palette.leaf} />
        </g>
      )

    case 'pomegranate':
      return (
        <g transform={`scale(${s})`}>
          {/* Pomegranate sphere + crown */}
          <circle cx="0" cy="-4" r="12" fill={palette.flower} stroke={palette.stem} strokeWidth="0.6" />
          {/* Crown tip */}
          <path d="M -6 -16 L -4 -22 L 0 -18 L 4 -22 L 6 -16 Z" fill={palette.flower} stroke={palette.stem} strokeWidth="0.5" />
          {/* Seeds highlight window */}
          <path d="M -4 -8 Q 0 -12 5 -6 Q 2 0 -4 -8 Z" fill={palette.accent} opacity="0.6" />
          <circle cx="-2" cy="-6" r="1.2" fill="#fff" opacity="0.5" />
        </g>
      )

    case 'grape':
      return (
        <g transform={`scale(${s})`}>
          {/* Cluster of grapes */}
          {[
            { cx: -6, cy: -14, r: 4 }, { cx: 0, cy: -14, r: 4 }, { cx: 6, cy: -14, r: 4 },
            { cx: -7, cy: -7,  r: 4.2 }, { cx: -2, cy: -7,  r: 4.5 }, { cx: 3, cy: -7,  r: 4.5 }, { cx: 8, cy: -7,  r: 4.2 },
            { cx: -4, cy: 0,   r: 4.2 }, { cx: 1, cy: 0,   r: 4.5 }, { cx: 5, cy: 0,   r: 4.2 },
            { cx: -2, cy: 6,   r: 4 }, { cx: 2, cy: 6,   r: 4 },
            { cx: 0,  cy: 11,  r: 3.5 }
          ].map((g, i) => (
            <g key={i}>
              <circle cx={g.cx} cy={g.cy} r={g.r} fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
              <circle cx={g.cx - 1} cy={g.cy - 1} r={g.r * 0.3} fill="#fff" opacity="0.3" />
            </g>
          ))}
          {/* Grape vine leaf & tendril */}
          <path d="M 0 -18 Q -10 -26 -16 -18 Q -6 -14 0 -18 Z" fill={palette.leaf} />
          <path d="M 0 -18 Q 8 -24 14 -22 Q 10 -16 16 -14" stroke={palette.stem} strokeWidth="1" fill="none" />
        </g>
      )

    case 'apple':
      return (
        <g transform={`scale(${s})`}>
          {/* Apple fruit */}
          <path d="M 0 -16 C -14 -16 -14 6 0 10 C 14 6 14 -16 0 -16 Z" fill={palette.flower} stroke={palette.stem} strokeWidth="0.6" />
          <path d="M -4 -16 Q 0 -12 0 -20" stroke={palette.stem} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 0 -20 Q 10 -25 15 -17 Q 7 -15 0 -20 Z" fill={palette.leaf} />
          <circle cx="-4" cy="-8" r="3" fill={palette.accent} opacity="0.4" />
        </g>
      )

    case 'pumpkin':
      return (
        <g transform={`scale(${s})`}>
          {/* Ribbed pumpkin */}
          <ellipse cx="0" cy="-2" rx="14" ry="10" fill={palette.flower} stroke={palette.stem} strokeWidth="0.6" />
          <ellipse cx="-6" cy="-2" rx="8" ry="9.5" fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
          <ellipse cx="6" cy="-2" rx="8" ry="9.5" fill={palette.flower} stroke={palette.accent} strokeWidth="0.4" />
          <path d="M 0 -12 Q -2 -18 -4 -22 Q 0 -18 2 -22 Z" fill={palette.leaf} stroke={palette.stem} strokeWidth="0.8" />
        </g>
      )

    case 'pear':
      return (
        <g transform={`scale(${s})`}>
          {/* Pear body */}
          <path d="M 0 -20 Q 7 -18 6 -8 Q 14 -2 11 8 Q 0 13 -11 8 Q -14 -2 -6 -8 Q -7 -18 0 -20 Z" fill={palette.flower} stroke={palette.stem} strokeWidth="0.6" />
          <path d="M 0 -20 Q -2 -24 -4 -26" stroke={palette.stem} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 0 -20 Q 8 -26 14 -20 Q 6 -17 0 -20 Z" fill={palette.leaf} />
          <circle cx="-3" cy="-2" r="3" fill={palette.accent} opacity="0.4" />
        </g>
      )

    case 'cranberry':
      return (
        <g transform={`scale(${s})`}>
          {/* Cranberry cluster */}
          <circle cx="-6" cy="-8" r="6" fill={palette.flower} stroke={palette.stem} strokeWidth="0.5" />
          <circle cx="6" cy="-6" r="6.5" fill={palette.flower} stroke={palette.stem} strokeWidth="0.5" />
          <circle cx="0" cy="2" r="7" fill={palette.flower} stroke={palette.stem} strokeWidth="0.5" />
          <circle cx="-7" cy="-10" r="1.5" fill="#fff" opacity="0.4" />
          <circle cx="5" cy="-8" r="1.5" fill="#fff" opacity="0.4" />
          <circle cx="-1" cy="0" r="1.5" fill="#fff" opacity="0.4" />
          <path d="M 0 -14 Q -10 -22 -16 -16" stroke={palette.leaf} strokeWidth="1.6" fill="none" />
          <path d="M 0 -14 Q 10 -22 16 -16" stroke={palette.leaf} strokeWidth="1.6" fill="none" />
        </g>
      )

    default:
      return <circle r="10" fill={palette.flower} />
  }
}

// Proportional organic leaf
function Leaf({ x, y, rotate = 0, color = '#7a8f6a', size = 1, flipped = false }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${flipped ? -size : size} ${size})`}>
      <path d="M 0 0 Q 9 -7 20 -3 Q 13 4 0 0 Z" fill={color} opacity="0.92" stroke={color} strokeWidth="0.3" />
      <path d="M 0 0 Q 10 -3 18 -3" stroke={color} strokeWidth="0.5" fill="none" opacity="0.65" />
    </g>
  )
}

// Organic Cubic Bezier Stem
function CubicStemPath({ baseX, baseY, cp1X, cp1Y, cp2X, cp2Y, topX, topY, color, width = 2.5 }) {
  return (
    <path
      d={`M ${baseX} ${baseY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${topX} ${topY}`}
      stroke={color} strokeWidth={width} fill="none" strokeLinecap="round"
    />
  )
}

// ---------- A Full Illustrated Plant Unit ----------
function PlantUnit({ i, kind, palette, baseX, baseY, length, sway, scale, stage, layer, isHarvest }) {
  const topX = baseX + sway * 14
  const topY = baseY - length

  const cp1X = baseX + (prand(i, 11) - 0.5) * 22
  const cp1Y = baseY - length * 0.35
  const cp2X = topX - (prand(i, 12) - 0.5) * 18
  const cp2Y = baseY - length * 0.72

  // Leaves
  const showLeafA = prand(i, 17) > 0.15
  const showLeafB = prand(i, 18) > 0.48
  const tA = 0.3 + prand(i, 19) * 0.22
  const tB = 0.62 + prand(i, 20) * 0.22

  const pointAtT = (t) => {
    const mt = 1 - t
    const x = mt * mt * mt * baseX + 3 * mt * mt * t * cp1X + 3 * mt * t * t * cp2X + t * t * t * topX
    const y = mt * mt * mt * baseY + 3 * mt * mt * t * cp1Y + 3 * mt * t * t * cp2Y + t * t * t * topY
    return { x, y }
  }

  const pA = pointAtT(tA)
  const pB = pointAtT(tB)
  const leafAFlipped = prand(i, 21) > 0.5
  const leafBFlipped = !leafAFlipped
  const leafColor = palette.leaf || palette.stem

  const stemWidth = layer === 'hero' ? 3.0 : layer === 'mid' ? 2.3 : 1.7
  const stemColor = palette.stem
  const layerOpacity = layer === 'hero' ? 1 : layer === 'mid' ? 0.95 : 0.65

  return (
    <>
      {/* Stem & Leaves */}
      <motion.g
        initial={{ opacity: 0, scaleY: 0.2 }}
        animate={{ opacity: layerOpacity, scaleY: 1 }}
        style={{ transformOrigin: `${baseX}px ${baseY}px` }}
        transition={{ duration: 0.85, delay: i * 0.025, ease: 'easeOut' }}
      >
        <CubicStemPath
          baseX={baseX} baseY={baseY}
          cp1X={cp1X} cp1Y={cp1Y}
          cp2X={cp2X} cp2Y={cp2Y}
          topX={topX} topY={topY}
          color={stemColor} width={stemWidth}
        />
        {showLeafA && (
          <Leaf
            x={pA.x} y={pA.y}
            rotate={(leafAFlipped ? -26 : 26) + (prand(i, 22) - 0.5) * 16}
            color={leafColor} size={0.9 + prand(i, 23) * 0.45}
            flipped={leafAFlipped}
          />
        )}
        {showLeafB && (
          <Leaf
            x={pB.x} y={pB.y}
            rotate={(leafBFlipped ? -30 : 30) + (prand(i, 24) - 0.5) * 16}
            color={leafColor} size={0.75 + prand(i, 25) * 0.45}
            flipped={leafBFlipped}
          />
        )}
      </motion.g>

      {/* Head Renderer (Flower vs Harvest) */}
      <g transform={`translate(${topX} ${topY})`}>
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: layerOpacity, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.25 + i * 0.025, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformOrigin: '0px 0px' }}
        >
          <g
            transform={`rotate(${(prand(i, 26) - 0.5) * 20})`}
            style={layer === 'hero' ? { filter: 'drop-shadow(0px 3px 6px rgba(0,0,0,0.12))' } : {}}
          >
            {isHarvest ? (
              <HarvestHead kind={kind} palette={palette} scale={scale} stage={stage} />
            ) : (
              <FlowerHead kind={kind} palette={palette} scale={scale} stage={stage} />
            )}
          </g>
        </motion.g>
      </g>
    </>
  )
}

export default function Botanical({ kind = 'daisy', count = 0, year = 2026 }) {
  const N = Math.min(count, 31)
  const eco = getEcosystemForYear(year)
  const isHarvest = eco.type === 'harvest'
  const palette = PALETTES[kind] || PALETTES.daisy

  // ---------- Organic Clustering Layout Engine ----------
  const CLUSTERS = [65, 135, 195, 100, 165]

  const plants = []
  for (let i = 0; i < N; i++) {
    const clusterIdx = i % CLUSTERS.length
    const centerX = CLUSTERS[clusterIdx]

    const inClusterPos = Math.floor(i / CLUSTERS.length)
    let stage = 'full'
    let layer = 'mid'
    let scale = 1.15
    let length = 95

    if (inClusterPos === 0) {
      stage = 'full'
      layer = 'hero'
      scale = 1.45 + prand(i, 1) * 0.25
      length = 115 + prand(i, 2) * 25
    } else if (inClusterPos === 1) {
      stage = prand(i, 3) > 0.3 ? 'full' : 'half'
      layer = 'mid'
      scale = 1.1 + prand(i, 4) * 0.25
      length = 90 + prand(i, 5) * 22
    } else {
      stage = prand(i, 6) > 0.4 ? 'half' : 'bud'
      layer = prand(i, 7) > 0.5 ? 'back' : 'mid'
      scale = 0.8 + prand(i, 8) * 0.3
      length = 70 + prand(i, 9) * 24
    }

    const offsetX = (prand(i, 10) - 0.5) * 32
    const baseX = Math.max(26, Math.min(234, centerX + offsetX))

    const baseY = 348 + (prand(i, 13) - 0.5) * 10
    const sway = (prand(i, 14) - 0.5) * 2.2

    plants.push({ i, baseX, baseY, length, sway, scale, stage, layer })
  }

  plants.sort((a, b) => {
    const rank = { back: 1, mid: 2, hero: 3 }
    return rank[a.layer] - rank[b.layer]
  })

  return (
    <div className="relative w-full h-full flex flex-col">
      <svg viewBox="0 0 260 380" className="w-full h-full" preserveAspectRatio="xMidYMax meet">
        {/* Ground Soil & Soft Meadow Texture */}
        <path
          d="M 0 352 Q 65 344 130 350 T 260 346 L 260 380 L 0 380 Z"
          fill="hsl(var(--daisy-clay) / 0.06)"
        />
        <path
          d="M 0 356 Q 80 348 160 354 T 260 350 L 260 380 L 0 380 Z"
          fill="hsl(var(--daisy-sage) / 0.08)"
        />
        <path
          d="M 10 349 Q 130 355 250 347"
          stroke="hsl(var(--daisy-ink) / 0.22)" strokeWidth="1.2" fill="none"
        />

        {/* Wild Grass Tufts & Field Blades */}
        {Array.from({ length: 26 }).map((_, i) => {
          const x = 10 + i * 9.5 + (prand(i, 9) - 0.5) * 6
          const yBase = 349 + (prand(i, 10) - 0.5) * 4
          const h = 6 + prand(i, 11) * 9
          return (
            <line
              key={i}
              x1={x} y1={yBase}
              x2={x + (prand(i, 12) - 0.5) * 5} y2={yBase - h}
              stroke="hsl(var(--daisy-ink) / 0.26)"
              strokeWidth="0.9" strokeLinecap="round"
            />
          )
        })}

        {/* Expectant / Ground Cover Shoots (Active when count=0 or low count) */}
        <g opacity={N === 0 ? 0.8 : 0.4}>
          {Array.from({ length: 5 }).map((_, i) => {
            const x = 35 + i * 44 + (prand(i, 21) - 0.5) * 16
            const h = 20 + prand(i, 22) * 14
            return (
              <g key={`base-${i}`}>
                <path
                  d={`M ${x} 349 Q ${x + 3} ${349 - h / 2}, ${x + (prand(i, 23) - 0.5) * 8} ${349 - h}`}
                  stroke={palette.stem} strokeWidth="1.6" fill="none" strokeLinecap="round"
                />
                <circle
                  cx={x + (prand(i, 23) - 0.5) * 8} cy={349 - h}
                  r={N === 0 ? 2.8 : 2} fill={palette.flower || palette.stem} opacity="0.8"
                />
              </g>
            )
          })}
        </g>

        {/* Illustrated Plants */}
        {plants.map((p) => (
          <PlantUnit key={`p-${p.i}-${kind}`} {...p} kind={kind} palette={palette} isHarvest={isHarvest} />
        ))}
      </svg>
    </div>
  )
}
