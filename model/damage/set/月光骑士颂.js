/** @type {import('../interface.ts').buff[]} */
export const buffs = [
  {
    type: '增伤',
    value: 0.18,
    teamTarget: true,
    stackable: false,
    check: ({ avatar, buffM, runtime }) => buffM.setCount.月光骑士颂 >= 4 && avatar.avatar_profession === runtime.professionEnum.支援 // 仅支援角色
  }
]