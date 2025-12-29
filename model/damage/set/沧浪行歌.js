/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    check: 2,
    type: '增伤',
    value: 0.1,
    element: 'Physical',
  },
  {
    check: 4,
    type: '暴击率', // [以太帷幕]直接视为生效
    value: 0.1,
  },
  {
    check: ({ buffM, avatar, runtime }) =>
      buffM.setCount.沧浪行歌 >= 4 && avatar.avatar_profession === runtime.professionEnum.强攻,
    type: '暴击率',
    value: 0.1,
  },
  {
    check: ({ buffM, avatar, runtime }) =>
      buffM.setCount.沧浪行歌 >= 4 && avatar.avatar_profession === runtime.professionEnum.强攻,
    type: '攻击力',
    value: 0.1,
  }
]