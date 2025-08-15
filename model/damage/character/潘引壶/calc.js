/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '增伤',
    value: 0.1,
    is: { team: true }
  },
  {
    name: '核心被动：脉中乾坤',
    type: '贯穿力',
    value: ({ avatar, calc }) => {
      const initial_ATK = avatar.initial_properties.ATK
      const level = calc.get_SkillLevel('T')
      const multiplier = [0.09, 0.105, 0.12, 0.135, 0.15, 0.165, 0.18][level - 1]
      if (avatar.rank >= 6) {
        const ATK = calc.get_ATK()
        return Math.min(720, initial_ATK * multiplier + ATK * 0.06)
      }
      return Math.min(540, initial_ATK * multiplier)
    },
    is: { team: true }
  },
  {
    name: '额外能力：食铁纳金',
    type: '增伤',
    value: 0.2,
    is: { team: true }
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '普攻：极意连打四段', type: 'AP4' },
  { name: '闪避反击：移峰倒海', type: 'CF' },
  { name: '支援突击：借势打势', type: 'LT' },
  { name: '特殊技：断脉破穴手', type: 'EPD' },
  { name: '强化特殊技：贴山震脉靠', type: 'EQ' },
  { name: '连携技：锅气灌顶', type: 'RL' },
  { name: '终结技：满汉全席！', type: 'RZ' }
]