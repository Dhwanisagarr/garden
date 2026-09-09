/**
 * Year Ecosystems Registry
 * Configures the visual botanical identity of DHWANI based on the active year.
 * Extensible for future years (2028+).
 */

export const ECOSYSTEMS = {
  2026: {
    id: 'bloom',
    year: 2026,
    name: 'Bloom',
    type: 'flower',
    badge: '2026 · Bloom',
    icon: '🌸',
    description: 'A botanical flower garden in full bloom.',
  },
  2027: {
    id: 'harvest',
    year: 2027,
    name: 'Harvest',
    type: 'harvest',
    badge: '2027 · Harvest',
    icon: '🍇',
    description: 'A rich harvest ecosystem of fruits, berries, vines & seasonal crops.',
  },
}

export function getEcosystemForYear(year) {
  const numericYear = Number(year) || 2026
  if (ECOSYSTEMS[numericYear]) {
    return ECOSYSTEMS[numericYear]
  }
  // Default logic for future/past years:
  // Odd years -> Harvest, Even years -> Bloom
  if (numericYear % 2 === 1) {
    return {
      ...ECOSYSTEMS[2027],
      year: numericYear,
      badge: `${numericYear} · Harvest`,
    }
  }
  return {
    ...ECOSYSTEMS[2026],
    year: numericYear,
    badge: `${numericYear} · Bloom`,
  }
}
