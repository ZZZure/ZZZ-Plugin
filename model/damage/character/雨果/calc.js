/** @type {import('../../interface.ts').buff[]} */
export const buffs = [
  {
    name: '1影',
    type: '暴击率',
    value: 0.12,
    range: ['EQJ', 'RZJ']
  },
  {
    name: '1影',
    type: '暴击伤害',
    value: 0.3,
    range: ['EQJ', 'RZJ']
  },
  {
    name: '2影',
    type: '无视防御',
    value: 0.15,
    range: ['EQJ', 'RZJ']
  },
  {
    name: '4影',
    type: '无视抗性',
    value: 0.12,
    element: 'Ice'
  },
  {
    name: '6影',
    type: '增伤',
    value: 0.6,
    range: ['EQJ', 'RZJ']
  },
  {
    name: '6影',
    type: '倍率',
    value: 10,
    include: ['EQP']
  },
  {
    name: '核心被动：终末裁决',
    type: '攻击力',
    value: 'TA2', // 按2名击破位计算
  },
  {
    name: '核心被动：终末裁决',
    type: '暴击率',
    value: 0.12
  },
  {
    name: '核心被动：终末裁决',
    type: '暴击伤害',
    value: 0.25
  },
  {
    name: '核心被动：终末裁决',
    type: '倍率',
    value: ({ calc }) => calc.get_SkillMultiplier('TJ0'),
    include: ['EQJ', 'RZJ']
  },
  {
    name: '核心被动：终末裁决',
    type: '倍率',
    value: ({ calc }) => calc.get_SkillMultiplier('TJ1') * 5, // 5/12
    include: ['EQJ', 'RZJ']
  },
  {
    name: '核心被动：终末裁决',
    type: '倍率',
    value: ({ calc }) => calc.get_SkillMultiplier('TJ2') * 7, // 7/12
    include: ['EQJ', 'RZJ']
  },
  {
    name: '额外能力：终焉序曲',
    type: '增伤',
    value: 0.15, // 取非普通敌人
    range: ['RL']
  },
  {
    name: '额外能力：终焉序曲',
    type: '增伤',
    value: 0.4,
    range: ['EQJ', 'RZJ']
  }
]

/** @type {import('../../interface.ts').skill[]} */
export const skills = [
  { name: '碎冰', type: '碎冰' },
  {
    name: '普攻：暗渊四重奏四段·斩击',
    type: 'AP4Z',
    isHide: true
  },
  {
    name: '普攻：暗渊四重奏四段',
    type: 'AP4P',
    after: ({ damage }) => damage.add('AP4Z')
  },
  {
    name: '普攻：暗渊四重奏四段(蓄力)',
    type: 'AP4X',
    after: ({ damage }) => damage.add('AP4Z')
  },
  {
    name: '普攻：暗渊协奏曲·斩击',
    type: 'AQZ',
    isHide: true
  },
  {
    name: '普攻：暗渊协奏曲',
    type: 'AQP',
    after: ({ damage }) => damage.add('AQZ')
  },
  {
    name: '普攻：暗渊协奏曲(蓄力)',
    type: 'AQX',
    after: ({ damage }) => damage.add('AQZ')
  },
  {
    name: '闪避反击：诡影·斩',
    type: 'CFP'
  },
  {
    name: '闪避反击：诡影·斩(蓄力)',
    type: 'CFX',
    after: ({ damage }) => damage.add('CFP')
  },
  // 决算计算参考：https://www.miyoushe.com/zzz/article/64534320
  {
    name: '强E：魂狩·惩戒0', // 基础
    type: 'EQ0',
    isHide: true,
    multiplier: ({ calc }) => calc.get_SkillMultiplier('EQP') * 0.05
  },
  {
    name: '强E：魂狩·惩戒',
    type: 'EQP',
    multiplier: ({ calc }) => calc.get_SkillMultiplier('EQP') * 0.95,
    after: ({ damage }) => damage.add('EQ0')
  },
  {
    name: '强E：魂狩·惩戒[决算](12s失衡)', // 终结一击
    type: 'EQJ',
    isMain: true,
    multiplier: ({ calc }) => calc.get_SkillMultiplier('EQP') * 0.95,
    after: ({ damage }) => damage.add('EQ0')
  },
  { name: '连携技：命运戏法', type: 'RL' },
  { name: '终结技：渎神者', type: 'RZP' },
  {
    name: '终结技：渎神者[决算](12s失衡)', // 基础
    type: 'RZ0',
    isHide: true,
    multiplier: ({ calc }) => calc.get_SkillMultiplier('RZP') * (11 / 15)
  },
  {
    name: '终结技：渎神者[决算](12s失衡)', // 终结一击
    type: 'RZJ',
    multiplier: ({ calc }) => calc.get_SkillMultiplier('RZP') * (4 / 15)
  },
  {
    name: '[决算](固定倍率伤害)',
    type: 'EQJP0', // 按强化特殊技伤害计算
    multiplier: 'TJ0'
  },
  {
    name: '[决算](5秒内每秒失衡伤害)',
    type: 'EQJP1',
    multiplier: 'TJ1'
  },
  {
    name: '[决算](5秒外每秒失衡伤害)',
    type: 'EQJP2',
    multiplier: 'TJ2'
  }
]