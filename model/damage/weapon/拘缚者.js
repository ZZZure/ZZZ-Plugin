/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: [0.06, 0.075, 0.09, 0.105, 0.12].map(v => v * 5),
    range: ['A']
  }
]