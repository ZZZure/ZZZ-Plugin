/** @type {import('#interface').CharCalcModel} */
export default {
  author: "春哥",

  buffs: [
    {
      name: "1影",
      type: "无视抗性",
      value: 0.1,
      element: "Fire",
    },
    {
      name: "1影",
      type: "贯穿增伤",
      value: 0.1,
      include: ["EQAAE", "EQEAEAAE", "EQEEA", "EQAEAEEA", "AQS", "ACY"],
    },
    {
      name: "2影",
      type: "暴击伤害",
      value: 0.15,
    },
    {
      name: "2影",
      type: "增伤",
      value: 0.15,
      element: "Fire",
    },
    {
      name: "4影",
      type: "增伤",
      value: 0.3,
      include: ["EQEAEAAE", "EQAEAEEA", "AQS", "ACY"],
    },
    {
      name: "6影",
      type: "增伤",
      value: 0.08 * 3,
      element: "Fire",
    },
    {
      name: "核心被动：群山如我",
      type: "贯穿力",
      value: ({ calc }) => Math.trunc(calc.get_HP() * 0.1),
    },
    {
      name: "核心被动：群山如我",
      type: "贯穿力",
      value: [150, 175, 200, 225, 250, 275, 300],
    },
    {
      name: "核心被动：群山如我",
      type: "增伤",
      value: [0.18, 0.21, 0.24, 0.27, 0.3, 0.33, 0.36],
      element: "Fire",
    },
    {
      name: "核心被动：群山如我",
      type: "暴击伤害",
      value: [0.18, 0.21, 0.24, 0.27, 0.3, 0.33, 0.36],
    },
    {
      name: "额外能力：绝巅",
      type: "增伤",
      value: 0.05 * 3,
      element: "Fire",
    },
  ],

  skills: [
    { name: "普攻：峥嵘四段", type: "AA4" },
    { name: "普攻：崔巍四段", type: "AE4" },
    { name: "普攻：焚身", type: "AFS" },
    { name: "普攻：倾山", type: "AQS" },
    { name: "普攻：摧岳", type: "ACY" },
    { name: "闪避反击：扬砾", type: "CF" },
    { name: "强化特殊技：地动", type: "EQAEA" },
    { name: "强化特殊技：山摇", type: "EQEEA" },
    { name: "强化特殊技：论道", type: "EQEAE" },
    { name: "强化特殊技：狮子吼", type: "EQAAE" },
    { name: "强化特殊技：山摇·怒", type: "EQAEAEEA" },
    { name: "强化特殊技：狮子吼·怒", type: "EQEAEAAE" },
    { name: "支援突击：昂霄", type: "LTAX" },
    { name: "支援突击：冲霄", type: "LTCX" },
    { name: "连携技：怒焰", type: "RL" },
    { name: "终结技：撼天动地", type: "RZ" },
    {
      name: "6影[额外摧岳]",
      type: "Y6",
      check: 6,
      multiplier: 6,
    },
  ],
}
