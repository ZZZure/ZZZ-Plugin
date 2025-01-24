/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '2影',
    type: '无视抗性',
    value: 0.085
  },
  {
    name: '额外能力：技术支持班组',
    type: '异常增伤',
    value: 0.18 * 2,
    range: ['感电']
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '感电每次', type: '感电' },
  { name: '紊乱', type: '紊乱' },
  { name: '闪避反击：违章处罚', type: 'CF' },
  {
    name: '强化特殊技：超规工程清障',
    type: 'EQ',
    after: ({ avatar, damage }) => {
      damage.x(avatar.rank >= 6 ? 6 : 2)
    }
  },
  { name: '连携技：协作施工', type: 'RL' },
  { name: '终结技：工程爆破请勿接近', type: 'RZ' }
]