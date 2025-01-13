/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '攻击力',
    value: [0.035, 0.044, 0.052, 0.06, 0.07].map(v => v * 8)
  }
]