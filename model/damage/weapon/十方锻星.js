/** @type {import('../interface.ts').buff[]} */
export const buffs = [
  {
    type: '异常掌控',
    value: [60, 69, 78, 87, 96]
  },
  {
    type: '增伤',
    value: [0.2, 0.23, 0.26, 0.29, 0.32].map(v => v * 2),
    element: 'Physical'
  }
]