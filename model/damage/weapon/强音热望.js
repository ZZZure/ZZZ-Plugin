/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '攻击力',
    value: [0.06, 0.069, 0.078, 0.087, 0.096].map(v => v * 2)
  }
]