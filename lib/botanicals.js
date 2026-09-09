import { getEcosystemForYear } from './ecosystems'

// 2026 BLOOM ECOSYSTEM (Flower-based botanicals)
export const MONTHLY_BOTANICALS_BLOOM = {
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

// 2027 HARVEST ECOSYSTEM (Fruit, Vine, & Crop botanicals)
export const MONTHLY_BOTANICALS_HARVEST = {
  1:  { name: 'Citrus & Winter Oranges',      key: 'citrus' },
  2:  { name: 'Blackberry Bramble Vines',     key: 'blackberry' },
  3:  { name: 'Olive Boughs & Fruit',         key: 'olive' },
  4:  { name: 'Wild Strawberry Sprigs',       key: 'strawberry' },
  5:  { name: 'Cherry Boughs & Fruit',        key: 'cherryberry' },
  6:  { name: 'Fig Branches & Fresh Figs',    key: 'fig' },
  7:  { name: 'Pomegranate Boughs',           key: 'pomegranate' },
  8:  { name: 'Grapevines & Cluster Grapes',  key: 'grape' },
  9:  { name: 'Orchard Apples & Boughs',      key: 'apple' },
  10: { name: 'Pumpkin & Autumn Gourds',      key: 'pumpkin' },
  11: { name: 'Golden Pears & Boughs',        key: 'pear' },
  12: { name: 'Winter Cranberries & Pines',   key: 'cranberry' },
}

export function botanicalForMonth(month1, year = 2026) {
  const eco = getEcosystemForYear(year)
  const map = eco.type === 'harvest' ? MONTHLY_BOTANICALS_HARVEST : MONTHLY_BOTANICALS_BLOOM
  const m = Number(month1) || 1
  return map[m] || map[1]
}

// Shared palettes (used by both botanical renderers & floating particles)
export const PALETTES = {
  // Bloom species palettes
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

  // Harvest species palettes
  citrus:      { stem: '#6b7a4a', leaf: '#5e724a', flower: '#F49E37', accent: '#F2C46A' },
  blackberry:  { stem: '#5e4a52', leaf: '#4f5e4a', flower: '#3D2645', accent: '#7D4F88' },
  olive:       { stem: '#6a785c', leaf: '#7a8a6c', flower: '#556042', accent: '#909e7e' },
  strawberry:  { stem: '#5e7a4f', leaf: '#6b8a5a', flower: '#E63946', accent: '#A8DADC' },
  cherryberry: { stem: '#7a5a4a', leaf: '#5e7a4f', flower: '#D62828', accent: '#F1FAEE' },
  fig:         { stem: '#5a6b52', leaf: '#6a7e62', flower: '#5C3D5E', accent: '#DDA15E' },
  pomegranate: { stem: '#6b5a4a', leaf: '#5e7a4f', flower: '#C1121F', accent: '#FDF0D5' },
  grape:       { stem: '#5a4a3e', leaf: '#4f6e4a', flower: '#4A2840', accent: '#9B5DE5' },
  apple:       { stem: '#6b5240', leaf: '#5e7a4f', flower: '#E63946', accent: '#F4A261' },
  pumpkin:     { stem: '#5a6e4f', leaf: '#4f6044', flower: '#F77F00', accent: '#FCBF49' },
  pear:        { stem: '#6b5e40', leaf: '#5e724a', flower: '#E9C46A', accent: '#2A9D8F' },
  cranberry:   { stem: '#4a5e44', leaf: '#3f523c', flower: '#9B2226', accent: '#E9D8A6' },
}
