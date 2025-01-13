/**
 * @param {import('../BuffManager.ts').BuffManager} buffM
 * @param {number} count 套装数量
 */
export function calc(buffM, count) {
  const name = buffM.defaultBuff.name
  switch (true) {
    case (count >= 4):
      buffM.new({
        name: name + '4',
        type: ,
        value: 0,
        element: ,
        range: ['']
      })
    case (count >= 2):
      buffM.new({
        name: name + '2',
        type: ,
        value: 0,
        element: ,
        range: ['']
      })
  }
}

/** @type {import('../BuffManager.ts').BuffManager['buffs']} */
export const buffs = [
  {
    type: ,
    value: 0,
    check: 2,
    element: ,
    range: ['']
  },
  {
    type: ,
    value: 0,
    check: 4,
    element: ,
    range: ['']
  }
]