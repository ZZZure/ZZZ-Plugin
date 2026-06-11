/** @type {import('#interface').CharCalcModel} */
export default {
  author: "春哥",

  buffs: [
    {
      name: "1影",
      type: "无视抗性",
      value: 0.18,
      element: "Physics",
    },
    {
      name: "2影",
      type: "增伤",
      value: 0.5,
      include: ["APZ", "EQG", "RZ"],
    },
    {
      name: "2影",
      type: "暴击伤害",
      value: 0.5,
      include: ["EQG"],
    },
    {
      name: "4影",
      type: "暴击伤害",
      value: 0.08 * 2,
    },
    {
      name: "6影",
      type: "贯穿增伤",
      value: 0.18,
      include: ["APZ", "RZ"],
    },
    {
      name: "核心被动：骑士决心",
      type: "贯穿力",
      value: ({ calc }) => Math.trunc(calc.get_HP() * 0.1),
    },
    {
      name: "核心被动：骑士决心",
      type: "暴击伤害",
      value: [0.45, 0.53, 0.60, 0.68, 0.75, 0.83, 0.90],
    },
    {
      name: "额外能力：炽热星辉",
      type: "增伤",
      value: 0.2 * 2,
      include: ["EQG", "EQZ", "EQY", "RL", "RZ", "APZ"],
    },
  ],

  skills: [
    { name: "普通攻击：最高马力星光", type: "APZ", after: ({ damage }) => damage.add('Y6') },
    { name: "普通攻击：骑士斗技", type: "AP4" },  // 4段
    { name: "冲刺攻击：星-徽-惩-戒", type: "CC" },
    { name: "闪避反击：决斗之王", type: "CFJ" },
    { name: "闪避反击：尾焰全旋", type: "CFW" },
    { name: "特殊技：动力压制", type: "EPD" },
    { name: "特殊技：脱缰", type: "EPT" },
    { name: "强化特殊技：孤轮特技", type: "EQG" },
    { name: "强化特殊技：抓地轮毂", type: "EQZ" },
    { name: "强化特殊技：摇曳步伐", type: "EQY" },
    { name: "快速支援：星徽-羁绊之力", type: "LK" },
    { name: "支援突击：反派退场", type: "LT" },
    { name: "连携技：骑士漫步", type: "RL" },
    {
      name: "终结技：骑士飞踢",
      type: "RZ",
      after: ({ damage }) => damage.add('Y6')
    },
    {
      name: '6影[煊赫星辉]',
      type: 'Y6',
      check: 6,
      isHide: true,
      multiplier: 2 * 1.0
    },
  ],
}