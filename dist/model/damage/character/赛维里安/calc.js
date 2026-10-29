/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    name: '1影',
    type: '无视抗性',
    value: 0.15,
    element: 'Wind'
  },
  {
    name: '2影',
    type: '穿透率',
    value: 0.2
  },
  {
    name: '4影',
    type: '攻击力',
    value: 0.1
  },
  {
    name: '6影',
    type: '倍率',
    value: 3.5,
    range: ['AX']
  },
  {
    name: '核心被动：风回无终',
    type: '暴击伤害',
    value: 'T1'
  },
  {
    name: '核心被动：风回无终',
    type: '增伤',
    value: 'T2'
  },
  {
    name: '核心被动：同属协同',
    type: '增伤',
    value: 'T3',
    element: 'Wind'
  },
  {
    name: '额外能力：最优编配',
    type: '攻击力',
    value: ({ calc, avatar }) => {
      const cr = calc ? calc.get_CRITRate() : (avatar.initial_properties?.CRITRate || 0)
      return Math.min(100, Math.round(cr * 100)) * 8.5
    }
  }
]

/** @type {import('#interface').skill[]} */
export const skills = [
  {
    name: '普攻：苍风影猎',
    isMain: true,
    type: 'AX'
  },
  {
    name: '普攻：烈旋',
    type: 'APL'
  },
  {
    name: '普攻：疾锋四段',
    type: 'AP4'
  },
  {
    name: '闪避反击：梢杀',
    type: 'CF'
  },
  {
    name: '强化特殊技：风刃连击',
    type: 'EQ2',
    isHide: true
  },
  {
    name: '强化特殊技：瞬风裂毁',
    type: 'EQ1',
    after: ({ damage }) => damage.add('EQ2')
  },
  {
    name: '连携技：冽刃收割',
    type: 'RL'
  },
  {
    name: '终结技：戮灭的风灾',
    type: 'RZ'
  },
  {
    name: '支援突击：以戈止戈',
    type: 'LT'
  },
  {
    name: '登场技：清场时刻',
    type: 'LS'
  }
]
