'use client'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import Botanical from '@/components/Botanical'
import { botanicalForMonth } from '@/lib/botanicals'
import { gardenTitle } from '@/lib/garden'

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

export const IG_CAROUSEL = { width: 1080, height: 1350 }
export const IG_STORY = { width: 1080, height: 1920 }
export const IG_MAX_CAROUSEL_SLIDES = 10

const LIGHT_PALETTE = {
  bg: '#F7F3EA',
  paper: '#FBF8EE',
  ink: '#4F4A44',
  inkSoft: 'rgba(79, 74, 68, 0.55)',
  inkFaint: 'rgba(79, 74, 68, 0.22)',
  border: 'rgba(79, 74, 68, 0.22)',
  clay: '#9A744A',
  daisyPetal: '#FBFAF3',
  daisyCenter: '#E3C66A',
  daisyEdge: '#9A744A',
  textureA: 'rgba(79,74,68,0.045)',
  textureB: 'rgba(79,74,68,0.028)',
}

const DARK_PALETTE = {
  bg: '#1F251E',
  paper: '#2D382B',
  ink: '#EAE4DA',
  inkSoft: 'rgba(234, 228, 218, 0.62)',
  inkFaint: 'rgba(234, 228, 218, 0.18)',
  border: 'rgba(234, 228, 218, 0.20)',
  clay: '#D8D0C4',
  daisyPetal: '#D8D0C4',
  daisyCenter: '#1F251E',
  daisyEdge: '#5E7253',
  textureA: 'rgba(234,228,218,0.04)',
  textureB: 'rgba(234,228,218,0.025)',
}

function sortedMemories(images) {
  return Object.entries(images || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, img]) => ({
      key,
      img,
      day: parseInt(key.split('-')[2], 10),
    }))
}

function formatMemoryDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function sheetStyle(C, width, height) {
  return {
    position: 'relative',
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: C.bg,
    color: C.ink,
    fontFamily: "'The Seasons', 'Cormorant Garamond', 'Instrument Serif', 'Playfair Display', Georgia, serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji'",
    overflow: 'hidden',
    backgroundImage:
      `radial-gradient(${C.textureA} 1px, transparent 1px), radial-gradient(${C.textureB} 1px, transparent 1px)`,
    backgroundSize: '32px 32px, 17px 17px',
    backgroundPosition: '0 0, 8px 11px',
    boxSizing: 'border-box',
  }
}

function DaisyMark({ C, size = 42 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse key={i} cx="30" cy="14" rx="5" ry="10"
          transform={`rotate(${i * 45} 30 30)`}
          fill={C.daisyPetal} stroke={C.daisyEdge} strokeWidth="0.8" />
      ))}
      <circle cx="30" cy="30" r="6" fill={C.daisyCenter} stroke={C.daisyEdge} strokeWidth="1" />
    </svg>
  )
}

function IdentityBlock({ C, gardenName, style = {} }) {
  const name = gardenTitle(gardenName) || 'Dhwani'
  return (
    <div style={{ lineHeight: 1, ...style }}>
      <div style={{
        fontFamily: "'The Seasons', 'Cormorant Garamond', 'Instrument Serif', 'Playfair Display', Georgia, serif",
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 34,
        color: C.clay,
        letterSpacing: '0.01em',
      }}>{name}</div>
      <div style={{
        fontSize: 10,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: C.inkSoft,
        marginTop: 8,
        fontFamily: 'Inter, sans-serif',
      }}>memory garden</div>
      <div style={{ fontSize: 18, marginTop: 6, lineHeight: 1 }} aria-hidden>🌼</div>
    </div>
  )
}

function CarouselCoverSlide({ innerRef, C, gardenName, year, month, botanical, memoryCount }) {
  return (
    <div ref={innerRef} style={{
      ...sheetStyle(C, IG_CAROUSEL.width, IG_CAROUSEL.height),
      display: 'flex',
      flexDirection: 'column',
      padding: '72px 64px 56px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <DaisyMark C={C} />
        <IdentityBlock C={C} gardenName={gardenName} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontSize: 58, fontWeight: 500, letterSpacing: '-0.01em', color: C.ink }}>
            {MONTH_NAMES[month - 1]}
          </span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 68, color: C.clay, lineHeight: 1 }}>
            {year}
          </span>
        </div>
        <div style={{
          marginTop: 12,
          fontSize: 12,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: C.inkSoft,
          fontFamily: 'Inter, sans-serif',
        }}>
          {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}
        </div>
        <div style={{ width: '100%', height: 280, marginTop: 36 }}>
          <Botanical kind={botanical.key} count={memoryCount} year={year} />
        </div>
        <div style={{
          marginTop: 24,
          fontFamily: "'Caveat', cursive",
          fontSize: 34,
          color: C.clay,
          fontStyle: 'italic',
        }}>
          {botanical.name.toLowerCase()}
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: 9,
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: C.inkSoft,
        opacity: 0.7,
        fontFamily: 'Inter, sans-serif',
      }}>
        Crafted by Dhwani
      </div>
    </div>
  )
}

function CarouselMemorySlide({ innerRef, C, gardenName, year, month, botanical, memory, slideIndex, totalSlides }) {
  return (
    <div ref={innerRef} style={{
      ...sheetStyle(C, IG_CAROUSEL.width, IG_CAROUSEL.height),
      display: 'flex',
      flexDirection: 'column',
      padding: '56px 52px 48px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <DaisyMark C={C} size={34} />
          <div>
            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 28,
              color: C.clay,
              lineHeight: 1,
            }}>
              {formatMemoryDate(memory.key)}
            </div>
            <div style={{
              fontSize: 9,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: C.inkSoft,
              marginTop: 4,
              fontFamily: 'Inter, sans-serif',
            }}>
              {MONTH_NAMES[month - 1]} {year}
            </div>
          </div>
        </div>
        <div style={{
          fontSize: 9,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: C.inkSoft,
          fontFamily: 'Inter, sans-serif',
        }}>
          {slideIndex}/{totalSlides}
        </div>
      </div>

      <div style={{
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        border: `1.4px solid ${C.border}`,
        backgroundColor: C.paper,
        boxShadow: '0 8px 28px -12px rgba(0,0,0,0.18)',
      }}>
        <img
          src={memory.img}
          alt=""
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      <div style={{
        marginTop: 28,
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: 18,
        alignItems: 'end',
      }}>
        <div style={{ height: 110 }}>
          <Botanical kind={botanical.key} count={1} year={year} />
        </div>
        <div>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 28,
            color: C.clay,
            fontStyle: 'italic',
            lineHeight: 1.1,
          }}>
            "Ordinary days, gently kept."
          </div>
          <div style={{
            marginTop: 10,
            fontSize: 9,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: C.inkSoft,
            fontFamily: 'Inter, sans-serif',
          }}>
            {gardenTitle(gardenName) || 'memory garden'} · {botanical.name.toLowerCase()}
          </div>
        </div>
      </div>
    </div>
  )
}

function StorySlide({ innerRef, C, gardenName, year, month, botanical, memories, memoryCount }) {
  const cols = memories.length <= 4 ? 2 : 3
  const rows = Math.ceil(memories.length / cols) || 1

  return (
    <div ref={innerRef} style={{
      ...sheetStyle(C, IG_STORY.width, IG_STORY.height),
      display: 'flex',
      flexDirection: 'column',
      padding: '72px 56px 56px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <DaisyMark C={C} size={44} />
          <IdentityBlock C={C} gardenName={gardenName} />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.01em', color: C.ink }}>
            {MONTH_NAMES[month - 1]}
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 36, color: C.clay, lineHeight: 1 }}>
            {year}
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: 16,
        minHeight: 0,
      }}>
        {memories.map((memory) => (
          <div key={memory.key} style={{
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
            backgroundColor: C.paper,
          }}>
            <img
              src={memory.img}
              alt=""
              crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              left: 8,
              bottom: 8,
              padding: '4px 8px',
              borderRadius: 999,
              background: `${C.bg}dd`,
              fontSize: 11,
              color: C.ink,
              fontFamily: "'Caveat', cursive",
            }}>
              {memory.day}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 28,
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: 20,
        alignItems: 'end',
      }}>
        <div style={{ height: 150 }}>
          <Botanical kind={botanical.key} count={memoryCount} year={year} />
        </div>
        <div>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 34,
            color: C.clay,
            fontStyle: 'italic',
          }}>
            "Ordinary days, gently kept."
          </div>
          <div style={{
            marginTop: 12,
            fontSize: 9,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: C.inkSoft,
            opacity: 0.7,
            fontFamily: 'Inter, sans-serif',
          }}>
            Crafted by Dhwani
          </div>
        </div>
      </div>
    </div>
  )
}

const ExportInstagram = forwardRef(function ExportInstagram(
  { year, month, images, isDark = false, gardenName = '' },
  ref
) {
  const coverRef = useRef(null)
  const memoryRefs = useRef([])
  const storyRef = useRef(null)

  const botanical = botanicalForMonth(month, year)
  const C = isDark ? DARK_PALETTE : LIGHT_PALETTE
  const memories = sortedMemories(images)
  const memoryCount = memories.length
  const carouselMemories = memories.slice(0, IG_MAX_CAROUSEL_SLIDES - 1)
  const totalCarouselSlides = 1 + carouselMemories.length

  useImperativeHandle(ref, () => ({
    getCarouselElements() {
      const slides = [coverRef.current, ...memoryRefs.current.filter(Boolean)]
      return slides.slice(0, IG_MAX_CAROUSEL_SLIDES)
    },
    getStoryElement() {
      return storyRef.current
    },
  }))

  return (
    <div aria-hidden style={{ position: 'fixed', left: '-10000px', top: 0, pointerEvents: 'none' }}>
      <CarouselCoverSlide
        innerRef={coverRef}
        C={C}
        gardenName={gardenName}
        year={year}
        month={month}
        botanical={botanical}
        memoryCount={memoryCount}
      />

      {carouselMemories.map((memory, idx) => (
        <CarouselMemorySlide
          key={memory.key}
          innerRef={(el) => { memoryRefs.current[idx] = el }}
          C={C}
          gardenName={gardenName}
          year={year}
          month={month}
          botanical={botanical}
          memory={memory}
          slideIndex={idx + 2}
          totalSlides={totalCarouselSlides}
        />
      ))}

      <StorySlide
        innerRef={storyRef}
        C={C}
        gardenName={gardenName}
        year={year}
        month={month}
        botanical={botanical}
        memories={memories}
        memoryCount={memoryCount}
      />
    </div>
  )
})

export default ExportInstagram
