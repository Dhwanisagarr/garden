'use client'
import { PALETTES } from '@/lib/botanicals'

// SVG renderer for a single drifting particle, per botanical kind.
// Size ~14px square viewBox.
export function ParticleSVG({ kind = 'daisy', isDark = false }) {
  const p = PALETTES[kind] || PALETTES.daisy
  switch (kind) {
    case 'snowdrop':
      // tiny snowflake-like white petal
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <g transform="translate(7 7)">
            {[0, 60, 120].map(a => (
              <line key={a} x1="0" y1="-5" x2="0" y2="5"
                stroke={isDark ? '#EAE4DA' : '#fff'} strokeWidth="1.2"
                transform={`rotate(${a})`} strokeLinecap="round" />
            ))}
            <circle r="1.4" fill={isDark ? '#EAE4DA' : '#fff'} />
          </g>
        </svg>
      )
    case 'tulip':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path d="M 4 9 Q 3 2 7 1 Q 11 2 10 9 Q 7 6 4 9 Z" fill={p.flower} opacity="0.95" />
        </svg>
      )
    case 'cherry':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path d="M 7 2 Q 11 4 10 8 Q 7 11 4 8 Q 3 4 7 2 Z" fill={p.flower} />
          <circle cx="7" cy="7" r="1.2" fill={p.accent} />
        </svg>
      )
    case 'daisy':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <g transform="translate(7 7)">
            {[0,72,144,216,288].map(a => (
              <ellipse key={a} cx="0" cy="-3" rx="1.4" ry="3" fill={p.flower}
                transform={`rotate(${a})`} stroke={p.accent} strokeWidth="0.3" />
            ))}
            <circle r="1.6" fill={p.accent} />
          </g>
        </svg>
      )
    case 'rose':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path d="M 3 7 Q 3 2 7 2 Q 11 2 11 7 Q 7 11 3 7 Z" fill={p.flower} opacity="0.95" />
          <path d="M 5 7 Q 5 4 7 4 Q 9 4 9 7 Z" fill={p.accent} opacity="0.6" />
        </svg>
      )
    case 'sunflower':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <ellipse cx="7" cy="7" rx="2" ry="5" fill={p.flower} />
        </svg>
      )
    case 'lavender':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <circle cx="5" cy="6" r="1.6" fill={p.flower} />
          <circle cx="9" cy="8" r="1.4" fill={p.accent} opacity="0.85" />
          <circle cx="7" cy="4" r="1.2" fill={p.flower} />
        </svg>
      )
    case 'hibiscus':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path d="M 7 12 Q 2 8 4 3 Q 7 5 7 1 Q 7 5 10 3 Q 12 8 7 12 Z" fill={p.flower} />
          <circle cx="7" cy="7" r="1" fill={p.accent} />
        </svg>
      )
    case 'goldenwild':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <g transform="translate(7 7)">
            {[0,72,144,216,288].map(a => (
              <ellipse key={a} cx="0" cy="-3" rx="1.3" ry="3" fill={p.flower}
                transform={`rotate(${a})`} />
            ))}
            <circle r="1.4" fill={p.accent} />
          </g>
        </svg>
      )
    case 'maple':
      // tiny maple leaf
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <g transform="translate(7 7) scale(0.55)">
            <path d="M 0 -10 L 2 -6 L 5 -7 L 4 -3 L 9 -2 L 5 0 L 7 4 L 2 3 L 1 8 L 0 5 L -1 8 L -2 3 L -7 4 L -5 0 L -9 -2 L -4 -3 L -5 -7 L -2 -6 Z"
              fill={p.flower} />
          </g>
        </svg>
      )
    case 'pineberry':
      // tiny pine needles + a berry
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <line x1="7" y1="2" x2="2" y2="8" stroke={p.leaf} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="7" y1="2" x2="12" y2="8" stroke={p.leaf} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="7" y1="2" x2="7" y2="9" stroke={p.leaf} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="7" cy="11" r="1.6" fill={p.flower} />
        </svg>
      )
    case 'holly':
      // tiny holly leaf + berry
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <g transform="translate(7 7) scale(0.55)">
            <path d="M 0 -10 Q 5 -8 7 -4 Q 5 -3 4 -1 Q 6 1 4 3 Q 1 5 0 8 Q -1 5 -4 3 Q -6 1 -4 -1 Q -5 -3 -7 -4 Q -5 -8 0 -10 Z"
              fill={p.leaf} />
          </g>
          <circle cx="11" cy="11" r="1.5" fill={p.flower} />
        </svg>
      )
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 14 14">
          <ellipse cx="7" cy="7" rx="3" ry="6" fill={p.flower} opacity="0.85" />
        </svg>
      )
  }
}

// ---------- Butterfly (light-mode celebration) ----------
export function Butterfly({ color = '#9A744A' }) {
  return (
    <svg width="34" height="26" viewBox="0 0 34 26">
      <g>
        <path d="M 17 13 Q 6 2 3 10 Q 4 16 17 13 Z" fill={color} opacity="0.85" />
        <path d="M 17 13 Q 28 2 31 10 Q 30 16 17 13 Z" fill={color} opacity="0.85" />
        <path d="M 17 13 Q 8 22 4 18 Q 5 14 17 13 Z" fill={color} opacity="0.65" />
        <path d="M 17 13 Q 26 22 30 18 Q 29 14 17 13 Z" fill={color} opacity="0.65" />
        <ellipse cx="17" cy="13" rx="1" ry="6" fill="#3a2a1f" />
      </g>
    </svg>
  )
}

// ---------- Firefly (dark-mode celebration) ----------
export function Firefly() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <defs>
        <radialGradient id="ff-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE9A8" stopOpacity="1" />
          <stop offset="60%" stopColor="#E3C66A" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#E3C66A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="8" cy="8" r="8" fill="url(#ff-glow)" />
      <circle cx="8" cy="8" r="1.6" fill="#FFF6D9" />
    </svg>
  )
}
