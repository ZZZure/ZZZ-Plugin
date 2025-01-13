/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: 0.2,
    isForever: true,
    range: ['RZ'],
    check: 4
  },
  {
    type: '攻击力',
    value: 0.15,
    check: 4
  }
]