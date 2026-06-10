// Personal garden name utilities — possessive forms, filename-safe forms, etc.

export function possessive(name) {
  const n = (name || '').trim()
  if (!n) return ''
  const last = n.slice(-1).toLowerCase()
  return last === 's' ? `${n}'` : `${n}'s`
}

/** Display name only — never append "Garden". */
export function gardenTitle(name) {
  return (name || '').trim()
}

// "Sophia"      -> "Sophias_Garden"
// "James"       -> "James_Garden"
// "Ana Maria"   -> "Ana_Marias_Garden"
export function gardenFilenameStem(name) {
  // Strip apostrophe from possessive then sanitize whitespace -> underscore
  const stem = possessive(name).replace(/'/g, '')
  const cleaned = stem.replace(/[^A-Za-z0-9 ]/g, '').trim().replace(/\s+/g, '_')
  return cleaned ? `${cleaned}_Garden` : 'My_Garden'
}

export function buildExportFilename({ name, monthName, year, ext }) {
  return `${gardenFilenameStem(name)}_${monthName}_${year}.${ext}`
}
