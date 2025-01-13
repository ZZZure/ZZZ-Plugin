/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '冲击力',
    value: [0.25, 0.2875, 0.325, 0.3625, 0.4]
  },
  {
    type: '暴击伤害',
    value: [0.015, 0.0172, 0.0195, 0.0217, 0.024].map(v => v * 20),
    element: ['Ice', 'Fire']
  }
]