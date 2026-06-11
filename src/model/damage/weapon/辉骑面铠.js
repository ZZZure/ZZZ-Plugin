/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    type: "暴击率",
    value: [0.2, 0.23, 0.26, 0.29, 0.32],
  },
  {
    type: "贯穿增伤",
    value: [0.1, 0.115, 0.13, 0.145, 0.16].map(v => v * 2),
    element: "Physics",
  },
]
