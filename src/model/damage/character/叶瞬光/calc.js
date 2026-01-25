/** @type {import('#interface').CharCalcModel} */
export default {
  name: '默认',

  author: 'UCPr',

  buffs: [
    {
      name: '核心被动：照破无明',
      type: '暴击率',
      value: [0.15, 0.175, 0.2, 0.225, 0.25, 0.275, 0.3]
    },
    {
      name: '核心被动：照破无明',
      type: '增伤',
      value: [0.1, 0.125, 0.15, 0.175, 0.2, 0.225, 0.25]
    },
    {
      name: '核心被动：照破无明',
      type: '易伤',
      value: ({ avatar, calc }) =>
        Math.min(avatar.rank >= 4 ? 2 : 1.1, calc.get_StunVulnerabilityArea() - 1),
      exclude: ['CF', 'EQP'] // 非明心境状态不计入
    },
    {
      name: '1影',
      type: '增伤',
      value: 0.1,
    },
    {
      name: '1影',
      type: '无视防御',
      value: 0.2,
    },
    {
      name: '2影',
      type: '无视防御',
      value: 0.4,
      range: ['EQSF']
    },
    {
      name: '6影',
      type: '倍率',
      value: 15,
      include: ['EQSG', 'RZS']
    }
  ],

  skills: [
    { name: '强击', type: '强击' },
    { name: '普攻：明心境·分水行三段', type: 'ASF3' },
    { name: '普攻：明心境·斩流光二段', type: 'ASZ2' },
    { name: '普攻：明心境·斩流光 灭[无剑势]', type: 'ASMS' },
    { name: '普攻：明心境·斩流光 灭[有剑势]', type: 'ASMP' },
    { name: '普攻：明心境·斩流光 极', type: 'ASJ' },
    { name: '闪避反击：燕袭', type: 'CF' },
    // { name: '支援突击：止戈', type: 'LTP' },
    { name: '支援突击：明心境·抱一', type: 'LTS' },
    { name: '强E：定风波', type: 'EQP' },
    { name: '强E：明心境·飞光[6剑势]', type: 'EQSF6' },
    {
      name: '强E：明心境·归尘',
      type: 'EQSG'
    },
    // { name: '连携技：斩邪祟', type: 'RLP' },
    { name: '连携技：明心境·掣惊雷', type: 'RLS' },
    { name: '终结技：逐云惊霆', type: 'RZP' },
    {
      name: '终结技：斩妄开天',
      type: 'RZS',
      isMain: true
    },
  ]

}