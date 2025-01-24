/** @type {import('../../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '4影',
    type: '增伤',
    value: 0.3,
    range: ['EQG1']
  },
  {
    name: '额外能力：协议合同',
    type: '暴击率',
    value: 0.16
  }
]

/** @type {import('../../Calculator.ts').Calculator['skills']} */
export const skills = [
  { name: '普攻：对账三段', type: 'AP3', element: 'Physical' },
  { name: '闪避反击：清算', type: 'CF' },
  {
    name: '2影格挡反击额外伤害',
    type: 'Y2',
    check: ({ avatar }) => avatar.rank >= 2,
    isHide: true,
    before: ({ areas, calc }) => {
      areas.BasicArea = 3 * calc.get_DEF()
    }
  },
  { name: '强化E：到期还拳(格挡反击)', type: 'EQG1', after: ({ damage }) => damage.add('Y2') },
  { name: '强化E：到期还拳(格挡追击)', type: 'EQG2' },
  { name: '连携技：盖章，结算', type: 'RL' },
  { name: '终结技：拳债，全面清偿', type: 'RZ' }
]