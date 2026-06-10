'use client'
import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'

async function renderToCanvas(el, { isDark = false } = {}) {
  // wait two frames for layout, then fonts (Fraunces, Caveat, Noto Color Emoji)
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  if (document.fonts?.ready) {
    try { await document.fonts.ready } catch {}
  }
  return html2canvas(el, {
    scale: 3.5,                                   // ~336 DPI from 96 DPI base => high resolution, print-ready
    backgroundColor: isDark ? '#1F251E' : '#F7F3EA',
    useCORS: true,
    allowTaint: true,
    logging: false,
    imageTimeout: 0,
    // foreignObjectRendering false keeps text crisp on most browsers
    foreignObjectRendering: false,
  })
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
