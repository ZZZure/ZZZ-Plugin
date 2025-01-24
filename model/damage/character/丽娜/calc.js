/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
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
    element: 'Electric'
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
    element: 'Electric'
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '感电每次', type: '感电' },
  { name: '紊乱', type: '紊乱' },
  { name: '蓄力普攻：赶走傻瓜', type: 'AX' },
  { name: '闪避反击：邦布回魂', type: 'CF' },
  { name: '强化特殊技：笨蛋消失魔法', type: 'EQ' },
  { name: '连携技：侍者守则', type: 'RL' },
  { name: '终结技：女王的侍从们', type: 'RZ' }
]