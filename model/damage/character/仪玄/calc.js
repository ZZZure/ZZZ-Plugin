/**
 * @param {import('../../BuffManager.ts').BuffManager} buffM
 * @param {import('../../Calculator.ts').Calculator} calc
 * @param {import('../../../avatar.js').ZZZAvatarInfo} avatar
 */
export function calc(buffM, calc, avatar) {
  /** 注册buff */
  // 影画加成
  buffM.new({
    name: '1影',
    type: '暴击率',
    value: 10,
    range: ['Y1']
  })
  buffM.new({
    name: '2影',
    type: '无视抗性',
    value: 0.15,
    range: ['EQ', 'RZ']
  })
  buffM.new({
    name: '4影',
    type: '增伤',
    value: 0.30,
    range: ['']
  })
  buffM.new({
    name: '6影',
    type: '贯穿伤害',
    value: 20,
    range: ['Y6']
  })
  // 核心被动加成
  buffM.new({
    name: '核心被动：术法宗师',
    type: ,
    value: 0,
    element: ,
    range: ['']
  })
  // 额外能力加成
  buffM.new({
    name: '额外能力：玄墨暗涌',
    type: ,
    value: 0,
    element: ,
    range: ['']
  })
  // 技能加成
  buffM.new({
    name: '技能：',
    type: ,
    value: 0,
    element: ,
    range: ['']
  })
  /** 注册技能 */
  calc.new({ name: '普通攻击：', type: '' })
  calc.new({ name: '强化特殊技：', type: '' })
  calc.new({ name: '连携技：', type: '' })
  calc.new({ name: '终结技：', type: '' })
  calc.new({ name: '', type: '' })
}

/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: ,
    value: 0,
    range: ['']
  },
  {
    name: '2影',
    type: ,
    value: 0,
    range: ['']
  },
  {
    name: '4影',
    type: ,
    value: 0,
    range: ['']
  },
  {
    name: '6影',
    type: ,
    value: 0,
    range: ['']
  },
  {
    name: '核心被动：',
    type: ,
    value: 0,
    element: ,
    range: ['']
  },
  {
    name: '额外能力：',
    type: ,
    value: 0,
    element: ,
    range: ['']
  },
  {
    name: '技能：',
    type: ,
    value: 0,
    element: ,
    range: ['']
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '普攻：', type: 'AP' },
  { name: '冲刺攻击：', type: 'CC' },
  { name: '闪避反击：', type: 'CF' },
  { name: '强化特殊技：', type: 'EQ' },
  { name: '连携技：', type: 'RL' },
  { name: '终结技：', type: 'RZ' },
  { name: '', type: '' },
]