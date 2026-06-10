// Monthly botanical metadata. Each plant has palette + simple SVG renderer.
// Growth = number of memories that month (0..31). We render N flowers/leaves.

export const MONTHLY_BOTANICALS = {
  1:  { name: 'Snowdrops',      key: 'snowdrop'    },
  2:  { name: 'Tulips',         key: 'tulip'       },
  3:  { name: 'Cherry Blossoms',key: 'cherry'      },
  4:  { name: 'Daisies',        key: 'daisy'       },
  5:  { name: 'Roses',          key: 'rose'        },
  6:  { name: 'Sunflowers',     key: 'sunflower'   },
  7:  { name: 'Lavender',       key: 'lavender'    },
  8:  { name: 'Hibiscus',       key: 'hibiscus'    },
  9:  { name: 'Golden Leaves',  key: 'goldenleaf'  },
  10: { name: 'Autumn Vines',   key: 'autumnvine'  },
  11: { name: 'Pine Branches',  key: 'pine'        },
  12: { name: 'Winter Berries', key: 'berries'     },
}

export function botanicalForMonth(month1) {
  return MONTHLY_BOTANICALS[month1] || MONTHLY_BOTANICALS[1]
}
