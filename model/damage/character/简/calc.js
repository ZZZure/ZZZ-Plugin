/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '增伤',
    value: ({ calc }) => {
      const AnomalyProficiency = calc.get_AnomalyProficiency()
      return Math.min(0.3, Math.floor(AnomalyProficiency) / 1000)
    }
  },
  {
    name: '2影',
    type: '无视防御',
    value: 0.15
  },
  {
    name: '2影',
    type: '异常暴击伤害',
    value: 0.5,
    range: ['强击']
  },
  {
    name: '4影',
    type: '异常增伤',
    value: 0.18
  },
  {
    name: '6影',
    type: '暴击率',
    value: 0.2
  },
  {
    name: '6影',
    type: '暴击伤害',
    value: 0.4
  },
  {
    name: '核心被动：洞察',
    type: '异常持续时间',
    value: 5,
    range: ['畏缩']
  },
  {
    name: '核心被动：洞察',
    type: '异常暴击率',
    value: ({ calc }) => {
      const base = calc.calc_value('T1')
      const extra = calc.calc_value('T2')
      const AnomalyProficiency = calc.get_AnomalyProficiency()
      return base + extra * Math.floor(AnomalyProficiency)
    },
    range: ['强击']
  },
  {
    name: '核心被动：洞察',
    type: '异常暴击伤害',
    value: 0.5,
    range: ['强击']
  },
  {
    name: '技能：狂热',
    type: '攻击力',
    value: ({ calc }) => {
      const AnomalyProficiency = calc.get_AnomalyProficiency()
      if (!AnomalyProficiency > 120) return 0
      return Math.min(600, Math.floor(AnomalyProficiency - 120) * 2)
    }
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '强击', type: '强击' },
  { name: '紊乱', type: '紊乱' },
  { name: '普攻：跳步刃舞六段(狂热)', type: 'AP6' },
  { name: '普攻：萨霍夫跳0', type: 'AX0', isHide: true },
  { name: '普攻：萨霍夫跳', type: 'AX', after: ({ damage }) => damage.add('AX0') },
  {
    name: '闪避反击：疾影',
    type: 'CFP',
    before: ({ usefulBuffs }) => {
      const i = usefulBuffs.findIndex(buff => buff.name === '技能：狂热')
      if (i !== -1) usefulBuffs.splice(i, 1)
    }
  },
  { name: '闪避反击：疾影连舞(狂热)', type: 'CFQ' },
  { name: '强化特殊技：掠空-横扫', type: 'EQ' },
  { name: '连携技：罪孽生花', type: 'RL' },
  { name: '终结技：终幕演出', type: 'RZ' },
  {
    name: '6影强击暴击额外攻击',
    type: 'Y6',
    check: ({ avatar }) => avatar.rank >= 6,
    before: ({ calc, areas }) => {
      const AnomalyProficiency = calc.get_AnomalyProficiency()
      areas.BasicArea = AnomalyProficiency * 16
    }
  }
]