/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '冲击力',
    value: [0.1, 0.125, 0.15, 0.175, 0.2].map(v => v * 2)
  }
]