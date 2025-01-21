/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '无视抗性',
    value: 0.06 * 3
  },
  {
    name: '2影',
    type: '攻击力',
    value: ({ avatar }) => Math.min(400, avatar.initial_properties.ATK * 0.19)
  },
  {
    name: '6影',
    type: '暴击率',
    value: 0.8,
    range: ['AQ', 'EP', 'EQZ', 'EZ', 'EY']
  },
  {
    name: '核心被动：《如歌的行板》',
    type: '攻击力',
    value: ({ avatar, calc }) => Math.min(1200, avatar.initial_properties.ATK * calc.calc_value('T')),
  },
  {
    name: '技能：咏叹华彩',
    type: '增伤',
    value: 'E1',
    range: ['AQ', 'E', 'R'] // 排除正常普攻
  },
  {
    name: '技能：咏叹华彩',
    type: '暴击伤害',
    value: 'E2',
    range: ['AQ', 'E', 'R']
  }
]

/** @type {import('../../Calculator.ts').skill['before']} */
const before = ({ avatar, calc, props, skill }) => {
  if (avatar.rank >= 6) props.倍率 = calc.get_SkillMultiplier(skill.type) * 2
}

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '普攻：《随想曲》三段', type: 'AP3' },
  {
    name: '6影追加蓄力普攻三段',
    type: 'AP3',
    banCache: true,
    check: ({ avatar }) => avatar.rank >= 6,
    before: ({ usefulBuffs }) => usefulBuffs.push({
      name: '6影',
      type: '暴击率',
      value: 0.8
    })
  },
  { name: '普攻：间奏/终曲每[震音]', type: 'AQ', before },
  { name: '特殊技：《风铃与旧约》', type: 'EP', before },
  { name: '和弦追加[震音]', type: 'EQZ', before },
  { name: '天赋追加[震音]', type: 'EZ', before },
  {
    name: '追加[音簇]*3',
    type: 'EY',
    before,
    after: ({ damage }) => damage.x(3)
  },
  { name: '连携技：《微醺协奏》', type: 'RL' },
  { name: '终结技：《幻想式奏鸣》', type: 'RZ' }
]