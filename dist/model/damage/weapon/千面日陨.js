/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    type: '暴击伤害',
    value: [0.45, 0.5175, 0.585, 0.6525, 0.72]
  },
  {
    type: '无视防御',
    value: [0.25, 0.2875, 0.325, 0.3625, 0.4],
    element: 'Ice',
    range: ['EQ', 'RL', 'RZ'] // 仅持续3s，认为只作用于技能自身
  }
]