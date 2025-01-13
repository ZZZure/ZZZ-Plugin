/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: 0.1,
    isForever: true,
    element: 'Ice',
    check: 2
  },
  {
    type: '增伤',
    value: 0.2,
    isForever: true,
    range: ['A', 'CC'],
    check: 4
  },
  {
    type: '增伤',
    value: 0.2,
    range: ['A', 'CC'],
    check: 4
  }
]