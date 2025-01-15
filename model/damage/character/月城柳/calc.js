/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '异常精通',
    value: 80
  },
  {
    name: '2影',
    type: '倍率',
    value: 0.05,
    isForever: true,
    range: ['强化E极性紊乱']
  },
  {
    name: '2影',
    type: '倍率',
    value: 0.3,
    range: ['强化E极性紊乱']
  },
  {
    name: '4影',
    type: '穿透率',
    value: 0.16
  },
  {
    name: '6影',
    type: '增伤',
    value: 0.2,
    range: ['EQ']
  },
  {
    name: '6影',
    type: '倍率',
    value: 0.3,
    range: ['强化E极性紊乱']
  },
  {
    name: '核心被动：月蚀',
    type: '倍率',
    value: 'T1',
    range: ['紊乱']
  },
  {
    name: '核心被动：月蚀',
    type: '增伤',
    value: 'T2',
    element: 'Electric'
  },
  {
    name: '技能：普攻上弦',
    type: '增伤',
    value: 0.1,
    element: 'Electric'
  },
  {
    name: '技能：普攻下弦',
    type: '穿透率',
    value: 0.1
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '感电每次', type: '感电' },
  { name: '紊乱', type: '紊乱' },
  { name: '普攻：上弦五段', type: 'APS5' },
  { name: '普攻：下弦五段', type: 'APX5' },
  { name: '闪避反击：疾反', type: 'CF' },
  { name: '强化特殊技：月华流转0', type: 'EQ0', isHide: true },
  {
    name: '强化特殊技：月华流转',
    type: 'EQ',
    after: ({ damage }) => damage.add('EQ0')
  },
  {
    name: '强化E极性紊乱',
    type: '紊乱',
    banCache: true,
    before: ({ calc, areas }) => {
      const skill = { type: '紊乱' }
      const DiscoverMultiplier = calc.get_DiscoverMultiplier(skill)
      const n = calc.get('倍率', 0.15, { type: '强化E极性紊乱' })
      const ATK = calc.get_ATK(skill)
      const AnomalyProficiency = calc.get_AnomalyProficiency(skill)
      const skillMultiplier = calc.get_SkillMultiplier('E极性紊乱')
      areas.BasicArea = DiscoverMultiplier * ATK * n + AnomalyProficiency * skillMultiplier
    }
  },
  { name: '连携技：星月相随', type: 'RL' },
  { name: '终结技：雷影天华', type: 'RZ' },
  {
    name: '终结技极性紊乱',
    type: '紊乱',
    banCache: true,
    before: ({ calc, areas }) => {
      const skill = { type: '紊乱' }
      const DiscoverMultiplier = calc.get_DiscoverMultiplier(skill)
      const n = calc.get('倍率', 0.15, { type: '终结技极性紊乱' })
      const ATK = calc.get_ATK(skill)
      const AnomalyProficiency = calc.get_AnomalyProficiency(skill)
      const skillMultiplier = calc.get_SkillMultiplier('R极性紊乱')
      areas.BasicArea = DiscoverMultiplier * ATK * n + AnomalyProficiency * skillMultiplier
    }
  }
]