/**
 * @param {import('../../interface.ts').BuffManager} buffM
 * @param {import('../../interface.ts').Calculator} calc
 * @param {import('../../interface.ts').ZZZAvatarInfo} avatar
 */
export function calc(buffM, calc, avatar) {
  /** 注册buff */
  // 影画加成
  buffM.new({
    name: '1影',
    type: ,
    value: 0,
    range: ['']
  })
  buffM.new({
    name: '2影',
    type: ,
    value: 0,
    range: ['']
  })
  buffM.new({
    name: '4影',
    type: ,
    value: 0,
    range: ['']
  })
  buffM.new({
    name: '6影',
    type: ,
    value: 0,
    range: ['']
  })
  // 核心被动加成
  buffM.new({
    name: '核心被动：',
    type: ,
    value: 0,
    element: ,
    range: ['']
  })
  // 额外能力加成
  buffM.new({
    name: '额外能力：',
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
  calc.new({ name: '普攻：', type: 'AP' })
  calc.new({ name: '闪避反击：', type: 'CF' })
  calc.new({ name: '支援突击：', type: 'LT' })
  calc.new({ name: '强E：', type: 'EQ' })
  calc.new({ name: '连携技：', type: 'RL' })
  calc.new({ name: '终结技：', type: 'RZ' })
  calc.new({ name: '', type: '' })
}

/** @type {import('../../interface.ts').buff[]} */
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

/** @type {import('../../interface.ts').skill[]} */
export const skills = [
  { name: '普攻：', type: 'AP' },
  { name: '闪避反击：', type: 'CF' },
  { name: '支援突击：', type: 'LT' },
  { name: '强E：', type: 'EQ' },
  { name: '连携技：', type: 'RL' },
  { name: '终结技：', type: 'RZ' },
  { name: '', type: '' },
]