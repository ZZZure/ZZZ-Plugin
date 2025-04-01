/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '无视防御',
    value: [0.25, 0.2875, 0.325, 0.3625, 0.4],
    is: {
      team: true,
      stack: false
    }
  },
  {
    type: '冲击力',
    value: [0.04, 0.046, 0.052, 0.058, 0.064].map(v => v * 3)
  },
  {
    type: '冲击力',
    value: [0.08, 0.092, 0.104, 0.116, 0.128]
  }
]