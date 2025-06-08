// 函数导出：

/**
 * @param {import('../BuffManager.ts').BuffManager} buffM
 * @param {number} star 进阶星数
 */
// export function calc(buffM, star) {
//   buffM.new({
//     type: '暴击率',
//     value: [0.20, 0.23, 0.26, 0.29, 0.32][star - 1]
//   })
//   buffM.new({
//     type: '增伤',
//     value: [0.08, 0.092, 0.0104, 0.116, 0.128][star - 1] * 2,
//     element: 'Ether'
//   })
// }

// 直接导出：

/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
    {
      type: '暴击率',
      value: [0.20, 0.23, 0.26, 0.29, 0.32]
    },
    {
      type: '增伤',
      value: [0.08, 0.092, 0.0104, 0.116, 0.128].map(v => v * 2),
      element: 'Ether'
    }
  ]