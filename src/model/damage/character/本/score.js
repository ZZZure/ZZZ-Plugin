/** @type {import('#interface').scoreFunction} */
export default function (avatar) {
  const props = avatar.initial_properties
  // (暴击率 * 2 + 爆伤 >= 200%) 时转为主C流规则
  if (props.CRITRate * 2 + props.CRITDMG >= 2) {
    return [
      "你没戴安全帽！",
      {
        生命值百分比: 0,
        攻击力百分比: 0.75,
        防御力百分比: 0.5,
        冲击力: 0,
        暴击率: 1,
        暴击伤害: 1,
        穿透率: 1,
        穿透值: 0.25,
        能量自动回复: 0,
        异常精通: 0,
        异常掌控: 0,
        火属性伤害加成: 1,
      },
    ]
  }
}
