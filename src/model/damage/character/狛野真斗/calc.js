/** @type {import('#interface').CharCalcModel} */
export default {

  author: "春哥",

  buffs: [
    {
      name: "1影",
      type: "增伤",
      value: 0.2,
      range: ["A", "L"],
    },
    {
      name: "2影",
      type: "无视抗性",
      value: 0.08,
    },
    {
      name: "4影",
      type: "生命值",
      value: 0.08,
    },
    {
      name: "6影",
      type: "增伤",
      value: 0.03 * 5,
    },
    {
      name: "核心被动：熔锋之势",
      type: "贯穿力",
      value: ({ calc }) => Math.trunc(calc.get_HP() * 0.1),
    },
    {
      name: "核心被动：熔锋之势",
      type: "暴击伤害",
      value: [0.25, 0.292, 0.333, 0.375, 0.417, 0.458, 0.5],
      include: ["AQ4", "LT7"],
    },
    {
      name: "核心被动：熔锋之势",
      type: "暴击率",
      value: 0.1,
    },
    {
      name: "核心被动：熔锋之势",
      type: "增伤",
      value: [0.1, 0.117, 0.133, 0.15, 0.167, 0.183, 0.2],
    },
  ],

  skills: [
    { name: "普攻：炽风·胧切四段", type: "AQ4" },
    { name: "闪避反击：曜刃·掠阵", type: "CF" },
    { name: "特殊技：归烬", type: "EP" },
    { name: "强化特殊技：归烬·天坠", type: "EQ" },
    { name: "支援突击：孤影·断獠连打最大伤害", type: "LT7" },
    { name: "连携技：极炽炎爆", type: "RL" },
    { name: "终结技：无想荒魂", type: "RQ" },
  ]

}
