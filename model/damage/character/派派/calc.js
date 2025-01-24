/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '2影',
    type: '增伤',
    value: 0.1 + 0.3,
    element: 'Physical',
    range: ['EY', 'EQF', 'RZ'] // 大招下砸攻击倍率不知道，直接当做整个技能的增伤吧
  },
  {
    name: '额外能力：同步疾驰',
    type: '增伤',
    value: 0.18
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '强击', type: '强击' },
  { name: '普攻：准备发车四段', type: 'AP4' },
  { name: '闪避反击：动力漂移', type: 'CF' },
  { name: '强化特殊技：引擎转(每圈)', type: 'EQZ' },
  { name: '强化特殊技：非常重', type: 'EQF' },
  { name: '连携技：系好安全带', type: 'RL' },
  { name: '终结技：坐~稳~啦~', type: 'RZ' }
]