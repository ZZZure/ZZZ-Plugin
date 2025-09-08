/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: 0.15,
    check: 2,
    range: ['A']
  },
  {
    type: '增伤',
    value: 0.2,
    check: 4,
    range: ['A']
  },
  {
    type: '增伤',
    value: 0.2,
    check: ({ avatar, buffM }) => buffM.setCount.拂晓生花 >= 4 && avatar.avatar_profession === 1, // 仅强攻角色
    range: ['A']
  }
]