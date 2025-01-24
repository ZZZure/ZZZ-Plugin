/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '6影',
    type: '暴击伤害',
    value: 0.6,
    isForever: true,
    range: ['Y6']
  },
  {
    name: '核心被动：守望者',
    type: '异常精通',
    value: 'T'
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '感电每次', type: '感电' },
  {
    name: '6影额外伤害',
    type: 'Y6',
    isHide: true,
    check: ({ avatar }) => avatar.rank >= 6,
    fixedMultiplier: 5,
    props: {
      暴击率: 1
    }
  },
  {
    name: '蓄力普攻：雷霆击-感电(连续攻击)',
    type: 'AX0',
    isHide: true
  },
  {
    name: '蓄力普攻：雷霆击-感电',
    type: 'AX',
    after: ({ damage }) => {
      damage.add('AX0')
      damage.add('Y6')
    }
  },
  { name: '闪避反击：以退为进', type: 'CF' },
  { name: '强化E：电光盾冲(蓄力)', type: 'EQX' },
  { name: '连携技：最终制裁', type: 'RL' },
  { name: '终结技：正义必胜', type: 'RZ' }
]