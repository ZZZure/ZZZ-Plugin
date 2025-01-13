/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '暴击率',
    value: [0.1, 0.115, 0.13, 0.145, 0.16],
    isForever: true
  },
  {
    type: '增伤',
    value: [0.4, 0.46, 0.52, 0.58, 0.64],
    element: 'Electric',
    isForever: true,
    range: ['CC']
  },
  {
    type: '暴击率',
    value: [0.1, 0.115, 0.13, 0.145, 0.16]
  }
]