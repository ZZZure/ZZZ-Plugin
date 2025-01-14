/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '无视抗性',
    value: 0.16,
    element: 'Physical'
  },
  {
    name: '4影',
    type: '暴击率',
    value: 0.07 * 2
  },
  {
    name: '6影',
    type: '暴击伤害',
    value: 0.18 * 3
  },
  {
    name: '核心被动：猫步诡影',
    type: '增伤',
    value: 'T'
  },
  {
    name: '额外能力：猫步秀',
    type: '增伤',
    value: 0.35 * 2,
    range: ['EQ']
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '强击', type: '强击' },
  { name: '普攻：猫猫爪刺四段', type: 'AP4' },
  { name: '闪避反击：虚影双刺', type: 'CF' },
  { name: '强化特殊技：超~凶奇袭！', type: 'EQ' },
  { name: '连携技：刃爪挥击', type: 'RL' },
  { name: '终结技：刃爪强袭', type: 'RZ' }
]
