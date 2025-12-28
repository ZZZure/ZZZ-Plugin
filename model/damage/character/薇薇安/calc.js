/** @type {import('../../interface.ts').buff[]} */
export const buffs = [
  {
    name: '1影',
    type: '异常增伤',
    value: 0.16,
    is: {
      team: true
    }
  },
  {
    name: '2影',
    type: '无视抗性',
    value: 0.15,
    range: ['侵蚀·异放']
  },
  {
    name: '4影',
    type: '暴击率',
    value: 1,
    range: ['AX', 'AH']
  },
  {
    name: '4影',
    type: '攻击力',
    value: 0.12
  },
  {
    name: '6影',
    type: '增伤',
    value: 0.4,
    element: 'Ether'
  },
  {
    name: '额外能力：预言之泪',
    type: '异常增伤',
    value: 0.12,
    // 侵蚀、侵蚀结算的紊乱生效
    check: ({ calc }) => calc.skill.element === 'Ether',
    range: ['侵蚀', '紊乱']
  }
]

/** @param {import('../../interface.ts').Calculator} vva */
const generateBefore = (vva) => {
  /** @type {import('../../interface.ts').skill['before']} */
  const before = ({ avatar, calc, areas }) => {
    const AnomalyMultiplier = calc.get_AnomalyMultiplier(undefined, undefined, 1)
    const ATK = calc.get_ATK(calc.skill)
    const AnomalyProficiency = vva.get_AnomalyProficiency(calc.skill)
    const skillMultiplier = vva.get_SkillMultiplier(`TY${avatar.element_type}`)
    const n = AnomalyProficiency / 10 * skillMultiplier * (vva.avatar.rank >= 2 ? 1.3 : 1)
    areas.BasicArea = ATK * AnomalyMultiplier * n
  }
  return before
}

/** @type {import('../../interface.ts').skill[]} */
export const skills = [
  { name: '侵蚀每段', type: '侵蚀' },
  { name: '紊乱', type: '紊乱' },
  {
    name: '异放·结算薇薇安',
    type: '侵蚀·异放',
    isMain: true,
    banCache: true,
    before: (data) => generateBefore(data.calc)(data)
  },
  {
    name: '6影特殊异放·5护羽',
    type: '侵蚀·异放',
    check: 6,
    banCache: true,
    dmg: (calc) => {
      const dmg = calc.calc_skill({
        ...calc.find_skill('type', '侵蚀·异放'),
        after: ({ damage }) => damage.x(5)
      })
      return dmg
    }
  },
  { name: '普攻：翎羽拂击四段', type: 'AP4' },
  { name: '普攻：淑女礼仪·舞步', type: 'AT' },
  { name: '普攻：裙裾浮游·悬落', type: 'AX' },
  { name: '普攻：落羽生花', type: 'AH' },
  {
    name: '薇薇安的预言',
    type: 'TW',
    multiplier: 0.55
  },
  { name: '闪避反击：羽刃反振', type: 'CF' },
  { name: '强化特殊技：堇花悼亡', type: 'EQ' },
  { name: '连携技：星羽和声', type: 'RL' },
  { name: '终结技：飞鸟鸣颂', type: 'RZ' }
]

/**
 * @param {import('../../interface.ts').BuffManager} buffM
 * @param {import('../../interface.ts').Calculator} calc
 * @param {import('../../interface.ts').ZZZAvatarInfo} avatar
 */
// export function calc(buffM, calc, avatar) {

// }