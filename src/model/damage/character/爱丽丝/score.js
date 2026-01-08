/** @type {import('#interface').scoreFunction} */
export default function (avatar) {
  const props = avatar.initial_properties
  // (暴击率 * 2 + 爆伤 >= 200%) 且 (异常精通 < 300) 时转为直伤流规则
  if (props.CRITRate * 2 + props.CRITDMG >= 2 && props.AnomalyProficiency < 300) {
    return ['直伤流', {
      "生命值百分比": 0,
      "攻击力百分比": 0.75,
      "防御力百分比": 0,
      "冲击力": 0,
      "暴击率": 1,
      "暴击伤害": 1,
      "穿透率": 1,
      "穿透值": 0.25,
      "能量自动回复": 0,
      "异常精通": 0.5,
      "异常掌控": 0,
      "物理属性伤害加成": 1
    }]
  }
}