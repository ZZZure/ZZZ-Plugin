/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    name: '1影',
    type: '异常暴击率',
    value: ({ calc }) => 0.25 + calc.get_AnomalyMastery() * 0.005,
    max: 1,
    check: 1,
    range: ['侵蚀·异放']
  },
  {
    name: '1影',
    type: '异常暴击伤害',
    value: 0.25,
    check: 1,
    range: ['侵蚀·异放']
  },
  {
    name: '2影',
    type: '无视防御',
    value: 0.16,
    check: 2,
    range: ['AP3', 'AX1', 'AX2', 'AX3', 'AH', 'EQ', 'EQ0', 'RL', 'RZ', '侵蚀·异放']
  },
  {
    name: '6影',
    type: '增伤',
    value: 0.4,
    element: 'Ether',
    check: 6,
    range: ['AH', 'EQ', 'EQ0']
  },
  {
    name: '额外能力：心跳应援',
    type: '异常精通',
    value: 100,
    teamTarget: true
  }
]

/** @param {import('#interface').Calculator} ari */
const generateBefore = (ari) => {
  /** @type {import('#interface').skill['before']} */
  const before = ({ avatar, calc, areas }) => {
    const AnomalyMultiplier = calc.get_AnomalyMultiplier(undefined, undefined, 1)
    const ATK = calc.get_ATK(calc.skill)
    const AnomalyMastery = calc.get_AnomalyMastery(calc.skill)
    const skillMultiplier = ari.get_SkillMultiplier(`TY${avatar.element_type}`)
    const n = AnomalyMastery / 10 * skillMultiplier
    areas.BasicArea = ATK * AnomalyMultiplier * n
  }
  return before
}

/** @type {import('#interface').skill[]} */
export const skills = [
  {
    name: '异放·以太',
    type: '侵蚀·异放',
    isMain: true,
    banCache: true,
    before: (data) => generateBefore(data.calc)(data)
  },
  { name: '普攻：甜心律动一段', type: 'AP1' },
  { name: '普攻：甜心律动二段', type: 'AP2' },
  { name: '普攻：甜心律动三段', type: 'AP3' },
  { name: '普攻：甜心律动四段', type: 'AP4' },
  { name: '蓄力：绝对音准一段', type: 'AX1' },
  { name: '蓄力：绝对音准二段', type: 'AX2' },
  { name: '蓄力：绝对音准三段', type: 'AX3' },
  { name: '强化蓄力·妄想时刻', type: 'AH' },
  { name: '闪避反击：滑动变奏', type: 'CF' },
  { name: '强化特殊技：坠入妄想', type: 'EQ' },
  { name: '强化特殊技：光速入坑', type: 'EQ0' },
  { name: '连携技：梦幻联动', type: 'RL' },
  { name: '终结技：心跳重奏', type: 'RZ' }
]
