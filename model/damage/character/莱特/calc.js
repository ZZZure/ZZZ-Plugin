/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '无视抗性',
    value: 0.1,
    element: ['Fire', 'Ice']
  },
  {
    name: '1影',
    type: '增伤',
    value: 0.3,
    isForever: true,
    range: ['AQ5Q']
  },
  {
    name: '2影',
    type: '增伤',
    element: ['Fire', 'Ice'],
    value: ({ buffM, calc }) => {
      const buff = buffM.find('name', '额外能力：斗志昂扬')
      if (!buff || !buff.status) return 0
      const value = calc.calc_value(buff.value)
      return value * 0.2
    },
  },
  {
    name: '核心被动：助燃剂',
    type: '冲击力',
    value: 'T'
  },
  {
    name: '核心被动：助燃剂',
    type: '无视抗性',
    value: 0.15,
    element: ['Fire', 'Ice']
  },
  {
    name: '额外能力：斗志昂扬',
    type: '增伤',
    element: ['Fire', 'Ice'],
    value: ({ calc }) => {
      const Impact = calc.get_Impact()
      const step = 0.0125 + Math.max(0, Math.floor((Impact - 170) / 10) * 25 / 10000)
      return Math.min(0.75, step * 20)
    }
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '普攻：强力终结一击', type: 'AQ5Q' },
  { name: '闪避反击：烈闪', type: 'CF' },
  { name: '快速支援：烈闪-守', type: 'LK' },
  { name: '强化E：V式日轮升拳-全冲程', type: 'EQ1' },
  { name: '强化E：强力追击', type: 'EQ2' },
  { name: '连携技：V式灼日炎', type: 'RL' },
  { name: '终结技：W式桂冠终火', type: 'RZ' },
  {
    name: '6影[火焰冲击]',
    type: 'Y6',
    check: ({ avatar }) => avatar.rank >= 6,
    before: ({ calc, props }) => {
      const Impact = calc.get_Impact()
      props.倍率 = 2.5 + Math.min(5, Math.max(0, Math.floor(Impact - 170) * 5 / 100))
    }
  },
]