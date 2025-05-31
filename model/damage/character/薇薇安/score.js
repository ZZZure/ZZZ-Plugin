/** @type {import('../../avatar.ts')['scoreFnc'][string]} */
export default function (avatar) {
  if (avatar.rank >= 4)
    return ['高影画', { "暴击伤害": 0.25 }]
}