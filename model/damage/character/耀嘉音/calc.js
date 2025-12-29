/** @type {import('../../interface.ts').buff[]} */
export const buffs = [
  {
    name: '1影',
    type: '无视抗性',
    teamTarget: true,
    value: 0.06 * 3
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
    teamTarget: true,
    showInPanel: true,
    value: ({ avatar, calc }) => {
      const isTwo = avatar.rank >= 2 // 2影额外提升
      const max = isTwo ? 1600 : 1200
      const multiplier = calc.calc_value('T') + (isTwo ? 0.19 : 0)
      return Math.min(max, avatar.initial_properties.ATK * multiplier)
    },
  },
  {
    name: '技能：咏叹华彩',
    type: '增伤',
    teamTarget: true,
    value: 'E1',
    range: ['AQ', 'E', 'R'] // 排除正常普攻
  },
  {
    name: '技能：咏叹华彩',
    type: '暴击伤害',
    teamTarget: true,
    value: 'E2',
    range: ['AQ', 'E', 'R']
  }
]

/** @type {import('../../interface.ts').skill['before']} */
const before = ({ avatar, calc, props, skill }) => {
  if (avatar.rank >= 6) props.倍率 = calc.get_SkillMultiplier(skill.type) * 2
}

/** @type {import('../../interface.ts').skill[]} */
export const skills = [
  { name: '普攻：《随想曲》三段', type: 'AP3' },
  {
    name: '6影追加蓄力普攻三段',
    type: 'AP3',
    banCache: true,
    check: 6,
    before: ({ usefulBuffs }) => usefulBuffs.push({
      name: '6影',
      type: '暴击率',
      value: 0.8
    })
  },
  { name: '普攻：间奏/终曲每[震音]', type: 'AQ', before },
  { name: '特殊技：《风铃与旧约》', type: 'EP', before },
  { name: '和弦追加[震音]', isMain: true, type: 'EQZ', before },
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