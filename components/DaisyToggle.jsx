'use client'
import { motion } from 'framer-motion'

export default function DaisyToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      className="relative w-12 h-12 rounded-full flex items-center justify-center group focus:outline-none"
    >
      <motion.svg
        viewBox="0 0 60 60" className="w-11 h-11"
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* petals */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.ellipse
            key={i}
            cx="30" cy="14" rx="5" ry="10"
            transform={`rotate(${i * 45} 30 30)`}
            fill={isDark ? '#D8D0C4' : '#FBFAF3'}
            stroke={isDark ? '#5E7253' : '#9A744A'}
            strokeWidth="0.8"
            animate={{ scale: isDark ? 0.85 : 1 }}
            transition={{ duration: 0.6 }}
          />
        ))}
        {/* center */}
        <motion.circle
          cx="30" cy="30" r="6"
          animate={{ fill: isDark ? '#1F251E' : '#E3C66A' }}
          transition={{ duration: 0.6 }}
          stroke={isDark ? '#5E7253' : '#9A744A'} strokeWidth="1"
        />
        {/* moon hint in dark */}
        {isDark && (
          <motion.circle cx="32" cy="28" r="2.5" fill="#D8D0C4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        )}
      </motion.svg>
    </button>
  )
}
