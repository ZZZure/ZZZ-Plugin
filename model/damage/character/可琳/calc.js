/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '增伤',
    value: 0.12
  },
  {
    name: '2影',
    type: '无视抗性',
    value: 0.005 * 20
  },
  {
    name: '6影',
    type: '倍率',
    value: 0.03 * 40,
    range: ['CF', 'EQ0', 'LK', 'LT'] // EQ只能加1次
  },
  {
    name: '核心被动：专注',
    type: '增伤',
    value: 'T',
    range: ['AP3', 'EQ']
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '强击', type: '强击' },
  { name: '普攻：扫除开始五段', type: 'AP5' },
  { name: '闪避反击：[舍]', type: 'CF' },
  {
    name: '强化特殊技：小心裙角',
    type: 'EQ0',
    isHide: true,
    after: ({ damage }) => damage.x(2)
  },
  { name: '强化特殊技：小心裙角', type: 'EQ', after: ({ damage }) => damage.add('EQ0') },
  { name: '连携技：抱歉…', type: 'RL' },
  { name: '终结技：非、非常抱歉！', type: 'RZ' }
]