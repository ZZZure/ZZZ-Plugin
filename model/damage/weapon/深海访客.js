/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: [0.25, 0.315, 0.38, 0.445, 0.5],
    element: 'Ice',
    isForever: true
  },
  {
    type: '暴击率',
    value: [0.1, 0.125, 0.15, 0.175, 0.2].map(v => v * 2)
  }
]