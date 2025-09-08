/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '异常掌控',
    value: [30, 34, 39, 43, 48],
    check: ({ avatar }) => avatar.element_type === 200
  },
  {
    type: '异常精通',
    value: [60, 69, 78, 87, 96],
    is: { team: true }
  }
]