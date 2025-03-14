/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: 0.15,
    check: 2,
    range: ['CC', '追加攻击'],
    isForever: true
  },
  {
    type: '攻击力',
    value: 0.04 * 3,
    check: 4
  },
  {
    type: '暴击率',
    value: 0.04 * 3,
    check: 4
  }
]