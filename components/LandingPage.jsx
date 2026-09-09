'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import HoverBloom from '@/components/HoverBloom'

/**
 * LandingPage Component
 * Refined botanical doorway to DAHLIA Memory Garden.
 * Features handwritten botanical script wordmark, two rounded pill-shaped boxes
 * (Input field & primary CTA button) in natural garden tones with organic doodle accents.
 */
export default function LandingPage({ onGetStarted, defaultName = '' }) {
  const [name, setName] = useState(defaultName)
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  const trimmed = name.trim()
  const isValid = trimmed.length > 0

  const handleSubmit = (e) => {
    e?.preventDefault?.()
    if (!isValid) {
      setError(true)
      inputRef.current?.focus()
      return
    }
    onGetStarted(trimmed)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-10 overflow-y-auto sm:overflow-hidden select-none bg-[#F9F6F0] text-[#2B3528]"
    >
      {/* Background Canvas with Restrained Sage & Warm Clay Accent Colors */}
      <div className="absolute inset-0 z-0">
        <HoverBloom
          grid={true}
          gridSize={32}
          gridDotSize={1}
          gridColor="rgba(140, 155, 130, 0.14)"
          bloomScale={0.9}
          autoSpawn={true}
          maxBlooms={50}
          customColors={['#C86D51', '#D47A60', '#B95B43']}
          paperTint="rgba(244, 240, 230, 0.45)"
        />
      </div>

      {/* Main Center Content: Hero Branding & Pill Components */}
      <main className="relative z-10 w-full max-w-lg my-auto flex flex-col items-center text-center">
        {/* Header Title & Tagline with Handwritten Script Typography & Leaf Flourish */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-8 sm:mb-10 flex flex-col items-center"
        >
          <div className="relative inline-block mb-1">
            <h1 className="font-botanical-script text-[#576D50] text-7xl sm:text-8xl md:text-9xl leading-none tracking-normal capitalize py-1 px-3 select-none">
              Dahlia
            </h1>
            {/* Delicate Botanical Leaf Flourish */}
            <svg
              className="absolute -top-3 -right-6 w-10 h-10 sm:w-12 sm:h-12 text-[#637A5B] pointer-events-none opacity-90"
              viewBox="0 0 100 100"
              fill="currentColor"
              aria-hidden
            >
              <path d="M 20 80 C 40 50 60 30 75 15 C 77 13 80 16 78 18 C 65 35 48 55 25 82 Z" />
              <path d="M 50 48 C 40 38 35 32 38 28 C 42 24 50 32 55 42 Z" />
              <path d="M 62 36 C 70 28 78 24 80 28 C 82 32 74 38 65 40 Z" />
              <path d="M 72 22 C 68 12 65 8 70 8 C 75 8 76 15 74 20 Z" />
            </svg>
          </div>
          <p className="font-serif-display italic text-lg sm:text-xl text-[#62775C] font-light mt-1">
            Your memories, in bloom.
          </p>
        </motion.div>

        {/* Stacked Pill-Shaped Components Container with Organic Hand-Drawn Doodle Accents */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[360px] sm:max-w-[400px] px-2 py-4"
        >
          {/* Hand-drawn Doodles & Accents surrounding the stacked pills (Inspired by Reference) */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Top-Right Doodles: Leaf, Envelope, Heart, Sparks, Squiggle */}
            <svg
              className="absolute -top-10 right-0 w-44 h-16 pointer-events-none overflow-visible text-[#576D50]"
              viewBox="0 0 180 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Spark / Ray Lines \ | / */}
              <line x1="20" y1="20" x2="16" y2="10" />
              <line x1="28" y1="18" x2="28" y2="6" />
              <line x1="36" y1="20" x2="40" y2="10" />

              {/* Hand-drawn Leaf */}
              <path d="M 55 25 C 65 10 80 12 85 24 C 75 32 60 30 55 25 Z M 55 25 Q 70 20 85 24" />

              {/* Hand-drawn Envelope */}
              <path d="M 102 14 L 124 14 C 126 14 128 16 128 18 L 128 28 C 128 30 126 32 124 32 L 102 32 C 100 32 98 30 98 28 L 98 18 C 98 16 100 14 102 14 Z" />
              <path d="M 98 14 L 113 24 L 128 14" />

              {/* Hand-drawn Heart */}
              <path d="M 142 22 C 138 16 132 18 135 24 C 138 30 145 34 147 36 C 149 34 156 30 159 24 C 162 18 156 16 152 22 C 149 26 145 26 142 22 Z" />

              {/* Squiggle stroke ~ ~ */}
              <path d="M 35 48 Q 45 42 55 48 T 75 48" strokeWidth="1.8" opacity="0.8" />

              {/* Doodle text / symbols */}
              <text x="145" y="12" fill="currentColor" stroke="none" className="text-[10px] font-mono opacity-80 select-none">sos</text>
            </svg>

            {/* Left side Organic Accent Stroke ( ( */}
            <svg
              className="absolute top-1/2 -left-6 -translate-y-1/2 w-8 h-28 pointer-events-none text-[#576D50] opacity-80"
              viewBox="0 0 30 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M 22 10 C 8 30 8 70 22 90" />
              <path d="M 14 20 C 4 38 4 62 14 80" strokeWidth="1.5" opacity="0.7" />
            </svg>

            {/* Right side Double Curved Accent Arcs ) ) (matching reference image) */}
            <svg
              className="absolute top-1/2 -right-6 -translate-y-1/2 w-8 h-28 pointer-events-none text-[#576D50] opacity-85"
              viewBox="0 0 30 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M 8 10 C 22 30 22 70 8 90" />
              <path d="M 16 20 C 26 38 26 62 16 80" strokeWidth="1.5" opacity="0.75" />
            </svg>

            {/* Bottom hand-drawn accent line */}
            <svg
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-6 pointer-events-none text-[#576D50] opacity-70"
              viewBox="0 0 120 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M 10 10 C 40 16 80 4 110 10" />
            </svg>
          </div>

          {/* Form with two horizontally aligned, vertically stacked pill shapes */}
          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col items-center w-full space-y-3.5">
            {/* First Box: Name Input Pill (Soft Warm Nude Cream matching user's exact swatch) */}
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError(false)
                }}
                maxLength={48}
                placeholder="Write your name"
                className={`w-full h-14 px-6 text-center text-lg sm:text-xl font-serif-display font-medium rounded-full bg-[#FCE5C0] text-[#3D3024] placeholder:text-[#7A6450]/70 border shadow-xs transition-all duration-200 outline-none ${
                  error
                    ? 'border-red-600 ring-2 ring-red-500/30'
                    : 'border-[#ECCEA7] focus:border-[#C86D51] focus:ring-2 focus:ring-[#C86D51]/30 hover:bg-[#FBE0B8]'
                }`}
              />
              {error && (
                <span className="absolute -bottom-5 left-0 right-0 text-center text-xs text-red-600 font-sans-clean font-medium">
                  Please enter your name to continue
                </span>
              )}
            </div>

            {/* Second Box: Primary CTA Button Pill (Muted Botanical Sage Green matching reference bottom pill) */}
            <button
              type="submit"
              className="w-full h-14 px-6 rounded-full bg-[#576D50] hover:bg-[#485B42] text-[#F9F6F0] font-serif-display font-semibold text-lg sm:text-xl tracking-wide flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.015] active:scale-[0.985]"
            >
              Get Started
            </button>
          </form>
        </motion.div>

        {/* Subtle Hint */}
        <p className="text-[11px] tracking-wide text-[#65795E]/70 italic font-serif-display mt-8 pointer-events-none">
          Move your cursor to bloom soft botanical petals along your path.
        </p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-[10px] uppercase tracking-[0.22em] font-sans-clean text-[#65795E]/50 pointer-events-none">
        Botanical Memory Sanctuary
      </footer>
    </motion.div>
  )
}


