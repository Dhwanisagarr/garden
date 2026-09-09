'use client'

import React, { useEffect, useRef, useCallback, useMemo } from 'react'

/**
 * HoverBloom Component
 * Interactive canvas background that spawns organic botanical stems and watercolor flowers
 * when the pointer moves or clicks over it, with ambient background growth.
 */
export default function HoverBloom({
  backgroundColor = 'transparent',
  paperTint = 'rgba(245, 245, 240, 0.4)',
  grid = true,
  gridSize = 28,
  gridDotSize = 1,
  gridColor = 'rgba(180, 160, 140, 0.18)',
  bloomScale = 1.0,
  maxBlooms = 120,
  spawnOnMove = true,
  autoSpawn = true,
  resetOnLeave = false,
  trailFade = 0.04,
  watercolor = 0.85,
  blur = 0.5,
  paletteMode = 'mixed',
  customColors = null,
  style = {},
  className = '',
}) {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const paintCanvasRef = useRef(null)
  const rafRef = useRef(null)
  const runningRef = useRef(false)
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })
  const hoverRef = useRef(false)
  const lastPointerRef = useRef(null)
  const spawnAccRef = useRef(0)
  const autoSpawnAccRef = useRef(0)
  const stemsRef = useRef([])
  const bloomsRef = useRef([])

  const get2D = useCallback((c) => {
    if (!c) return null
    return c.getContext('2d', { alpha: true, desynchronized: true }) || c.getContext('2d')
  }, [])

  const hslStr = useCallback((c, a) => {
    const hh = (c.h % 360 + 360) % 360
    return `hsla(${hh}, ${Math.max(0, Math.min(100, c.s))}%, ${Math.max(0, Math.min(100, c.l))}%, ${Math.max(0, Math.min(1, a))})`
  }, [])

  const colorsForMode = useCallback((mode) => {
    switch (mode) {
      case 'warm': return [18, 22, 26, 14]
      case 'cool': return [145, 155, 165]
      case 'pink': return [345, 350, 355]
      case 'earth': return [24, 28, 32]
      default: return [18, 22, 26, 14] // Restrained warm clay/terracotta single tone
    }
  }, [])

  const pick = useCallback((arr) => arr[Math.floor(Math.random() * arr.length)], [])
  const clamp01 = (v) => Math.max(0, Math.min(1, v))

  const hexToHsl = useCallback((hex) => {
    if (!hex) return null
    const raw = hex.trim().replace(/^#/, '')
    const s = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
    if (!/^([0-9a-fA-F]{6})$/.test(s)) return null
    const r = parseInt(s.slice(0, 2), 16) / 255
    const g = parseInt(s.slice(2, 4), 16) / 255
    const b = parseInt(s.slice(4, 6), 16) / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    const l = (max + min) / 2
    const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
    if (d !== 0) {
      switch (max) {
        case r: h = ((g - b) / d) % 6; break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h *= 60
      if (h < 0) h += 360
    }
    return { h, s: sat * 100, l: l * 100 }
  }, [])

  const ensureCanvases = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!paintCanvasRef.current) {
      paintCanvasRef.current = document.createElement('canvas')
    }
  }, [])

  const resizeToHost = useCallback(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    const paint = paintCanvasRef.current
    if (!host || !canvas || !paint) return

    const rect = host.getBoundingClientRect()
    const w = Math.max(1, Math.round(rect.width))
    const h = Math.max(1, Math.round(rect.height))
    const dpr = Math.max(1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1))

    const prev = sizeRef.current
    if (prev.w === w && prev.h === h && prev.dpr === dpr) return
    sizeRef.current = { w, h, dpr }

    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = '100%'
    canvas.style.height = '100%'

    const prevW = paint.width
    const prevH = paint.height

    const snapshot = document.createElement('canvas')
    snapshot.width = prevW
    snapshot.height = prevH
    const snapCtx = snapshot.getContext('2d')
    if (snapCtx && prevW > 0 && prevH > 0) {
      snapCtx.drawImage(paint, 0, 0)
    }

    paint.width = Math.floor(w * dpr)
    paint.height = Math.floor(h * dpr)
    const pctx = get2D(paint)
    if (pctx) {
      pctx.setTransform(1, 0, 0, 1, 0, 0)
      pctx.scale(dpr, dpr)
      pctx.lineCap = 'round'
      pctx.lineJoin = 'round'
      pctx.globalCompositeOperation = 'source-over'
      if (backgroundColor && backgroundColor !== 'transparent') {
        pctx.fillStyle = backgroundColor
        pctx.fillRect(0, 0, w, h)
      }

      if (prevW > 0 && prevH > 0) {
        const dx = (w * dpr - prevW) * 0.5
        const dy = h * dpr - prevH
        pctx.setTransform(1, 0, 0, 1, 0, 0)
        pctx.drawImage(snapshot, dx, dy)
        pctx.setTransform(1, 0, 0, 1, 0, 0)
        pctx.scale(dpr, dpr)

        const shiftX = dx / dpr
        const shiftY = dy / dpr
        for (const s of stemsRef.current) {
          s.x += shiftX
          s.y += shiftY
          for (const seg of s.segs) {
            seg.x += shiftX
            seg.y += shiftY
          }
        }
        for (const b of bloomsRef.current) {
          b.x += shiftX
          b.y += shiftY
        }
      }
    }
  }, [backgroundColor, get2D])

  const clearAll = useCallback(() => {
    const paint = paintCanvasRef.current
    const canvas = canvasRef.current
    if (!paint || !canvas) return

    const { w, h, dpr } = sizeRef.current
    const pctx = get2D(paint)
    const dctx = get2D(canvas)
    if (!pctx || !dctx) return

    pctx.setTransform(1, 0, 0, 1, 0, 0)
    pctx.clearRect(0, 0, paint.width, paint.height)
    pctx.scale(dpr, dpr)
    if (backgroundColor && backgroundColor !== 'transparent') {
      pctx.fillStyle = backgroundColor
      pctx.fillRect(0, 0, w, h)
    }

    dctx.setTransform(1, 0, 0, 1, 0, 0)
    dctx.clearRect(0, 0, canvas.width, canvas.height)
    stemsRef.current = []
    bloomsRef.current = []
  }, [backgroundColor, get2D])

  const spawnStemAt = useCallback(
    (x, y, intensity = 0.5, overrideType = null) => {
      const { w, h } = sizeRef.current
      if (w <= 0 || h <= 0) return

      if (stemsRef.current.length + bloomsRef.current.length >= Math.max(1, maxBlooms)) {
        stemsRef.current.splice(0, Math.max(0, stemsRef.current.length - (maxBlooms - 1)))
        bloomsRef.current.splice(0, Math.max(0, bloomsRef.current.length - (maxBlooms - 1)))
      }

      let hue = 0
      let sat = 78
      let light = 62

      if (Array.isArray(customColors) && customColors.length > 0) {
        const chosen = pick(customColors)
        const parsed = hexToHsl(String(chosen))
        if (parsed) {
          hue = parsed.h
          sat = parsed.s
          light = parsed.l
        }
      }

      if (hue === 0) {
        const hueChoices = colorsForMode(paletteMode)
        hue = pick(hueChoices) + (Math.random() * 10 - 5)
      }

      const scale = Math.max(0.3, bloomScale) * (0.7 + Math.random() * 0.5) * (0.8 + intensity * 0.5)
      const targetA = -Math.PI / 2 + (Math.random() - 0.5) * 0.7
      const len = (h * 0.16 + Math.random() * (h * 0.22) + 40) * (0.65 + scale)
      const angle = targetA + (Math.random() - 0.5) * 0.65

      const s = {
        id: `${Date.now()}-${Math.random()}`,
        x: Math.max(w * 0.02, Math.min(w * 0.98, x + (Math.random() - 0.5) * 16)),
        y: Math.max(h * 0.05, Math.min(h * 0.98, y + 10 + Math.random() * 16)),
        targetLen: len,
        grown: 0,
        speed: 1.8 + Math.random() * 2.4,
        a: angle,
        targetA,
        segs: [{ x, y, a: angle }],
        done: false,
        hasFlower: false,
        type: overrideType !== null ? overrideType : Math.floor(Math.random() * 6),
        scale,
        hue,
        sat,
        light,
      }
      stemsRef.current.push(s)
    },
    [bloomScale, colorsForMode, customColors, hexToHsl, maxBlooms, paletteMode, pick]
  )

  const addBloom = useCallback((x, y, type, scale, hue, sat, light) => {
    const b = {
      id: `${Date.now()}-${Math.random()}`,
      x,
      y,
      age: 0,
      maxAge: 80 + Math.random() * 80,
      type,
      scale,
      hue,
      sat,
      light,
    }
    bloomsRef.current.push(b)
  }, [])

  const drawBlob = useCallback(
    (ctx, x, y, r, c, a, angle = 0, stretch = 1.6) => {
      const jitter = r * 0.25
      for (let i = 0; i < 2; i++) {
        const jx = (Math.random() - 0.5) * jitter
        const jy = (Math.random() - 0.5) * jitter
        const rr = Math.max(0.6, r * (0.75 + Math.random() * 0.5))
        const rx = rr * stretch
        const ry = rr * (0.55 + Math.random() * 0.55)
        const aa = angle + (Math.random() - 0.5) * 0.35
        ctx.beginPath()
        ctx.ellipse(x + jx, y + jy, rx, ry, aa, 0, Math.PI * 2)
        ctx.fillStyle = hslStr(
          { h: c.h + (Math.random() * 10 - 5), s: c.s, l: c.l + (Math.random() * 12 - 6) },
          a
        )
        ctx.fill()
      }
    },
    [hslStr]
  )

  const stroke = useCallback(
    (ctx, x1, y1, x2, y2, c, w, a) => {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = hslStr(
        { h: c.h + (Math.random() * 8 - 4), s: c.s, l: c.l + (Math.random() * 10 - 5) },
        a
      )
      ctx.lineWidth = Math.max(0.2, w * (0.8 + Math.random() * 0.5))
      ctx.stroke()
    },
    [hslStr]
  )

  const stepStem = useCallback((s) => {
    const stepSize = 5
    const steps = Math.max(1, Math.floor(s.speed))
    for (let k = 0; k < steps; k++) {
      if (s.grown >= s.targetLen) {
        s.done = true
        break
      }
      const last = s.segs[s.segs.length - 1]
      let a = last.a
      a += (s.targetA - a) * 0.04 + (Math.random() - 0.5) * 0.12
      const nx = last.x + Math.cos(a) * stepSize
      const ny = last.y + Math.sin(a) * stepSize
      s.segs.push({ x: nx, y: ny, a })
      s.grown += stepSize
    }
    if (s.grown >= s.targetLen) s.done = true
  }, [])

  const drawStem = useCallback(
    (ctx, s) => {
      const segs = s.segs
      if (segs.length < 2) return
      const stemHue = 102
      const stemBase = { h: stemHue, s: 22, l: 34 }
      const stemAlt = { h: stemHue + 12, s: 20, l: 26 }

      const maxI = segs.length - 1
      const total = Math.max(1, Math.floor(s.targetLen / 5))
      const start = Math.max(1, maxI - 4)

      for (let i = start; i <= maxI; i++) {
        const prev = segs[i - 1]
        const cur = segs[i]
        const t = i / total
        const w = (2.8 * (1 - t) + 0.8) * s.scale
        stroke(ctx, prev.x, prev.y, cur.x, cur.y, stemAlt, w * 0.7, 0.22)
        stroke(ctx, prev.x, prev.y, cur.x, cur.y, stemBase, w, 0.18)

        if (i > 5 && i < maxI - 3 && Math.random() < 0.12) {
          const a = cur.a + (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.7)
          const len = (10 + Math.random() * 22) * s.scale
          const tipX = cur.x + Math.cos(a) * len
          const tipY = cur.y + Math.sin(a) * len
          const leaf = { h: stemHue + (Math.random() * 10 - 5), s: 36, l: Math.min(65, 48) }
          drawBlob(ctx, (cur.x + tipX) * 0.5, (cur.y + tipY) * 0.5, (4 + Math.random() * 4) * s.scale, leaf, 0.12, a, 2.2)
          stroke(ctx, cur.x, cur.y, tipX, tipY, stemAlt, Math.max(0.35, w * 0.35), 0.18)
        }
      }
    },
    [drawBlob, stroke]
  )

  const drawBloom = useCallback(
    (ctx, b) => {
      b.age += 1
      const t = clamp01(b.age / 60)
      const bloom = 0.15 + t * 0.85
      const fadeOut = resetOnLeave ? clamp01((b.maxAge - b.age) / 20) : 1

      const hue = b.hue
      const fs = b.sat
      const fl = b.light
      const base = { h: hue, s: fs, l: fl }
      const light = { h: hue + 3, s: Math.max(20, fs - 10), l: Math.min(92, fl + 14) }
      const dark = { h: hue, s: Math.min(100, fs + 12), l: Math.max(16, fl - 22) }
      const stamen = { h: 42, s: 88, l: 54 }

      const s = b.scale
      const headX = b.x + (Math.random() - 0.5) * 0.2
      const headY = b.y - (8 + Math.random() * 6) * s * bloom
      const petalCount = b.type === 0 ? 16 : b.type === 1 ? 6 : b.type === 2 ? 10 : b.type === 3 ? 8 : 12
      const radius = 9 * s * bloom + (b.type === 0 ? 4 * s * bloom : 0)

      for (let i = 0; i < petalCount; i++) {
        if (Math.random() > 0.75) continue
        const baseA = -Math.PI / 2 + (Math.PI * 2 * i) / petalCount
        const a = baseA + (Math.random() - 0.5) * 0.35
        const dist = radius * (0.75 + Math.random() * 0.85)
        const px = headX + Math.cos(a) * dist
        const py = headY + Math.sin(a) * dist
        const stretch = 1.7 + Math.random() * 0.9
        const main = Math.random() > 0.65 ? light : base
        drawBlob(ctx, px, py, radius * (0.55 + Math.random() * 0.25), main, fadeOut * 0.065 * (0.6 + watercolor * 0.8), a, stretch)
        drawBlob(ctx, (px + headX) * 0.5, (py + headY) * 0.5, radius * 0.45, dark, fadeOut * 0.045 * (0.7 + watercolor * 0.7), a + 0.1, stretch * 0.95)
      }

      const core = (5 + Math.random() * 3) * s * bloom
      drawBlob(ctx, headX, headY + 1 * s, core * 1.05, dark, fadeOut * 0.07 * (0.7 + watercolor * 0.8), 0, 1.2)

      if (b.age > 10) {
        for (let i = 0; i < 7; i++) {
          if (Math.random() > 0.5) continue
          const aa = Math.random() * Math.PI * 2
          const dd = (1 + Math.random() * 5) * s * bloom
          const dx = headX + Math.cos(aa) * dd
          const dy = headY + Math.sin(aa) * dd
          drawBlob(ctx, dx, dy, (1.2 + Math.random() * 1.8) * s * bloom, stamen, fadeOut * 0.08, aa, 1)
        }
      }
    },
    [clamp01, drawBlob, resetOnLeave, watercolor]
  )

  const render = useCallback(
    function renderLoop() {
      const canvas = canvasRef.current
      const paint = paintCanvasRef.current
      if (!canvas || !paint) return
      const { w, h, dpr } = sizeRef.current
      if (w <= 0 || h <= 0) return

      const pctx = get2D(paint)
      const dctx = get2D(canvas)
      if (!pctx || !dctx) return

      // Ambient background growth when idle or initial load
      if (autoSpawn && stemsRef.current.length < 14 && Math.random() < 0.08) {
        autoSpawnAccRef.current += 1
        if (autoSpawnAccRef.current % 12 === 0) {
          const spawnX = Math.random() * w
          const spawnY = h * 0.4 + Math.random() * (h * 0.55)
          spawnStemAt(spawnX, spawnY, 0.45)
        }
      }

      if (resetOnLeave && !hoverRef.current) {
        pctx.save()
        pctx.globalCompositeOperation = 'source-over'
        if (backgroundColor && backgroundColor !== 'transparent') {
          pctx.fillStyle = backgroundColor
        } else {
          pctx.clearRect(0, 0, w, h)
        }
        pctx.globalAlpha = Math.max(0.02, clamp01(trailFade) * 0.35)
        pctx.setTransform(1, 0, 0, 1, 0, 0)
        pctx.scale(dpr, dpr)
        if (backgroundColor && backgroundColor !== 'transparent') {
          pctx.fillRect(0, 0, w, h)
        }
        pctx.restore()
      }

      for (const s of stemsRef.current) {
        if (!s.done) {
          stepStem(s)
          drawStem(pctx, s)
        } else if (!s.hasFlower) {
          const segs = s.segs
          const anchor = segs[Math.max(1, segs.length - 2)]
          addBloom(anchor.x, anchor.y, s.type, Math.max(0.2, s.scale * (0.8 + Math.random() * 0.5)), s.hue, s.sat, s.light)

          if (segs.length > 16 && Math.random() > 0.5) {
            const node = segs[Math.max(4, segs.length - Math.floor(6 + Math.random() * 8))]
            const side = Math.random() < 0.5 ? -1 : 1
            const a = node.a + side * (0.85 + Math.random() * 0.5)
            const budX = node.x + Math.cos(a) * (10 + Math.random() * 12) * s.scale
            const budY = node.y + Math.sin(a) * (10 + Math.random() * 12) * s.scale
            addBloom(budX, budY, (s.type + 1) % 6, Math.max(0.18, s.scale * 0.7), s.hue + 8, s.sat, s.light)
          }
          s.hasFlower = true
        }
      }

      let anyBloomAlive = false
      const blooms = bloomsRef.current
      for (let i = 0; i < blooms.length; i++) {
        const b = blooms[i]
        if (b.age < b.maxAge) {
          drawBloom(pctx, b)
          anyBloomAlive = true
        }
      }

      dctx.setTransform(1, 0, 0, 1, 0, 0)
      dctx.clearRect(0, 0, canvas.width, canvas.height)
      dctx.scale(dpr, dpr)

      const blurPx = Math.max(0, blur)
      const wc = clamp01(watercolor)
      dctx.filter = `blur(${blurPx * (0.5 + wc * 0.9)}px) contrast(${1.02 + wc * 0.08}) saturate(${1.05 + wc * 0.15})`
      dctx.globalAlpha = 1
      dctx.drawImage(paint, 0, 0, w * dpr, h * dpr, 0, 0, w, h)
      dctx.filter = 'none'

      stemsRef.current = stemsRef.current.filter((s) => !(s.done && s.hasFlower))
      if (bloomsRef.current.length > maxBlooms) {
        bloomsRef.current.splice(0, bloomsRef.current.length - maxBlooms)
      }

      if (runningRef.current) {
        rafRef.current = requestAnimationFrame(renderLoop)
      }
    },
    [addBloom, autoSpawn, backgroundColor, blur, clamp01, clearAll, drawBloom, drawStem, get2D, maxBlooms, resetOnLeave, spawnStemAt, stepStem, trailFade, watercolor]
  )

  const ensureLoop = useCallback(() => {
    if (typeof window === 'undefined') return
    if (runningRef.current) return
    runningRef.current = true
    rafRef.current = requestAnimationFrame(render)
  }, [render])

  const onPointerEnter = useCallback(() => {
    hoverRef.current = true
    ensureLoop()
  }, [ensureLoop])

  const onPointerLeave = useCallback(() => {
    hoverRef.current = false
    lastPointerRef.current = null
    spawnAccRef.current = 0
    if (resetOnLeave) {
      clearAll()
    }
  }, [clearAll, resetOnLeave])

  const onPointerMove = useCallback(
    (e) => {
      if (!hoverRef.current && !spawnOnMove) return
      const host = hostRef.current
      if (!host) return
      const rect = host.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const last = lastPointerRef.current

      let intensity = 0.4
      if (last) {
        const dt = Math.max(1, now - last.t)
        const dx = x - last.x
        const dy = y - last.y
        const speed = Math.sqrt(dx * dx + dy * dy) / dt
        intensity = clamp01(0.25 + speed * 3.2)
      }
      lastPointerRef.current = { x, y, t: now }

      const rate = 12
      const dt = last ? Math.max(0, now - last.t) / 1000 : 1 / 60
      spawnAccRef.current += rate * dt
      while (spawnAccRef.current >= 1) {
        spawnAccRef.current -= 1
        spawnStemAt(x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 12, intensity)
      }
      ensureLoop()
    },
    [ensureLoop, spawnOnMove, spawnStemAt]
  )

  const onPointerDown = useCallback(
    (e) => {
      const host = hostRef.current
      if (!host) return
      const rect = host.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      spawnStemAt(x, y, 0.9)
      spawnStemAt(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, 0.8)
      ensureLoop()
    },
    [ensureLoop, spawnStemAt]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    ensureCanvases()
    resizeToHost()
    ensureLoop()

    // Spawn initial decorative stems on load framing the margins
    const timer = setTimeout(() => {
      const { w, h } = sizeRef.current
      if (w > 0 && h > 0) {
        spawnStemAt(w * 0.08, h * 0.72, 0.55)
        spawnStemAt(w * 0.16, h * 0.82, 0.45)
        spawnStemAt(w * 0.84, h * 0.75, 0.55)
        spawnStemAt(w * 0.92, h * 0.85, 0.45)
      }
    }, 150)

    const host = hostRef.current
    if (!host) return
    let ro = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        resizeToHost()
      })
      ro.observe(host)
    }
    return () => {
      clearTimeout(timer)
      if (ro) ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      runningRef.current = false
    }
  }, [ensureCanvases, ensureLoop, resizeToHost, spawnStemAt])

  const gridBackground = useMemo(() => {
    if (!grid) return 'none'
    const s = Math.max(6, gridSize)
    const dot = Math.max(0.5, gridDotSize)
    return `radial-gradient(${gridColor} ${dot}px, transparent ${dot}px)`
  }, [grid, gridColor, gridDotSize, gridSize])

  return (
    <div
      ref={hostRef}
      className={`relative w-full h-full overflow-hidden touch-none select-none ${className}`}
      style={{
        backgroundColor: backgroundColor || 'transparent',
        backgroundImage: gridBackground,
        backgroundSize: grid ? `${Math.max(6, gridSize)}px ${Math.max(6, gridSize)}px` : undefined,
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.02)',
        ...style,
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      role="application"
      aria-label="Hover Bloom interactive canvas"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${paperTint} 0%, rgba(255,255,255,0) 65%)`,
          mixBlendMode: 'multiply',
          opacity: 0.55,
        }}
      />
    </div>
  )
}
