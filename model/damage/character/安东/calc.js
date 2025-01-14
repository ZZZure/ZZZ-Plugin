/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '4影',
    type: '暴击率',
    value: 0.1
  },
  {
    name: '6影',
    type: '增伤',
    value: 0.04 * 6,
    range: ['AQ', 'CFQ']
  },
  {
    name: '核心被动：兄弟齐心',
    type: '增伤',
    value: 'T1',
    range: ['AP4', 'AQ3', 'EPP', 'EPQ', 'EQ', 'RL', 'RZ']
  },
  {
    name: '核心被动：兄弟齐心',
    type: '增伤',
    value: 'T2',
    range: ['AQ2', 'CFQ', 'LKQ', 'LT'] // 为什么支援突击一半电钻攻击一半打桩攻击？？？还只写了一个倍率……
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '感电每次', type: '感电' },
  { name: '普攻二段（爆发）', type: 'AQ2' },
  { name: '闪避反击：过载钻击（爆发）', type: 'CFQ' },
  { name: '特殊技：爆发钻击（爆发）', type: 'EPQ' },
  { name: '连携技：转转转！', type: 'RL' },
  { name: '终结技：转转转转转！', type: 'RZ' }
]