/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: 0.15,
    isForever: true,
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