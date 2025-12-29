// 对自己和面板最强的强攻队友生效
const team = ({ teammates, avatar, runtime }) => {
  const strongest = teammates
    .filter(t => t.avatar_profession === runtime.professionEnum.强攻)
    .sort((a, b) => a.equip_score - b.equip_score)[0]
  return strongest ? [avatar, strongest] : [avatar]
}

/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    name: '1影',
    type: '暴击伤害',
    value: 0.3,
    range: ['AB']
  },
  {
    name: '2影',
    type: '无视防御',
    teamTarget: team,
    value: 0.2
  },
  {
    name: '2影',
    type: '增伤',
    value: 0.05 * 24,
    include: ['AZ']
  },
  {
    name: '4影',
    type: '增伤',
    value: 0.2,
    range: ['AZ']
  },
  {
    name: '6影',
    type: '暴击伤害',
    value: 0.5
  },
  {
    name: '核心被动：花链协议',
    type: '攻击力',
    teamTarget: team,
    value: 'T1'
  },
  {
    name: '核心被动：花链协议',
    type: '暴击伤害',
    teamTarget: team,
    value: 'T2'
  },
  {
    name: '核心被动：花链协议',
    type: '增伤',
    teamTarget: team,
    value: 'T3'
  },
  {
    name: '额外能力：奇兵轰临',
    type: '增伤',
    value: 0.3,
    range: ['AZ', 'AB', 'RZ']
  },
  {
    name: '额外能力：奇兵轰临',
    type: '无视抗性',
    value: 0.25,
    element: 'Electric',
    range: ['AZ', 'AB', 'RZ']
  }
]

/** @type {import('#interface').skill[]} */
export const skills = [
  { name: '感电每次', type: '感电' },
  { name: '普攻：霜蕊轮舞四段', type: 'AP4' },
  { name: '普攻：落华·重戮', type: 'AZ' },
  { name: '普攻：落华·崩坠一式', type: 'AB1' },
  { name: '普攻：落华·崩坠二式', type: 'AB2', isMain: true },
  { name: '闪避反击：裂萼纷华', type: 'CF' },
  { name: '支援突击：绯芯爆裂', type: 'LT' },
  { name: '长按强E：铁萼雨幕', type: 'EQX' },
  { name: '连携技：落霞风暴', type: 'RL' },
  { name: '终结技：机芯花园·绽放！', type: 'RZ' },
  {
    name: '6影普攻：落华·重戮额外激光',
    type: 'Y6',
    check: 6,
    multiplier: 1.65 * 3
  }
]