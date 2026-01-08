/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    name: '6影',
    type: '暴击率',
    teamTarget: true,
    value: 0.015 * 10
  },
  {
    name: '核心被动：机关箱',
    type: '无视防御',
    teamTarget: true,
    value: 'T'
  },
  {
    name: '额外能力：狡兔三窟',
    type: '增伤',
    teamTarget: true,
    value: 0.25,
    element: 'Ether'
  }
]

/** @type {import('#interface').skill[]} */
export const skills = [
  { name: '侵蚀每次', type: '侵蚀' },
  { name: '闪避反击：牵制炮击', type: 'CF' },
  { name: '强化E：夹心糖衣炮弹炮击', type: 'EQP0', isHide: true },
  { name: '强化E：夹心糖衣炮弹(点按)', type: 'EQP', after: ({ damage }) => damage.add('EQP0') },
  { name: '连携技：高价以太爆弹炮击', type: 'RL0', isHide: true },
  { name: '连携技：高价以太爆弹', type: 'RL', after: ({ damage }) => damage.add('RL0') },
  { name: '终结技：特制以太榴弹炮击', type: 'RZ0', isHide: true },
  { name: '终结技：特制以太榴弹', type: 'RZ', after: ({ damage }) => damage.add('RZ0') },
]