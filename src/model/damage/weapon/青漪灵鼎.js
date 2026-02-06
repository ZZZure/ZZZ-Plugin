/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    type: "增伤", // 装备者发动 [强化特殊技] 时
    value: [0.04, 0.046, 0.052, 0.058, 0.064].map(v => v * 3),
  },
  {
    type: "暴击率", // 拥有3层增益效果时
    value: [0.065, 0.075, 0.085, 0.094, 0.104],
  },
]
