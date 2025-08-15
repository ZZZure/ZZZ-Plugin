/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '暴击率',
    value: 0.12
  },
  {
    name: '2影',
    type: '暴击伤害',
    value: 0.22,
    is: {
      team: true
    }
  },
  {
    name: '4影',
    type: '暴击伤害',
    value: 0.35
  },
  {
    name: '6影',
    type: '增伤',
    value: 0.3,
    range: ['RL']
  },
  {
    name: '核心被动：虎虎生威',
    type: '暴击伤害',
    value: [0.1, 0.117, 0.133, 0.15, 0.167, 0.183, 0.2],
    is: {
      team: true
    }
  },
  {
    name: '核心被动：虎虎生威',
    type: '暴击伤害',
    value: ({ avatar }) => {
      const ATK = avatar.initial_properties.ATK
      if (ATK <= 2800) return 0
      return Math.min(0.3, (ATK - 2800) / 100 * 0.05)
    },
    is: {
      team: true
    }
  },
  {
    name: '核心被动：虎虎生威',
    type: '增伤',
    value: [0.1, 0.117, 0.133, 0.15, 0.167, 0.183, 0.2],
    range: ['RL'],
    is: {
      team: true
    }
  },
  {
    name: '核心被动：虎虎生威',
    type: '增伤',
    value: [0.2, 0.233, 0.267, 0.3, 0.333, 0.367, 0.4],
    range: ['RZ'],
    is: {
      team: true
    }
  },
  {
    name: '核心被动：虎虎生威',
    type: '冲击力',
    value: [25, 29.2, 33.3, 37.5, 41.7, 45.8, 50]
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '灼烧', type: '灼烧' },
  { name: '普攻：恶虎七式·燎身爪四段', type: 'AP4' },
  { name: '普攻：「虎威」', type: 'AH' },
  { name: '冲刺攻击：恶虎七式·山君鼎戏', type: 'CCXQ' },
  { name: '闪避反击：恶虎七式·离火回峰', type: 'CF' },
  { name: '支援突击：彪形焰颌', type: 'LT' },
  { name: '强化E：恶虎七式改·下山猛虎', type: 'EQ' },
  { name: '连携技：虎釜崩', type: 'RLB' },
  { name: '连携技：虎釜震煞', type: 'RLZ' },
  { name: '终结技：恶虎七式·猛虎炸开花', type: 'RZ' },
  {
    name: '6影高速旋转每个爆米花',
    type: 'Y6',
    check: 6,
    redirect: 'RL',
    multiplier: 1.6
  }
]