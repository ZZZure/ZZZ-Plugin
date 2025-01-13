/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: [0.15, 0.175, 0.2, 0.22, 0.24],
    check: ({ avatar }) => avatar.element_type === 205
  }
]