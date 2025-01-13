/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: [0.15, 0.172, 0.195, 0.217, 0.24].map(v => v * 3),
    range: ['RZ']
  }
]