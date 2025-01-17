/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '倍率',
    value: 1,
    range: ['TY', 'Y6Y']
  },
  {
    name: '2影',
    type: '穿透率',
    value: 0.2
  },
  {
    name: '4影',
    type: '暴击率',
    value: 0.3,
    range: ['EQ', 'L']
  },
  {
    name: '6影',
    type: '无视抗性',
    value: 0.25,
    element: 'Fire',
    range: ['TY', 'Y6Y', '灼烧']
  },
  {
    name: '核心被动：燃油特调',
    type: '增伤',
    value: ({ calc }) => Math.min(30, Math.floor(calc.get_AnomalyProficiency() / 10)) * 0.01,
    isForever: true,
    range: ['TY', 'Y6Y']
  },
  {
    name: '额外能力：星火燎原',
    type: '异常持续时间',
    value: 3,
    range: ['灼烧']
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '灼烧', type: '灼烧' },
  { name: '紊乱', type: '紊乱' },
  {
    name: '核心被动：余烬',
    type: 'TY',
    redirect: 'L'
  },
  // { name: '普攻：炽焰直调式五段', type: 'AP5' },
  { name: '长按普攻0', type: 'AX0', isHide: true },
  {
    name: '长按普攻',
    type: 'AX',
    after: ({ damage }) => damage.add('AX0')
  },
  { name: '闪避反击：摇荡闪', type: 'CF' },
  { name: '强化E：火焰冲击', type: 'EQP0' },
  {
    name: '强化E：持续喷射秒伤',
    type: 'EQP',
    after: ({ damage }) => damage.x(0.5)
  },
  { name: '强化E双份：火焰冲击', type: 'EQS0' },
  {
    name: '强化E双份：持续喷射秒伤',
    type: 'EQS',
    after: ({ damage }) => damage.x(0.5)
  },
  {
    name: '6影强化E双份额外余烬秒伤',
    type: 'Y6Y',
    fixedMultiplier: 1.2,
    check: ({ avatar }) => avatar.rank >= 6
  },
  {
    name: '6影强化E双份额外灼烧',
    type: 'Y6灼烧',
    check: ({ avatar }) => avatar.rank >= 6,
    dmg: (calc) => {
      const dmg = calc.calc_skill({
        name: '灼烧每段',
        element: 'Fire',
        banCache: true,
        type: '灼烧',
        after: ({ damage }) => damage.x(18)
      })
      dmg.skill.name = '6影强化E双份额外灼烧'
      return dmg
    }
  },
  { name: '连携技：燃油熔焰', type: 'RL' },
  { name: '终结技：纵享盛焰', type: 'RZ' }
]