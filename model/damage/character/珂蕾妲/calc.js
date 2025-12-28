/** @type {import('../../interface.ts').buff[]} */
export const buffs = [
  {
    name: '4影',
    type: '增伤',
    value: 0.18 * 2,
    range: ['RL', 'RZ']
  }
]

/** @type {import('../../interface.ts').skill[]} */
export const skills = [
  { name: '灼烧', type: '灼烧' },
  { name: '强化普攻二段', type: 'AQ2' },
  { name: '闪避反击：别小看我', type: 'CF' },
  {
    name: '6影额外伤害',
    type: 'Y6',
    isHide: true,
    multiplier: 3.6,
    check: 6
  },
  { name: '强化特殊技：沸腾熔炉0', type: 'EQP0', isHide: true },
  {
    name: '强化特殊技：沸腾熔炉',
    type: 'EQP',
    after: ({ damage }) => {
      damage.add('EQP0')
      damage.add('Y6')
    }
  },
  { name: '连携技：天崩-地裂', type: 'RL', after: ({ damage }) => damage.add('Y6') },
  { name: '终结技：锤进地心', type: 'RZP', after: ({ damage }) => damage.add('Y6') }
]