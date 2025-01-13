/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: [0.12, 0.15, 0.18, 0.21, 0.24].map(v => v * 3),
    element: 'Physical'
  }
]