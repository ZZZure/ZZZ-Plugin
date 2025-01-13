/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: [0.03, 0.035, 0.04, 0.044, 0.048].map(v => v * 15),
    element: 'Physical',
    range: ['EQ'] // 只持续1s
  }
]