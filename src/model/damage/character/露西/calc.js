/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    name: '4影',
    type: '暴击伤害',
    teamTarget: ({ teammates }) => teammates, // 仅对队友生效
    value: 0.1
  },
  {
    name: '技能：加油！',
    type: '攻击力',
    teamTarget: true, // 全队生效
    showInPanel: true,
    value: ({ calc }) => {
      const ratio = calc.calc_value('E1')
      const fixed = calc.calc_value('E2')
      return Math.min(600, calc.initial_properties.ATK * ratio + fixed)
    }
  }
]

/** @type {import('#interface').skill['before']} */
const before = ({ calc, usefulBuffs, props }) => {
  const jiayou = usefulBuffs.find(buff => buff.name === '技能：加油！')
  const delta = calc.calc_value(jiayou?.value)
  const ratio = calc.calc_value('T')
  props.攻击力 = calc.get_ATK() + delta * (ratio - 1)
  usefulBuffs.splice(0, usefulBuffs.length)
}

/** @type {import('#interface').skill[]} */
export const skills = [
  { name: '灼烧', type: '灼烧' },
  { name: '普攻：淑女的球棍四段', type: 'AP4' },
  {
    name: '亲卫队小猪：抄家伙！(弹弓)',
    type: 'AZCD',
    element: 'Physical',
    props: {
      穿透值: 0,
      穿透率: 0
    },
    before
  },
  {
    name: '亲卫队小猪：回旋挥击！',
    type: 'AZH',
    element: 'Physical',
    props: {
      穿透值: 0,
      穿透率: 0
    },
    before
  },
  {
    name: '6影小猪空中落地爆炸',
    type: 'Y6',
    check: 6,
    multiplier: 3,
    props: {
      穿透值: 0,
      穿透率: 0
    },
    before
  },
  { name: '闪避反击：獠牙折转！', type: 'CF' },
  { name: '强化特殊技：全垒打短按', type: 'EQP' },
  { name: '强化特殊技：全垒打长按', isMain: true, type: 'EQX' },
  {
    name: '连携技：大满贯！',
    type: 'RL',
    after: ({ damage }) => damage.x(3)
  },
  {
    name: '终结技：再见全垒打！',
    type: 'RZ',
    after: ({ damage }) => damage.x(3)
  }
]