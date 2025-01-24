/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '无视抗性',
    value: 0.15
  },
  {
    name: '2影',
    type: '攻击力',
    value: ({ calc }) => calc.calc_value('T') * 0.5
  },
  {
    name: '6影',
    type: '暴击率',
    value: 1,
    isForever: true,
    range: ['EQQ', 'LT']
  },
  {
    name: '6影',
    type: '增伤',
    value: 1,
    isForever: true,
    range: ['EQQ', 'LT']
  },
  {
    name: '6影',
    type: '暴击率',
    value: 0.3
  },
  {
    name: '6影',
    type: '暴击伤害',
    value: 0.6
  },
  {
    name: '核心被动：坚韧之壁',
    type: '攻击力',
    value: 'T'
  },
  {
    name: '额外能力：战意激昂',
    type: '增伤',
    value: 0.25
  },
  {
    name: '技能：攻防转换',
    type: '冲击力',
    value: 'E'
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '普攻：横行斩打六段', type: 'AP6' },
  { name: '蓄力普攻：此路不通！', type: 'AX' },
  { name: '冲刺攻击：猪突猛进', type: 'CC' },
  { name: '闪避反击：以牙还牙', type: 'CF' },
  { name: '强化特殊技：招架反击', type: 'EQP' },
  { name: '强化特殊技：超强力盾击', type: 'EQQ' },
  { name: '连携技：路怒震打', type: 'RL' },
  { name: '终结技：暴君猛击', type: 'RZ' }
]