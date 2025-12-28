/** @type {import('../interface.ts').buff[]} */
export const buffs = [
  {
    type: '暴击率',
    value: [0.15, 0.17, 0.19, 0.21, 0.23]
  },
  {
    type: '增伤',
    value: [0.125, 0.145, 0.165, 0.185, 0.2].map(v => v * 2),
    element: 'Electric'
  },
  {
    type: '无视防御',
    value: [0.2, 0.23, 0.26, 0.29, 0.32],
    range: ['A', 'RZ']
  }
]