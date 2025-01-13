/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: [0.035, 0.044, 0.052, 0.061, 0.07].map(v => v * 10)
  },
  {
    type: '异常精通',
    value: [50, 62, 75, 87, 100]
  }
]