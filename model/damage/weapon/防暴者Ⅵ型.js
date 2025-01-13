/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '暴击率',
    value: [0.15, 0.188, 0.226, 0.264, 0.3],
    isForever: true
  },
  {
    type: '增伤',
    value: [0.35, 0.435, 0.52, 0.605, 0.7],
    element: 'Ether',
    range: ['A']
  }
]