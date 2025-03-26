import type { Equip } from '../equip.js'
import { baseValueData, scoreData } from '../../lib/score.js'
import { idToName } from '../../lib/convert/property.js'
import { getMapData } from '../../utils/file.js'

enum rarity { S, A, B }

/** 主词条可能属性 */
const mainStats = getMapData('EquipMainStats') as { [partition: string]: number[] }
/** 副词条可能属性 */
const subStats = Object.keys(baseValueData).map(Number)

export default class Score {
  protected scoreData: typeof scoreData[string]
  protected equip: Equip
  /** 驱动盘n号位 */
  protected partition: number
  /** 用户主词条 */
  protected userMainStat: number
  constructor(charID: string, equip: Equip) {
    this.scoreData = scoreData[charID]
    this.equip = equip
    this.partition = this.equip.equipment_type
    this.userMainStat = this.equip.main_properties[0].property_id
  }

  /** 等级倍率 */
  get_level_multiplier() {
    return (0.25 + +this.equip.level * 0.05) || 1
  }

  /** 品质倍率 */
  get_rarity_multiplier() {
    switch (rarity[this.equip.rarity]) {
      case rarity.S:
        return 1
      case rarity.A:
        return 2 / 3
      case rarity.B:
        return 1 / 3
      default:
        return 1
    }
  }

  /** 理论最大词条数 */
  get_max_count() {
    /** 权重最大的4个副词条 */
    const subMaxStats = subStats
      .filter(p => p !== this.userMainStat && this.scoreData[p])
      .sort((a, b) => this.scoreData[b] - this.scoreData[a]).slice(0, 4)
    if (!subMaxStats.length) return 0
    logger.debug(`[${this.partition}号位]理论副词条：` + subMaxStats.map(idToName).reduce((a, p, i) => a + `${p}*${this.scoreData[subMaxStats[i]].toFixed(2)} `, ''))
    let count = this.scoreData[subMaxStats[0]] * 6 // 权重最大副词条强化五次
    subMaxStats.slice(1).forEach(p => count += this.scoreData[p] || 0) // 其他词条各计入一次
    logger.debug(`[${this.partition}号位]理论词条数：${logger.blue(count)}`)
    return count
  }

  /** 实际词条数 */
  get_actual_count() {
    let count = 0
    for (const prop of this.equip.properties) {
      const propID = prop.property_id
      const weight = this.scoreData[propID]
      if (weight) {
        logger.debug(`[${this.partition}号位]实际副词条：${idToName(propID)} ${logger.green(prop.count + 1)}*${weight}`)
        count += weight * (prop.count + 1)
      }
    }
    logger.debug(`[${this.partition}号位]实际词条数：${logger.blue(count)}`)
    return count
  }

  /** 计算驱动盘得分 */
  get_score() {
    const rarity_multiplier = this.get_rarity_multiplier()
    const actual_count = this.get_actual_count()
    if (actual_count === 0 && this.partition <= 3) {
      // 1…1个有效副词条都没有吗？真是拿你没办法呢~给点主词条的分吧~❤️杂鱼~❤️杂鱼~❤️
      return 12 * this.get_level_multiplier() * rarity_multiplier
    }
    const max_count = this.get_max_count()
    if (max_count === 0) return 0
    // 123号位
    if (this.partition <= 3) {
      const score = actual_count / max_count * rarity_multiplier * 55
      logger.debug(`[${this.partition}号位] ${logger.magenta(`${actual_count} / ${max_count} * ${rarity_multiplier} * 55 = ${score}`)}`)
      return score
    }
    // 456号位
    const mainMaxStat = mainStats[this.partition]
      .filter(p => this.scoreData[p])
      .sort((a, b) => this.scoreData[b] - this.scoreData[a])[0]
    const mainScore = (mainMaxStat ? 12 * (this.scoreData[this.userMainStat] || 0) / this.scoreData[mainMaxStat] : 12) * this.get_level_multiplier()
    const subScore = actual_count / max_count * 43
    const score = (mainScore + subScore) * rarity_multiplier
    logger.debug(`[${this.partition}号位] ${logger.magenta(`(${mainScore} + ${subScore}) * ${rarity_multiplier} = ${score}`)}`)
    return score
  }

  static main(charID: string, equip: Equip) {
    try {
      return new Score(charID, equip).get_score()
    } catch (err) {
      logger.error('角色驱动盘评分计算错误：', err)
      return 0
    }
  }

}
