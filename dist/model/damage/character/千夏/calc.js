/** @type {import('#interface').CharCalcModel} */
export default {
  name: '默认',

  author: 'UCPr',

  buffs: [
    {
      name: '核心被动：可爱即正义',
      type: '攻击力',
      value: 0.3,
      percentBase: 'initial',
      max: [525, 615, 705, 795, 880, 975, 1050],
      showInPanel: true,
      teamTarget: true,
    },
    {
      name: '额外能力：白日梦对位法',
      type: '失衡易伤',
      value: 0.3,
      teamTarget: true,
    },
    {
      name: '1影',
      type: '无视防御',
      value: 0.07 * 3,
      teamTarget: true,
    },
    {
      name: '2影',
      type: '攻击力',
      value: 0.1,
      teamTarget: true,
    },
    {
      name: '4影',
      type: '增伤',
      value: 0.18,
      teamTarget: true,
    },
    {
      name: '6影',
      type: '暴击率',
      value: 1,
    },
    {
      name: '6影',
      type: '暴击伤害',
      value: ({ avatar }) => avatar.initial_properties.ATK * 0.0003,
      max: 1.05,
    },
    {
      name: '6影',
      type: '增伤',
      teamTarget: true,
      value: 0.5,
      range: ['TM']
    },
  ],

  skills: [
    { name: '强击', type: '强击' },
    { name: '普攻：鬼马流星锤四段', type: 'AP4' },
    {
      name: '普攻：坏猫出没',
      type: 'AH',
      multiplier: 3.9
    },
    { name: '闪避反击：妄想三振', type: 'CF' },
    { name: '支援突击：弹跳练习', type: 'LT' },
    { name: '强E：泡泡糖轰炸', type: 'EQ' },
    { name: '长按强E：特别拍照技巧', isMain: true, type: 'EQP' },
    { name: '长按强E（协同）：特别拍照技巧', type: 'EQX' },
    { name: '连携技：别惹猫咪', type: 'RL' },
    { name: '终结技：通通砸碎！', type: 'RZ' },
    {
      name: '6影[猫的凝视]·结算千夏',
      check: 6,
      type: 'TM',
      multiplier: [1.5, 1.75, 2, 2.25, 2.5, 2.75, 3].map(v => v + 2),
    },
  ]

}