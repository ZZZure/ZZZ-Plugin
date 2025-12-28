/** @type {import('../interface.ts').buff[]} */
export const buffs = [
  {
    type: '暴击率',
    value: [0.2, 0.23, 0.26, 0.29, 0.32]
  },
  {
    type: '增伤',
    value: [0.08, 0.092, 0.104, 0.116, 0.128].map(v => v * 2),
    element: 'Ether'
  },
  {
    type: '贯穿增伤',
    value: [0.1, 0.115, 0.13, 0.145, 0.16].map(v => v * 2),
    element: 'Ether',
    range: ['RZ', 'EQ']
  }
]