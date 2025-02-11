/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '暴击伤害',
    value: [0.5, 0.575, 0.65, 0.725, 0.8],
    isForever: true
  },
  {
    type: '无视抗性',
    value: [0.125, 0.145, 0.165, 0.185, 0.2].map(v => v * 2),
    element: 'Fire',
    range: ['RL', 'RZ']
  }
]