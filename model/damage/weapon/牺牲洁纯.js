/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '暴击伤害',
    value: [0.3, 0.345, 0.39, 0.435, 0.48],
    isForever: true
  },
  {
    type: '暴击伤害',
    value: [0.1, 0.115, 0.13, 0.145, 0.16].map(v => v * 3),
  },
  {
    type: '增伤',
    value: [0.2, 0.23, 0.26, 0.29, 0.32],
    element: 'Electric'
  }
]