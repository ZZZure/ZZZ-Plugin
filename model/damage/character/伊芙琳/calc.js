/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '无视防御',
    value: 0.12
  },
  {
    name: '2影',
    type: '攻击力',
    value: 0.15,
    isForever: true
  },
  {
    name: '4影',
    type: '暴击伤害',
    value: 0.4
  },
  {
    name: '核心被动：缠丝',
    type: '暴击率',
    value: 'T'
  },
  {
    name: '额外能力：潜袭支点',
    type: '增伤',
    value: 0.3,
    range: ['RL', 'RZ'],
    exclude: ['Y6']
  },
  {
    name: '额外能力：潜袭支点',
    type: '倍率',
    check: ({ calc }) => calc.get_CRITRate() >= 0.8,
    value: ({ calc }) => calc.get_SkillMultiplier(calc.skill.type) * 0.25,
    range: ['RL', 'RZ'],
    exclude: ['Y6']
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '普攻：割弦五段', type: 'AP5' },
  { name: '蓄力普攻：绞勒式·Ⅰ型', type: 'AX1' },
  { name: '蓄力普攻：绞勒式·Ⅱ型', type: 'AX2' },
  { name: '闪避反击：绞缢反制', type: 'CF' },
  {
    name: '强化特殊技：束裂式·终型(引爆)',
    type: 'EQ0',
    isHide: true
  },
  {
    name: '强化特殊技：束裂式·终型',
    type: 'EQ',
    after: ({ damage }) => damage.add('EQ0')
  },
  { name: '连携技：月辉丝·绊', type: 'RL' },
  { name: '终结技：月辉丝·弦音', type: 'RZ' },
  {
    name: '6影月辉丝·弦',
    type: 'Y6',
    redirect: 'RL',
    fixedMultiplier: 3.75,
    check: ({ avatar }) => avatar.rank >= 6
  }
]