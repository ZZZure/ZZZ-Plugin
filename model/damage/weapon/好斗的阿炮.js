/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '攻击力',
    value: [0.025, 0.028, 0.032, 0.036, 0.04].map(v => v * 4),
  }
]