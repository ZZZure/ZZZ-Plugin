/** @type {import('../interface.ts').buff[]} */
export const buffs = [
  {
    type: '增伤',
    value: 0.15,
    element: ['Electric', 'Fire'],
    check: 4
  },
  {
    type: '增伤',
    value: 0.2,
    check: 4,
    range: ['EQ', 'L']
  }
]