/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    name: '1影',
    type: '异常暴击率',
    value: ({ avatar }) => 0.25 + Math.max(0, avatar.initial_properties.AnomalyMastery - 100) * 0.005,
    max: 1,
    range: ['侵蚀·异放']
  },
  {
    name: '1影',
    type: '异常暴击伤害',
    value: 0.25,
    range: ['侵蚀·异放']
  },
  {
    name: '2影',
    type: '无视防御',
    value: 0.16,
    range: ['AP', 'AX', 'CA', 'CF', 'EP', 'EZ', 'EQ', 'LR', 'LT', 'RL', 'RZ', '侵蚀·异放']
  },
  {
    name: '2影：妄想时刻',
    type: '无视防御',
    value: 0.08,
    include: ['AX3Q', 'RZ', '侵蚀·异放']
  },
  {
    name: '6影',
    type: '增伤',
    value: 0.4,
    element: 'Ether',
    include: ['AX3Q', 'RZ']
  },
  {
    name: '核心被动：控场核心',
    type: '异常精通',
    value: [45, 52, 60, 67, 75, 82, 90]
  },
  {
    name: '额外能力：合作舞台',
    type: '异常持续时间',
    value: 3,
    teamTarget: true,
    range: ['侵蚀']
  },
  {
    name: '技能：以太帷幕·妄想重奏',
    type: '攻击力',
    value: 50,
    teamTarget: true,
    showInPanel: true
  }
]

/** @param {import('#interface').Calculator} ari */
const generateBefore = (ari) => {
  /** @type {import('#interface').skill['before']} */
  const before = ({ avatar, calc, areas }) => {
    const AnomalyMultiplier = calc.get_AnomalyMultiplier(undefined, undefined, 1)
    const ATK = calc.get_ATK(calc.skill)
    const AnomalyMastery = avatar.initial_properties.AnomalyMastery
    const skillMultiplier = ari.get_SkillMultiplier(`TY${avatar.element_type}`)
    const n = AnomalyMastery / 10 * skillMultiplier
    areas.BasicArea = ATK * AnomalyMultiplier * n
  }
  return before
}

/** @type {import('#interface').skill[]} */
export const skills = [
  { name: '侵蚀每段', type: '侵蚀' },
  { name: '紊乱', type: '紊乱' },
  {
    name: '异放·以太',
    type: '侵蚀·异放',
    isMain: true,
    banCache: true,
    before: (data) => generateBefore(data.calc)(data)
  },
  { name: '普攻：甜心律动四段', type: 'AP4' },
  { name: '蓄力：绝对音准一段', type: 'AX1' },
  { name: '蓄力：绝对音准二段', type: 'AX2' },
  { name: '蓄力：绝对音准三段', type: 'AX3P' },
  { name: '强化蓄力·妄想时刻', type: 'AX3Q' },
  { name: '冲刺攻击：丝滑小连招', type: 'CA' },
  { name: '闪避反击：滑动变奏', type: 'CF' },
  { name: '特殊技：全糖电音', type: 'EP' },
  { name: '特殊技：全糖电音·不加冰', type: 'EZ' },
  { name: '强化特殊技：坠入妄想', type: 'EQZ' },
  { name: '强化特殊技：光速入坑', type: 'EQG' },
  { name: '快速支援：破碎幻梦', type: 'LR' },
  { name: '支援突击：安可曲目', type: 'LT' },
  { name: '连携技：梦幻联动', type: 'RL' },
  { name: '终结技：元气百分百', type: 'RZ' }
]
