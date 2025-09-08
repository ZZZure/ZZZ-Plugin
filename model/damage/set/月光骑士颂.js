/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '增伤',
    value: 0.18,
    check: ({ avatar, buffM }) => buffM.setCount.月光骑士颂 >= 4 && avatar.avatar_profession === 4, // 仅支援角色
    is: { team: true }
  }
]