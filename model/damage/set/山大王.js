/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: '暴击伤害',
    value: ({ calc }) => {
      if (calc.get_CRITRate() >= 0.5) {
        return 0.3
      }
      return 0.15
    },
    check: ({ buffM, avatar }) => buffM.setCount.山大王 >= 4 && avatar.avatar_profession === 2,
    is: {
      team: true,
      stack: false
    }
  }
]