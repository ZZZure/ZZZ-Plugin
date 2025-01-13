/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '冲击力',
    value: [0.007, 0.0088, 0.0105, 0.0122, 0.014].map(v => v * 30)
  },
  {
    type: '增伤',
    value: [0.2, 0.23, 0.26, 0.29, 0.32]
  }
]