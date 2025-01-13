/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '冲击力',
    value: [0.02, 0.023, 0.026, 0.029, 0.032].map(v => v * 8)
  }
]