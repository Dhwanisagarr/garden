// Monthly botanical identity. ONE flower species per month.
// `key` drives both the bloom renderer (in Botanical.jsx) and the
// upload particle renderer (in Particles.jsx).

export const MONTHLY_BOTANICALS = {
  1:  { name: 'Snowdrops',                    key: 'snowdrop' },
  2:  { name: 'Tulips',                       key: 'tulip' },
  3:  { name: 'Cherry Blossoms',              key: 'cherry' },
  4:  { name: 'Daisies',                      key: 'daisy' },
  5:  { name: 'Roses',                        key: 'rose' },
  6:  { name: 'Sunflowers',                   key: 'sunflower' },
  7:  { name: 'Lavender',                     key: 'lavender' },
  8:  { name: 'Hibiscus',                     key: 'hibiscus' },
  9:  { name: 'Golden Wildflowers',           key: 'goldenwild' },
  10: { name: 'Autumn Maple Sprigs',          key: 'maple' },
  11: { name: 'Pine Branches with Berries',   key: 'pineberry' },
  12: { name: 'Winter Berries and Holly',     key: 'holly' },
}

export function botanicalForMonth(month1) {
  return MONTHLY_BOTANICALS[month1] || MONTHLY_BOTANICALS[1]
}

// Shared palettes (used by both botanical & particles for visual cohesion)
export const PALETTES = {
  snowdrop:    { stem: '#7a8f6a', leaf: '#8aa377', flower: '#fbfaf3', accent: '#cdd6a8' },
  tulip:       { stem: '#6b8a5a', leaf: '#7a9665', flower: '#e07a6b', accent: '#f2c46a' },
  cherry:      { stem: '#8a6a52', leaf: '#7a8f6a', flower: '#f3c8d0', accent: '#c97a8c' },
  daisy:       { stem: '#7a8f6a', leaf: '#8aa377', flower: '#fbfaf3', accent: '#E3C66A' },
  rose:        { stem: '#6b8a5a', leaf: '#5e7a4f', flower: '#c8556a', accent: '#f0c5c9' },
  sunflower:   { stem: '#6b8a5a', leaf: '#5e7a4f', flower: '#E3C66A', accent: '#9A744A' },
  lavender:    { stem: '#6b8a5a', leaf: '#7a9665', flower: '#a98bc4', accent: '#cdbedf' },
  hibiscus:    { stem: '#6b8a5a', leaf: '#5e7a4f', flower: '#d65a6b', accent: '#f5e07b' },
  goldenwild:  { stem: '#9A744A', leaf: '#a88a5a', flower: '#E3C66A', accent: '#d8a04a' },
  maple:       { stem: '#7a4a32', leaf: '#a86a3a', flower: '#c4663a', accent: '#d8843a' },
  pineberry:   { stem: '#4a5e3f', leaf: '#5E7253', flower: '#b23a4a', accent: '#9A744A' },
  holly:       { stem: '#4a5e3f', leaf: '#3f5e4a', flower: '#b23a4a', accent: '#7a8f6a' },
}
