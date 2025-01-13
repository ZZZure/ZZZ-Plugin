/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '异常精通',
    value: [75, 85, 95, 105, 115]
  },
  {
    type: '异常增伤',
    value: [0.25, 0.275, 0.3, 0.325, 0.35],
    check: ({ calc }) => calc.get_AnomalyProficiency() >= 375,
    range: ['紊乱']
  }
]