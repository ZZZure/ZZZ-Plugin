/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '6影',
    type: '增伤',
    value: 0.1 * 5
  },
  {
    name: '核心被动：金属狼足',
    type: '无视抗性',
    value: 0.25,
    element: 'Ice'
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '蓄力普攻：五段一级', type: 'AX51' },
  { name: '蓄力普攻：五段二级', type: 'AX52' },
  { name: '闪避反击：保持清洁', type: 'CF' },
  { name: '蓄力强化特殊技：狂猎时刻', type: 'EQX' },
  { name: '连携技：遵命', type: 'RL' },
  { name: '终结技：不辱使命', type: 'RZ' }
]