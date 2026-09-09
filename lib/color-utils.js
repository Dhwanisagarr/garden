/**
 * Color utility functions for unified theme generation, intelligent Light/Dark theme adaptation,
 * contrast calculation, and background image contrast analysis.
 */

// Convert HEX color to HSL object { h: [0..360], s: [0..100], l: [0..100] }
export function hexToHsl(hex) {
  if (!hex || typeof hex !== 'string') return { h: 39, s: 41, l: 94 }
  let clean = hex.replace('#', '')
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('')
  }
  if (clean.length !== 6) return { h: 39, s: 41, l: 94 }

  const r = parseInt(clean.substring(0, 2), 16) / 255
  const g = parseInt(clean.substring(2, 4), 16) / 255
  const b = parseInt(clean.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// Convert HSL values to HEX string
export function hslToHex(h, s, l) {
  h /= 360
  s /= 100
  l /= 100
  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Given a background color in Hex, derives a rich Dark-Mode counterpart
 * that preserves the user's selected hue identity.
 */
export function deriveDarkModeColor(hex) {
  const { h, s } = hexToHsl(hex)
  const darkS = Math.min(Math.max(s * 0.5, 12), 35)
  const darkL = 14
  return hslToHex(h, darkS, darkL)
}

/**
 * Given a dark background color in Hex, derives a soft Light-Mode counterpart
 * that preserves the user's selected hue identity.
 */
export function deriveLightModeColor(hex) {
  const { h, s } = hexToHsl(hex)
  const lightS = Math.min(s, 45)
  const lightL = 94
  return hslToHex(h, lightS, lightL)
}

/**
 * Checks whether a given color hex is light or dark based on lightness.
 */
export function isLightColor(hex) {
  const { l } = hexToHsl(hex)
  return l >= 50
}

/**
 * Generates a complete, mathematically balanced unified HSL color palette
 * derived from a single base color hex and theme mode (light vs dark).
 * Returns HSL string values (formatted as "H S% L%") for CSS custom properties.
 */
export function generateUnifiedPalette(baseHex, isDark = false) {
  const defaultLightHex = '#F7F3EA'
  const defaultDarkHex = '#1F251E'
  const targetHex = baseHex || (isDark ? defaultDarkHex : defaultLightHex)
  
  const { h, s, l } = hexToHsl(targetHex)

  // Hue identity tuning for optimal text contrast across color families
  let clayHue = h
  let inkHue = h
  if (h >= 38 && h <= 65) {
    // Yellow/Gold family: shift clay & ink hue toward warm amber/gold for deep readability
    clayHue = 36
    inkHue = 34
  } else if (h >= 330 && h <= 355) {
    // Pink family: deep berry/rose tuning
    clayHue = 342
    inkHue = 340
  }

  if (!isDark) {
    // ------------ LIGHT MODE UNIFIED PALETTE ------------
    // Background: soft, pleasing paper tint of selected hue
    const bgL = l < 45 ? 94 : Math.min(Math.max(l, 90), 96)
    const bgS = Math.min(Math.max(s, 15), 45)

    // Paper tile surface: slightly lighter and cleaner
    const paperL = Math.min(bgL + 3, 98)
    const paperS = Math.min(bgS + 5, 52)

    // Primary Clay / Accent: rich, deep, saturated accent of the hue
    const clayS = Math.max(s, 45)
    const clayL = (h >= 38 && h <= 65) ? 34 : Math.min(Math.max(l * 0.45, 26), 40)

    // Ink / Deep Headings Text: crisp contrast
    const inkS = Math.min(s * 0.5, 30)
    const inkL = 18

    // Body Text
    const textS = Math.min(s * 0.4, 25)
    const textL = 26

    // Secondary Accent
    const sageS = Math.min(s * 0.6, 38)
    const sageL = 78

    // Butter Highlight
    const butterS = Math.max(s, 65)
    const butterL = 68

    // Border & Muted
    const borderS = Math.min(s * 0.35, 25)
    const borderL = 80

    const mutedS = Math.min(s * 0.3, 25)
    const mutedL = 88

    return {
      background: `${h} ${bgS}% ${bgL}%`,
      foreground: `${inkHue} ${textS}% ${textL}%`,
      card: `${h} ${paperS}% ${paperL}%`,
      cardForeground: `${inkHue} ${textS}% ${textL}%`,
      popover: `${h} ${paperS}% ${paperL}%`,
      popoverForeground: `${inkHue} ${textS}% ${textL}%`,
      primary: `${clayHue} ${clayS}% ${clayL}%`,
      primaryForeground: `${h} ${paperS}% ${paperL}%`,
      secondary: `${h} ${sageS}% ${sageL}%`,
      secondaryForeground: `${inkHue} ${textS}% ${textL}%`,
      muted: `${h} ${mutedS}% ${mutedL}%`,
      mutedForeground: `${inkHue} ${textS}% 45%`,
      accent: `${h} ${butterS}% ${butterL}%`,
      accentForeground: `${inkHue} ${textS}% ${textL}%`,
      border: `${h} ${borderS}% ${borderL}%`,
      ring: `${clayHue} ${clayS}% ${clayL}%`,

      daisyBg: `${h} ${bgS}% ${bgL}%`,
      daisyPaper: `${h} ${paperS}% ${paperL}%`,
      daisyClay: `${clayHue} ${clayS}% ${clayL}%`,
      daisySage: `${h} ${sageS}% ${sageL}%`,
      daisyButter: `${h} ${butterS}% ${butterL}%`,
      daisyText: `${inkHue} ${textS}% ${textL}%`,
      daisyInk: `${inkHue} ${inkS}% ${inkL}%`,
    }
  }

  // ------------ DARK MODE UNIFIED PALETTE ------------
  // Background: deep night version of hue h
  const bgL = l > 50 ? 13 : Math.min(Math.max(l, 10), 16)
  const bgS = Math.min(Math.max(s * 0.45, 12), 32)

  // Paper surface: slightly lighter dark tile
  const paperL = Math.min(bgL + 6, 21)
  const paperS = Math.min(bgS + 5, 30)

  // Clay / Primary Accent: luminous, glowing accent in dark mode
  const clayS = Math.max(s, 42)
  const clayL = (h >= 38 && h <= 65) ? 80 : 78

  // Ink / Text: bright, crisp, highly legible text
  const textS = Math.min(s * 0.3, 20)
  const textL = 88

  const inkS = Math.min(s * 0.3, 25)
  const inkL = 92

  // Secondary Accent
  const sageS = Math.min(s * 0.4, 32)
  const sageL = 38

  // Butter Highlight
  const butterS = Math.max(s, 55)
  const butterL = 80

  // Border & Muted
  const borderS = Math.min(s * 0.3, 20)
  const borderL = 28

  const mutedS = Math.min(s * 0.3, 22)
  const mutedL = 22

  return {
    background: `${h} ${bgS}% ${bgL}%`,
    foreground: `${h} ${textS}% ${textL}%`,
    card: `${h} ${paperS}% ${paperL}%`,
    cardForeground: `${h} ${textS}% ${textL}%`,
    popover: `${h} ${paperS}% ${paperL}%`,
    popoverForeground: `${h} ${textS}% ${textL}%`,
    primary: `${h} ${clayS}% ${clayL}%`,
    primaryForeground: `${h} ${bgS}% ${bgL}%`,
    secondary: `${h} ${sageS}% ${sageL}%`,
    secondaryForeground: `${h} ${textS}% ${textL}%`,
    muted: `${h} ${mutedS}% ${mutedL}%`,
    mutedForeground: `${h} ${textS}% 70%`,
    accent: `${h} ${butterS}% ${butterL}%`,
    accentForeground: `${h} ${textS}% ${textL}%`,
    border: `${h} ${borderS}% ${borderL}%`,
    ring: `${h} ${clayS}% ${clayL}%`,

    daisyBg: `${h} ${bgS}% ${bgL}%`,
    daisyPaper: `${h} ${paperS}% ${paperL}%`,
    daisyClay: `${h} ${clayS}% ${clayL}%`,
    daisySage: `${h} ${sageS}% ${sageL}%`,
    daisyButter: `${h} ${butterS}% ${butterL}%`,
    daisyText: `${h} ${textS}% ${textL}%`,
    daisyInk: `${h} ${inkS}% ${inkL}%`,
  }
}

export const LIGHT_PALETTE = {
  bg:         '#F7F3EA',
  paper:      '#FBF8EE',
  ink:        '#4F4A44',
  inkSoft:    'rgba(79, 74, 68, 0.55)',
  inkFaint:   'rgba(79, 74, 68, 0.22)',
  border:     'rgba(79, 74, 68, 0.22)',
  clay:       '#9A744A',
  butter:     '#E3C66A',
  sage:       '#C6D3B2',
  emptyDot:   'rgba(79, 74, 68, 0.15)',
  daisyPetal: '#FBFAF3',
  daisyCenter:'#E3C66A',
  daisyEdge:  '#9A744A',
  textureA:   'rgba(79,74,68,0.045)',
  textureB:   'rgba(79,74,68,0.028)',
}

export const DARK_PALETTE = {
  bg:         '#1F251E',
  paper:      '#2D382B',
  ink:        '#EAE4DA',
  inkSoft:    'rgba(234, 228, 218, 0.62)',
  inkFaint:   'rgba(234, 228, 218, 0.18)',
  border:     'rgba(234, 228, 218, 0.20)',
  clay:       '#D8D0C4',
  butter:     '#D8D0C4',
  sage:       '#5E7253',
  emptyDot:   'rgba(234, 228, 218, 0.18)',
  daisyPetal: '#D8D0C4',
  daisyCenter:'#1F251E',
  daisyEdge:  '#5E7253',
  textureA:   'rgba(234,228,218,0.04)',
  textureB:   'rgba(234,228,218,0.025)',
}

/**
 * Resolves a dynamic palette for ExportSheet and ExportInstagram,
 * ensuring exported cards match the exact background color, paper tint,
 * clay accent, sage accent, and text contrast of the current app theme.
 */
export function getExportPalette({ isDark = false, bgColor = null }) {
  if (!bgColor) {
    return isDark ? DARK_PALETTE : LIGHT_PALETTE
  }
  const palette = generateUnifiedPalette(bgColor, isDark)

  return {
    bg: `hsl(${palette.daisyBg})`,
    paper: `hsl(${palette.daisyPaper})`,
    ink: `hsl(${palette.daisyInk || palette.daisyText})`,
    inkSoft: `hsl(${palette.daisyText} / 0.65)`,
    inkFaint: `hsl(${palette.daisyText} / 0.22)`,
    border: `hsl(${palette.border})`,
    clay: `hsl(${palette.daisyClay})`,
    butter: `hsl(${palette.daisyButter})`,
    sage: `hsl(${palette.daisySage})`,
    emptyDot: `hsl(${palette.daisyText} / 0.20)`,
    daisyPetal: `hsl(${palette.daisyPaper})`,
    daisyCenter: `hsl(${palette.daisyButter})`,
    daisyEdge: `hsl(${palette.daisyClay})`,
    textureA: `hsl(${palette.daisyInk || palette.daisyText} / 0.045)`,
    textureB: `hsl(${palette.daisyInk || palette.daisyText} / 0.028)`,
  }
}

/**
 * Converts unified palette object into React inline style CSS custom properties.
 */
export function paletteToStyleObject(palette) {
  if (!palette) return {}
  return {
    '--background': palette.background,
    '--foreground': palette.foreground,
    '--card': palette.card,
    '--card-foreground': palette.cardForeground,
    '--popover': palette.popover,
    '--popover-foreground': palette.popoverForeground,
    '--primary': palette.primary,
    '--primary-foreground': palette.primaryForeground,
    '--secondary': palette.secondary,
    '--secondary-foreground': palette.secondaryForeground,
    '--muted': palette.muted,
    '--muted-foreground': palette.mutedForeground,
    '--accent': palette.accent,
    '--accent-foreground': palette.accentForeground,
    '--border': palette.border,
    '--input': palette.border,
    '--ring': palette.ring,

    '--daisy-bg': palette.daisyBg,
    '--daisy-paper': palette.daisyPaper,
    '--daisy-clay': palette.daisyClay,
    '--daisy-sage': palette.daisySage,
    '--daisy-butter': palette.daisyButter,
    '--daisy-text': palette.daisyText,
    '--daisy-ink': palette.daisyInk,
  }
}

