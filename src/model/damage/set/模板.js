/**
 * @param {import('#interface').BuffManager} buffM
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

/** @type {import('#interface').buff[]} */
export const buffs = [
  {
    check: 2,
    type: ,
    value: 0,
    element: ,
    range: ['']
  },
  {
    check: 4,
    type: ,
    value: 0,
    element: ,
    range: ['']
  }
]