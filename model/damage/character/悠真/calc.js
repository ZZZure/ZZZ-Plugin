/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '2影',
    type: '增伤',
    value: 0.5,
    range: ['CCQ']
  },
  {
    name: '6影',
    type: '无视抗性',
    value: 0.15
  },
  {
    name: '核心被动：破晓',
    type: '暴击率',
    value: 'T1',
    isForever: true,
    range: ['CCQ']
  },
  {
    name: '核心被动：破晓',
    type: '暴击伤害',
    value: 'T2',
    range: ['CCQ']
  },
  {
    name: '额外能力：超频',
    type: '增伤',
    value: 0.4
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '感电每次', type: '感电' },
  { name: '普攻：穿云五段', type: 'AP5' },
  { name: '普攻：落羽', type: 'AX' },
  { name: '冲刺攻击：飞弦·斩', type: 'CCQ3' },
  { name: '强化特殊技：地网', type: 'EQ' },
  { name: '连携技：会·离', type: 'RL' },
  { name: '终结技：残心', type: 'RZ' }
]