/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: [0.1, 0.125, 0.15, 0.175, 0.2]
  },
  {
    type: '增伤',
    value: [0.017, 0.02, 0.025, 0.03, 0.033].map(v => v * 6)
  }
]