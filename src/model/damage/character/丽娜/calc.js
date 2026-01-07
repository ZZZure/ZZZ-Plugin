/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    name: '2影',
    type: '增伤',
    value: 0.15
  },
  {
    name: '6影',
    type: '增伤',
    value: 0.15,
    teamTarget: true,
    element: 'Electric'
  },
  {
    name: '核心被动：迷你毁灭拍档',
    type: '穿透率',
    showInPanel: true,
    // 仅对队友生效
    teamTarget: ({ teammates }) => teammates,
    value: ({ calc }) => {
      return Math.min(0.3, 0.25 * calc.get_PenRatio() + [0.06, 0.075, 0.09, 0.102, 0.108, 0.114, 0.12][calc.get_SkillLevel('T') - 1])
    }
  },
  {
    name: '额外能力：完美舞会',
    type: '异常持续时间',
    value: 3,
    range: ['感电']
  },
  {
    name: '额外能力：完美舞会',
    type: '增伤',
    value: 0.1,
    teamTarget: true,
    element: 'Electric'
  }
]

/** @type {import('#interface').skill[]} */
export const skills = [
  { name: '感电每次', type: '感电' },
  { name: '紊乱', type: '紊乱' },
  { name: '蓄力普攻：赶走傻瓜', type: 'AX' },
  { name: '闪避反击：邦布回魂', type: 'CF' },
  { name: '强化特殊技：笨蛋消失魔法', type: 'EQ' },
  { name: '连携技：侍者守则', type: 'RL' },
  { name: '终结技：女王的侍从们', type: 'RZ' }
]