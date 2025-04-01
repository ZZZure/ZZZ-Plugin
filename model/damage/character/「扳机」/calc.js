/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '2影',
    type: '暴击伤害',
    value: 0.06 * 4
  },
  {
    name: '4影',
    type: '倍率',
    value: 2,
    range: ['AXP', 'AXQ0'] // 只在AXQ0处计算一次
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  // { name: '感电每次', type: '感电' },
  { name: '普攻：冷膛射击四段', type: 'AP4' },
  { name: '长按普攻：无音狙杀·射击', type: 'AWS' },
  { name: '长按普攻：无音狙杀·反击', type: 'AWF' },
  { name: '长按普攻：无音狙杀·终结', type: 'AWZ' },
  {
    name: '普攻：协奏狙杀',
    type: 'AXP',
    redirect: ['AXP', '追加攻击'],
    after: ({ damage }) => damage.x(2)
  },
  {
    name: '普攻：协奏狙杀·冥狱·连射',
    type: 'AXQ0',
    redirect: ['AXQ0', '追加攻击'],
    isHide: true,
    after: ({ damage }) => damage.x(3)
  },
  {
    name: '普攻：协奏狙杀·冥狱',
    type: 'AXQ',
    redirect: ['AXQ', '追加攻击'],
    after: ({ damage }) => damage.add('AXQ0')
  },
  { name: '闪避反击：极魂罚', type: 'CF' },
  { name: '强化特殊技：幽闪花葬', type: 'EQ' },
  { name: '连携技：冥河之引', type: 'RL' },
  { name: '终结技：冥府挽歌', type: 'RZ' },
  {
    name: '6影破甲凶弹',
    type: 'Y6',
    check: 6,
    fixedMultiplier: 12,
    before: ({ usefulBuffs }) => usefulBuffs.push({
      name: '6影',
      type: '增伤',
      value: 0.5
    })
  }
]