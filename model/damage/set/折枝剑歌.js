// 函数导出：

/**
 * @param {import('../BuffManager.ts').BuffManager} buffM
 * @param {number} count 套装数量
 */
// export function calc(buffM, count) {
//   const name = buffM.defaultBuff.name
//   switch (true) {
//     case (count >= 4):
//       buffM.new({
//         name: name + '4',
//         type: '暴击伤害',
//         value: 0.3,
//         isForever: true,
//         check: ({ buffM, calc }) => calc.get_AnomalyMastery() >= 115
//       })
//       buffM.new({
//         name: name + '4',
//         type: '暴击率',
//         value: 0.12
//       })
//   }
// }

// 直接导出：

/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    name: '折枝剑歌4',
    type: '暴击伤害',
    value: 0.3,
    isForever: true,
    check: ({ buffM, calc }) => buffM.setCount.折枝剑歌 >= 4 && calc.get_AnomalyMastery() >= 115
  },
  {
    type: '暴击率',
    value: 0.12,
    check: 4
  }
]