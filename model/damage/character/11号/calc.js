/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '2影',
    type: '增伤',
    value: 0.03 * 12,
    range: ['AP', 'CC', 'CF']
  },
  {
    name: '6影',
    type: '无视抗性',
    value: 0.25,
    element: 'Fire',
    range: ['AQ']
  },
  {
    name: '核心被动：热浪',
    type: '增伤',
    value: 'T',
    range: ['AQ', 'CCQ']
  },
  {
    name: '额外能力：燎原',
    type: '增伤',
    value: 0.1, // 暂不计入失衡0.225
    element: 'Fire'
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '灼烧', type: '灼烧' },
  { name: '普攻：火力镇压四段', type: 'AQ4' },
  { name: '闪避反击：逆火', type: 'CF' },
  { name: '强化特殊技：盛燃烈火', type: 'EQ' },
  { name: '连携技：昂扬烈焰', type: 'RL' },
  { name: '终结技：轰鸣烈焰', type: 'RZ' }
]
