/** @type {import('../interface.ts').buff[]} */
export const buffs = [
  {
    type: '异常掌控',
    value: [30, 34, 39, 43, 48],
    check: ({ avatar }) => avatar.element_type === 200
  },
  {
    type: '异常精通',
    teamTarget: true,
    stackable: false,
    value: [60, 69, 78, 87, 96]
  }
]