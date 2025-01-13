/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: [0.15, 0.175, 0.2, 0.22, 0.24],
    element: 'Ice',
    isForever: true
  },
  {
    type: '攻击力',
    value: [0.02, 0.023, 0.026, 0.029, 0.032].map(v => v * 4)
  }
]