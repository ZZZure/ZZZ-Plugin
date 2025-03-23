/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '2影',
    type: '暴击率',
    value: 0.12,
    isForever: true
  },
  {
    name: '4影',
    type: '无视抗性',
    value: 0.12,
    element: 'Electric'
  },
  {
    name: '核心被动：电位差',
    type: '增伤',
    value: 'T1'
  },
  {
    name: '核心被动：电位差',
    type: '暴击伤害',
    value: ({ calc }) => calc.get_CRITDMG() * calc.calc_value('T2'),
    range: ['追加攻击']
  },
  {
    name: '额外能力：超频',
    type: '暴击率',
    value: 0.1
  },
  {
    name: '额外能力：超频',
    type: '增伤',
    value: 0.25,
    range: ['追加攻击'],
    is: {
      team: true
    }
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '感电每次', type: '感电' },
  { name: '普攻：电击穿五段', type: 'AP5' },
  { name: '闪避反击：地闪回击', type: 'CF' },
  { name: '特殊技：苍光0', type: 'EPC0', isHide: true },
  {
    name: '特殊技：苍光',
    type: 'EPC',
    redirect: ['EPC', '追加攻击'],
    after: ({ damage }) => damage.add('EPC0')
  },
  {
    name: '特殊技：雷殛',
    type: 'EPL',
    redirect: ['EPL', '追加攻击']
  },
  { name: '强化特殊技：极雷断空', type: 'EQ' },
  { name: '连携技：疾跃落雷', type: 'RL' },
  { name: '终结技：斩空掠电', type: 'RZ' },
  {
    name: '6影电磁涡流',
    type: 'Y6',
    check: 6,
    fixedMultiplier: 10,
    redirect: '追加攻击'
  }
]