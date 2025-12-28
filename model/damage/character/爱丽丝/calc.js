/** @type {import('../../interface.ts').buff[]} */
export const buffs = [
  {
    name: '1影',
    type: '无视防御',
    value: 0.2
  },
  {
    name: '2影',
    type: '异常增伤',
    value: 0.15,
    range: ['强击']
  },
  {
    name: '2影',
    type: '异常增伤',
    value: 0.15,
    range: ['紊乱'],
    element: 'Physical'
  },
  {
    name: '4影',
    type: '无视抗性',
    value: 0.1,
    element: 'Physical'
  },
  {
    name: '核心被动：剑心双虹',
    type: '倍率',
    value: 1.8,
    element: 'Physical',
    range: ['紊乱']
  },
  {
    name: '额外能力：寻奇猎幽',
    type: '异常精通',
    value: ({ calc }) => Math.max(0, calc.get_AnomalyMastery() - 140) * 1.6
  }
]

/** @type {import('../../interface.ts').skill[]} */
export const skills = [
  { name: '强击', type: '强击' },
  { name: '紊乱', type: '紊乱' },
  {
    name: '核心被动：持续伤害每段',
    type: 'TC',
    dmg: (calc) => {
      const dmg = calc.calc_skill({
        ...calc.find_skill('type', '强击'),
        banCache: true,
        after: ({ damage }) => damage.x(0.025)
      })
      return dmg
    }
  },
  { name: '普攻：星仪序曲五段', type: 'AP5' },
  { name: '强化普攻：星仪序曲五段', type: 'AQ5' },
  { name: '蓄力普攻：星芒圆舞曲(一蓄)', type: 'AX1' },
  { name: '蓄力普攻：星芒圆舞曲(二蓄)', type: 'AX2' },
  {
    name: '蓄力普攻：星芒圆舞曲(三蓄)',
    type: 'AX3',
    isMain: true,
    after: ({ damage }) => damage.add('强击')
  },
  { name: '闪避反击：剑闪之仪', type: 'CF' },
  { name: '强E：极光突刺·北十字', type: 'EQB' },
  { name: '强E：极光突刺·南十字', type: 'EQN' },
  { name: '连携技：星落间章', type: 'RL' },
  {
    name: '终结技：星芒终章',
    type: 'RZ',
    after: ({ avatar, damage }) => {
      if (avatar.rank >= 2) {
        damage.add('强击')
      }
    }
  },
  {
    name: '6影[决胜状态]额外攻击',
    type: 'Y6',
    check: 6,
    before: ({ areas, props, calc }) => {
      const anomalyProficiency = calc.get_AnomalyProficiency()
      props.暴击率 = 1
      areas.BasicArea = 33 * anomalyProficiency
    }
  }
]