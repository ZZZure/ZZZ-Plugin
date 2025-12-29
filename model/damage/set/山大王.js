/** @type {import('../interface.ts').buff[]} */
export const buffs = [
  {
    type: '暴击伤害',
    teamTarget: true,
    stackable: false,
    value: ({ calc }) => {
      if (calc.get_CRITRate() >= 0.5) {
        return 0.3
      }
      return 0.15
    },
    check: ({ buffM, avatar, runtime }) =>
      buffM.setCount.山大王 >= 4 && avatar.avatar_profession === runtime.professionEnum.击破
  }
]