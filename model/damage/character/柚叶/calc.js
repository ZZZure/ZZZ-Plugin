/** @type {import('../../interface.ts').buff[]} */
export const buffs = [
  {
    name: '1影',
    type: '无视抗性',
    value: 0.1,
    is: { team: true }
  },
  {
    name: '2影',
    type: '增伤',
    value: 0.15,
    is: { team: true }
  },
  {
    name: '4影',
    type: '增伤',
    value: 0.3,
    range: ['LT']
  },
  {
    name: '6影',
    type: '倍率',
    value: 1.05 * 3,
    range: ['紊乱']
  },
  {
    name: '核心被动：奇巧缤纷',
    type: '攻击力',
    value: ({ avatar, calc }) => {
      const initial_ATK = avatar.initial_properties.ATK
      const level = calc.get_SkillLevel('T')
      const max = [600, 700, 800, 900, 1000, 1100, 1200][level - 1]
      return Math.min(max, initial_ATK * 0.4)
    },
    is: { team: true }
  },
  {
    name: '核心被动：奇巧缤纷',
    type: '增伤',
    value: 0.15,
    is: { team: true }
  },
  {
    name: '额外能力：人多乐趣大',
    type: '异常增伤',
    value: ({ avatar }) => {
      const { AnomalyMastery } = avatar.initial_properties
      if (AnomalyMastery <= 100) return 0
      return Math.min(0.2, (AnomalyMastery - 100) * 0.002) * (avatar.rank >= 1 ? 1.3 : 1)
    },
    is: { team: true }
  }
]

/** @type {import('../../interface.ts').skill[]} */
export const skills = [
  { name: '强击', type: '强击' },
  { name: '紊乱', type: '紊乱' },
  { name: '普攻：狸之爪五段', type: 'AP5' },
  { name: '普攻：硬糖射击', type: 'AY' },
  { name: '普攻：彩糖花火·极', type: 'ACS' },
  { name: '闪避反击：报复开始~', type: 'CF' },
  { name: '支援突击：来块曲奇', type: 'LTP' },
  { name: '支援突击：夹心硬糖射击', type: 'LTS' },
  { name: '强E：小心蛀牙', type: 'EQP', isMain: true },
  { name: '强E：小心蛀牙，就是现在！', type: 'EQS' },
  { name: '连携技：恶作剧合战', type: 'RL' },
  { name: '终结技：不投降就捣乱', type: 'RZ' },
  {
    name: '6影支援突击蓄力每炮弹',
    type: 'Y6',
    check: 6,
    multiplier: 3,
    redirect: 'LTS'
  }
]