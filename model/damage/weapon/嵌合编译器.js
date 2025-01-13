/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '攻击力',
    value: [0.12, 0.15, 0.18, 0.21, 0.24],
    isForever: true
  },
  {
    type: '异常精通',
    value: [25, 31, 37, 43, 50].map(v => v * 3)
  }
]