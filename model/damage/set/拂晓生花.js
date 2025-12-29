/** @type {import('#interface').buff[]} */
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
    check: ({ avatar, buffM, runtime }) =>
      buffM.setCount.拂晓生花 >= 4 && avatar.avatar_profession === runtime.professionEnum.强攻, // 仅强攻角色
    range: ['A']
  }
]