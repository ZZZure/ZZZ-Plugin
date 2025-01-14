/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '无视防御',
    value: 0.15
  },
  {
    name: '1影',
    type: '暴击率',
    value: 0.2
  },
  {
    name: '6影',
    type: '暴击伤害',
    value: 1,
    range: ['AQ'],
    isForever: true
  },
  {
    name: '6影',
    type: '无视抗性',
    value: 0.2
  },
  {
    name: '额外能力：阳关三叠',
    type: '攻击力',
    isForever: true,
    value: ({ calc }) => Math.max(0, Math.min((calc.get_Impact() - 120) * 6, 600))
  },
  {
    name: '连携技：太平令',
    type: '增伤',
    value: 0.03 * 20,
    range: ['RL']
  },
  {
    name: '闪络',
    source: 'Skill',
    type: '增伤',
    value: 0.01 * 25,
    range: ['AQ']
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '感电每次', type: '感电' },
  { name: '普攻：醉花月云转', type: 'AQ' },
  { name: '闪避反击：意不尽', type: 'CF' },
  { name: '强化特殊技：月上海棠', type: 'EQ' },
  { name: '连携技：太平令', type: 'RL' },
  { name: '终结技：八声甘州', type: 'RZ' }
]