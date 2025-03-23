/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '暴击率',
    value: 0.1
  },
  {
    name: '2影',
    type: '攻击力',
    value: 0.1
  },
  {
    name: '6影',
    type: '增伤',
    value: 0.15,
    range: ['EPLP', 'EPLZ']
  },
  {
    name: '6影额外能力：业务搭档',
    type: '增伤',
    value: 0.3,
    check: 6
  },
  {
    name: '额外能力：业务搭档',
    type: '增伤',
    value: 0.3,
    check: ({ avatar }) => avatar.rank < 6,
    range: ['追加攻击']
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '普攻：捷击三段', type: 'AP3' },
  { name: '长按普攻：跃击', type: 'AX' },
  { name: '闪避反击：睚眦必报', type: 'CF' },
  {
    name: '特殊技：噬爪·噩梦袭影',
    type: 'EPLP',
    redirect: ['EPLP', '追加攻击']
  },
  {
    name: '噬爪·噩梦袭影终结一击',
    type: 'EPLZ',
    redirect: ['EPLZ', '追加攻击']
  },
  { name: '强化特殊技：噬爪·瞬步', type: 'EQ' },
  { name: '连携技：嗨，想不到吧', type: 'RL' },
  { name: '终结技：噢，游戏时间', type: 'RZ' }
]