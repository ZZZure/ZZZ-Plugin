/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '1影',
    type: '暴击率',
    value: 0.02 * 6
  },
  {
    name: '2影',
    type: '暴击伤害',
    value: 0.6,
    range: ['EQ']
  },

  {
    name: '6影',
    type: '穿透率',
    value: 0.2
  },
  {
    name: '6影',
    type: '增伤',
    value: 2.5,
    range: ['CCXX']
  },
  {
    name: '核心被动：凌牙厉齿',
    type: '暴击伤害',
    value: 'T',
    range: ['CCXX', 'AQ']
  },
  {
    name: '额外能力：风暴潮',
    type: '增伤',
    value: 0.03 * 10,
    element: 'Ice'
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '碎冰', type: '碎冰' },
  { name: '普攻：急冻修剪法三段', type: 'AQ3' },
  { name: '闪避反击：暗礁', type: 'CF' },
  { name: '冲刺攻击：寒潮', type: 'CCP' },
  {
    name: '冲刺攻击：冰渊潜袭回旋斩击',
    isHide: true,
    type: 'CCX0'
  },
  {
    name: '冲刺攻击：冰渊潜袭点按',
    type: 'CCXP',
    after: ({ damage }) => damage.add('CCX0')
  },
  {
    name: '冲刺攻击：冰渊潜袭蓄力',
    type: 'CCXX',
    after: ({ damage }) => damage.add('CCX0')
  },
  { name: '强化特殊技：横扫', type: 'EQ1' },
  { name: '强化特殊技：鲨卷风', type: 'EQ2' },
  { name: '连携技：雪崩', type: 'RL' },
  { name: '终结技：永冬狂宴', type: 'RZ' }
]