'use client'
import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'

async function renderToCanvas(el) {
  // wait two frames for layout + fonts/images
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
  // also wait for fonts to finish loading (Fraunces, Caveat)
  if (document.fonts?.ready) {
    try { await document.fonts.ready } catch {}
  }
  return html2canvas(el, {
    scale: 3,                 // ~288 DPI at 96 DPI base
    backgroundColor: '#F7F3EA',
    useCORS: true,
    allowTaint: true,
    logging: false,
    imageTimeout: 0,
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

export async function exportAsPNG(el, filename) {
  const canvas = await renderToCanvas(el)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) triggerDownload(blob, filename)
      resolve()
    }, 'image/png')
  })
}

export async function exportAsPDF(el, filename) {
  const canvas = await renderToCanvas(el)
  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
  const pageW = pdf.internal.pageSize.getWidth()    // 210mm
  const pageH = pdf.internal.pageSize.getHeight()   // 297mm
  pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST')
  pdf.save(filename)
}
