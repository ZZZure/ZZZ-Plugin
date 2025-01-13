/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: 0.1,
    isForever: true,
    element: 'Ether',
    check: 2
  },
  {
    type: '暴击伤害',
    value: 0.2,
    isForever: true,
    check: 4
  },
  {
    type: '暴击伤害',
    value: 0.055 * 6,
    check: 4
  }
]