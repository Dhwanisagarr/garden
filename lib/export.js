'use client'
import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'
import JSZip from 'jszip'

async function renderToCanvas(el, { isDark = false, scale = 3.5, width, height } = {}) {
  // wait two frames for layout, then fonts (Fraunces, Caveat, Noto Color Emoji)
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  if (document.fonts?.ready) {
    try { await document.fonts.ready } catch {}
  }
  const options = {
    scale,
    backgroundColor: null,
    useCORS: true,
    allowTaint: true,
    logging: false,
    imageTimeout: 0,
    foreignObjectRendering: false,
  }
  if (width) options.width = width
  if (height) options.height = height
  return html2canvas(el, options)
}

function triggerDownload(blobOrUrl, filename) {
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  if (typeof blobOrUrl !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }
}

export async function exportAsPNG(el, filename, opts = {}) {
  const canvas = await renderToCanvas(el, opts)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) triggerDownload(blob, filename)
      resolve()
    }, 'image/png')                               // lossless PNG
  })
}

export async function exportAsPDF(el, filename, opts = {}) {
  const canvas = await renderToCanvas(el, opts)
  // Use lossless PNG inside the PDF so typography and SVG botanicals stay crisp.
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true,
    putOnlyUsedFonts: true,
  })
  const pageW = pdf.internal.pageSize.getWidth()    // 210mm
  const pageH = pdf.internal.pageSize.getHeight()   // 297mm
  pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH, undefined, 'SLOW')
  pdf.save(filename)
}

async function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

export async function exportInstagramCarousel(elements, filename, opts = {}) {
  const { width, height, isDark = false } = opts
  const zip = new JSZip()

  for (let i = 0; i < elements.length; i++) {
    const canvas = await renderToCanvas(elements[i], {
      isDark,
      scale: 1,
      width,
      height,
    })
    const blob = await canvasToBlob(canvas)
    if (blob) zip.file(`slide_${String(i + 1).padStart(2, '0')}.png`, blob)
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  triggerDownload(zipBlob, filename)
}

export async function exportInstagramStory(el, filename, opts = {}) {
  const { width, height, isDark = false } = opts
  const canvas = await renderToCanvas(el, {
    isDark,
    scale: 1,
    width,
    height,
  })
  const blob = await canvasToBlob(canvas)
  if (blob) triggerDownload(blob, filename)
}
