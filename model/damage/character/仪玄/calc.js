/** @type {import('../../interface.ts').buff[]} */
export const buffs = [
  {
    name: '1影',
    type: '暴击率',
    value: 0.1
  },
  {
    name: '2影',
    type: '无视抗性',
    value: 0.15,
    range: ['RZ', 'EQ']
  },
  {
    name: '4影',
    type: '增伤',
    value: 0.3 * 2,
    include: ['EQX', 'EQM']
  },
  {
    name: '6影',
    type: '贯穿增伤',
    value: 0.2
  },
  {
    name: '核心被动：术法宗师',
    type: '贯穿力',
    value: ({ calc }) => Math.trunc(calc.get_HP() * 0.1)
  },
  {
    name: '核心被动：术法宗师',
    type: '增伤',
    value: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6],
    range: ['EQ', 'LT', 'RL', 'RZ'],
    include: ['AXQ', 'AXZ']
  },
  {
    name: '额外能力：玄墨暗涌',
    type: '暴击伤害',
    value: 0.4
  }
]

/** @type {import('../../interface.ts').skill[]} */
export const skills = [
  { name: '侵蚀每段', type: '侵蚀' },
  { name: '普攻：霄云劲五段', type: 'AP5' },
  // { name: '普攻：墨影凝云', type: 'AXP' },
  {
    name: '普攻：玄墨极阵(满蓄)',
    type: 'AXQ',
    after: ({ damage }) => damage.add('AXZ')
  },
  {
    name: '普攻：青溟震击',
    type: 'AXZ',
    isHide: true
  },
  {
    name: '蓄力普攻：凝云术(满蓄)',
    type: 'EQX',
    after: ({ damage }) => damage.add('EQM'),
  },
  { name: '闪避反击：除祟一击', type: 'CF' },
  { name: '强化E1：墨痕化形', type: 'EQP1P' },
  {
    name: '强化E1：墨痕化形(满蓄或格挡)追加攻击',
    type: 'EQP1Z',
    isHide: true
  },
  {
    name: '强化E1：墨痕化形(满蓄或格挡)',
    type: 'EQP1X',
    dmg: (calc) => {
      const dmg = calc.calc_skill({
        ...calc.find_skill('type', 'EQP1P'),
        banCache: true,
        after: ({ damage }) => damage.add('EQP1Z')
      })
      return dmg
    }
  },
  { name: '强化E2：霄云迅击-破', type: 'EQP2' },
  { name: '强化E3：青溟震击-破', type: 'EQP3' },
  {
    name: '强化E：墨烬影消',
    type: 'EQM',
    isHide: true
  },
  {
    name: '2影强化E：符法千重-破',
    type: 'EQF',
    check: 2,
    multiplier: 12
  },
  { name: '连携技：玄墨迅击', type: 'RL' },
  { name: '终结技：青溟云影', type: 'RZQ' },
  {
    name: '终结技：符法千重',
    type: 'RZF',
    isMain: true
  }
]