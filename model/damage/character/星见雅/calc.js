// 函数导出：

/**
 * @param {import('../../BuffManager.ts').BuffManager} buffM
 * @param {import('../../Calculator.ts').Calculator} calc
 * @param {import('../../../avatar.js').ZZZAvatarInfo} avatar
 */
// export function calc(buffM, calc, avatar) {
//   /** 注册buff */
//   // 影画加成
//   buffM.new({
//     name: '1影',
//     type: '无视防御',
//     value: 0.36,
//     range: ['AX']
//   })
//   buffM.new({
//     name: '2影',
//     type: '增伤',
//     isForever: true,
//     value: 0.30,
//     range: ['AP', 'CF']
//   })
//   buffM.new({
//     name: '2影',
//     type: '暴击率',
//     isForever: true,
//     value: 0.15
//   })
//   buffM.new({
//     name: '4影',
//     type: '增伤',
//     isForever: true,
//     value: 0.30,
//     range: ['TP']
//   })
//   buffM.new({
//     name: '6影',
//     type: '增伤',
//     isForever: true,
//     value: 0.30,
//     range: ['AX']
//   })
//   // 额外能力加成
//   buffM.new({
//     name: '额外能力：同沐霜雪',
//     type: '增伤',
//     isForever: true,
//     value: 0.6,
//     range: ['AX']
//   })
//   buffM.new({
//     name: '额外能力：同沐霜雪',
//     type: '无视抗性',
//     isForever: true,
//     value: 0.3,
//     range: ['AX']
//   })
//   // 技能加成
//   buffM.new({
//     name: '终结技',
//     type: '增伤',
//     element: 'Ice',
//     range: ['RZ'],
//     value: 0.3
//   })

//   /** 注册技能 */
//   calc.new({ name: '碎冰', type: '碎冰' })
//   calc.new({ name: '紊乱', type: '紊乱' })
//   calc.new({ name: '普通攻击：风花五段', type: 'AP5' })
//   calc.new({ name: '闪避反击：寒雀', type: 'CF' })
//   calc.new({ name: '霜灼·破', type: 'TP' })
//   calc.new({ name: '蓄力攻击：一段蓄', type: 'AX1' })
//   calc.new({
//     name: '蓄力攻击：二段蓄',
//     type: 'AX2',
//     after: ({ avatar, damage }) => avatar.rank >= 6 && damage.add('AX1')
//   })
//   calc.new({
//     name: '蓄力攻击：三段蓄',
//     type: 'AX3',
//     after: ({ avatar, damage }) => avatar.rank >= 6 && damage.add('AX2')
//   })
//   calc.new({ name: '强化特殊技：飞雪', type: 'EQ1' })
//   calc.new({ name: '强化特殊技：飞雪（二段）', type: 'EQ2' })
//   calc.new({ name: '连携技：春临', type: 'RL' })
//   calc.new({ name: '终结技：名残雪', type: 'RZ' })
// }

// 直接导出：

/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '无视防御',
    value: 0.36,
    range: ['AX']
  },
  {
    name: '2影',
    type: '暴击率',
    isForever: true,
    value: 0.15
  },
  {
    name: '2影',
    type: '增伤',
    isForever: true,
    value: 0.30,
    range: ['AP', 'CF']
  },
  {
    name: '4影',
    type: '增伤',
    isForever: true,
    value: 0.30,
    range: ['TP']
  },
  {
    name: '6影',
    type: '增伤',
    isForever: true,
    value: 0.30,
    range: ['AX']
  },
  {
    name: '额外能力：同沐霜雪',
    type: '增伤',
    isForever: true,
    value: 0.6,
    range: ['AX']
  },
  {
    name: '额外能力：同沐霜雪',
    type: '无视抗性',
    isForever: true,
    value: 0.3,
    range: ['AX']
  },
  {
    name: '终结技',
    type: '增伤',
    element: 'Ice',
    range: ['RZ'],
    value: 0.3
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '碎冰', type: '碎冰' },
  { name: '紊乱', type: '紊乱' },
  { name: '普攻：风花五段', type: 'AP5' },
  { name: '闪避反击：寒雀', type: 'CF' },
  { name: '霜灼·破', type: 'TP' },
  { name: '蓄力攻击：一段蓄', type: 'AX1' },
  {
    name: '蓄力攻击：二段蓄',
    type: 'AX2',
    after: ({ avatar, damage }) => avatar.rank >= 6 && damage.add('AX1')
  },
  {
    name: '蓄力攻击：三段蓄',
    type: 'AX3',
    after: ({ avatar, damage }) => avatar.rank >= 6 && damage.add('AX2')
  },
  { name: '强化特殊技：飞雪', type: 'EQ1' },
  { name: '强化特殊技：飞雪（二段）', type: 'EQ2' },
  { name: '连携技：春临', type: 'RL' },
  { name: '终结技：名残雪', type: 'RZ' }
]
