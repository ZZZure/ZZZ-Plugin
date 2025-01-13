/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '攻击力',
    value: [0.06, 0.069, 0.078, 0.087, 0.096],
    isForever: true
  },
  {
    type: '增伤',
    value: [0.15, 0.172, 0.195, 0.218, 0.24],
    range: ['EQ']
  }
]