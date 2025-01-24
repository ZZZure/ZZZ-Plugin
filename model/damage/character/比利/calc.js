/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '2影',
    type: '增伤',
    value: 0.25,
    isForever: true,
    range: ['CF']
  },
  {
    name: '4影',
    type: '暴击率',
    value: 0.32,
    range: ['EQ']
  },
  {
    name: '6影',
    type: '增伤',
    value: 0.06 * 5
  },
  {
    name: '额外能力：骑士战队',
    type: '增伤',
    value: 0.5 * 2,
    range: ['RZ']
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '强击', type: '强击' },
  { name: '冲刺攻击(周身射击)', type: 'CCS' },
  { name: '闪避反击：公平决斗', type: 'CF' },
  { name: '强化特殊技：清场时间', type: 'EQ' },
  { name: '连携技：星徽荣耀幻影', type: 'RL' },
  { name: '终结技：星徽在此闪耀', type: 'RZ' }
]