/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '2影',
    type: '增伤',
    value: 0.1 * 5,
    element: 'Ether',
    range: ['AQ', 'CCQ']
  },
  {
    name: '4影',
    type: '无视抗性',
    value: 0.25,
    range: ['AQ', 'CCQ']
  },
  {
    name: '核心被动：特种弹药',
    type: '增伤',
    value: 'T',
    range: ['AQ', 'CCQ']
  },
  {
    name: '额外能力：武装协同',
    type: '暴击率',
    value: 0.3
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '侵蚀每次', type: '侵蚀' },
  { name: '普攻三段（以太）', type: 'AQY3' },
  { name: '冲刺攻击：火力压制', type: 'CCQ' },
  {
    name: '6影以太鹿弹',
    type: 'EQ2',
    fixedMultiplier: 2.2 * 4,
    isHide: true,
    check: ({ avatar }) => avatar.rank >= 6
  },
  {
    name: '强化特殊技：全弹连射',
    type: 'EQ',
    after: ({ damage }) => damage.add('EQ2')
  },
  { name: '连携技：歼灭模式', type: 'RL' },
  { name: '终结技：歼灭模式MAX', type: 'RZ' }
]