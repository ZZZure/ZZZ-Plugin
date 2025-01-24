/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '4影',
    type: '无视抗性',
    value: 0.1,
    element: 'Ice'
  },
  {
    name: '6影',
    type: '增伤',
    value: 0.45,
    range: ['AQ', 'CCQ']
  },
  {
    name: '核心被动：刃旗助威',
    type: '攻击力',
    value: ({ avatar, calc }) => Math.min(1000, avatar.initial_properties.ATK * calc.calc_value('T') * 2)
  },
  {
    name: '额外能力：团膳套餐',
    type: '增伤',
    value: 0.2,
    element: 'Ice'
  },
  {
    name: '技能：终结技：大份鹅鸡斩',
    type: '暴击率',
    value: 0.15,
    range: ['RZ'] // 覆盖率较低
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '碎冰', type: '碎冰' },
  { name: '普攻：打年糕三段(霜染刃旗)', type: 'AQ3' },
  { name: '冲刺攻击：对半分(霜染刃旗)', type: 'CCQ' },
  { name: '闪避反击：别抢零食', type: 'CF' },
  { name: '强化特殊技：扇走蚊虫0', type: 'EQ0', isHide: true },
  { name: '强化特殊技：扇走蚊虫', type: 'EQ', after: ({ damage }) => damage.add('EQ0') },
  { name: '连携技：鹅鸡斩', type: 'RL' },
  { name: '终结技：大份鹅鸡斩', type: 'RZ' }
]