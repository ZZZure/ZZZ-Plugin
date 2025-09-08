import type { ZZZAvatarInfo } from '../avatar.js'
import type { Equip } from '../equip.js'
import { baseValueData, formatScoreWeight } from '../../lib/score.js'
import { idToName } from '../../lib/convert/property.js'
import { aliasToID } from '../../lib/convert/char.js'
import { getMapData } from '../../utils/file.js'
import { scoreFnc } from './avatar.js'

enum rarity { S, A, B }

type Weight = { [propID: string]: number }

//@ts-expect-error
const equipScore = getMapData('EquipScore') as { [charID: string]: string[] | { rules?: string[], [propID: string]: number } }
for (const charName in equipScore) {
  const charID = +charName || aliasToID(charName)
  if (!charID) {
    logger.warn(`驱动盘评分：未找到角色${charName}的角色ID`)
    delete equipScore[charName]
    continue
  }
  equipScore[charID] = equipScore[charName]
  delete equipScore[charName]
}
/** 主词条可能属性 */
const mainStats = getMapData('EquipMainStats') as { [partition: string]: number[] }
/** 副词条可能属性 */
const subStats = Object.keys(baseValueData).map(Number)

export default class Score {
  protected equip: Equip
  /** 词条权重 */
  protected weight: Weight
  /** 驱动盘n号位 */
  protected partition: number
  /** 用户主词条 */
  protected userMainStat: number
  constructor(equip: Equip, weight: Weight) {
    this.equip = equip
    this.weight = weight
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
      .filter(p => p !== this.userMainStat && this.weight[p])
      .sort((a, b) => this.weight[b] - this.weight[a]).slice(0, 4)
    if (!subMaxStats.length) return 0
    logger.debug(`[${this.partition}号位]理论副词条：` + subMaxStats.map(idToName).reduce((a, p, i) => a + `${p}*${this.weight[subMaxStats[i]].toFixed(2)} `, ''))
    let count = this.weight[subMaxStats[0]] * 6 // 权重最大副词条强化五次
    subMaxStats.slice(1).forEach(p => count += this.weight[p] || 0) // 其他词条各计入一次
    logger.debug(`[${this.partition}号位]理论词条数：${logger.blue(count)}`)
    return count
  }

  /** 实际词条数 */
  get_actual_count() {
    let count = 0
    for (const prop of this.equip.properties) {
      const propID = prop.property_id
      const weight = this.weight[propID]
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
      .filter(p => this.weight[p])
      .sort((a, b) => this.weight[b] - this.weight[a])[0]
    const mainScore = (mainMaxStat ? 12 * (this.weight[this.userMainStat] || 0) / this.weight[mainMaxStat] : 12) * this.get_level_multiplier()
    const subScore = actual_count / max_count * 43
    const score = (mainScore + subScore) * rarity_multiplier
    logger.debug(`[${this.partition}号位] ${logger.magenta(`(${mainScore} + ${subScore}) * ${rarity_multiplier} = ${score}`)}`)
    return score
  }

  static main(equip: Equip, weight: Weight) {
    try {
      return new Score(equip, weight).get_score()
    } catch (err) {
      logger.error('角色驱动盘评分计算错误：', err)
      return 0
    }
  }

  static getFinalWeight(avatar: ZZZAvatarInfo): [name: string, Weight] {
    let def_weight = equipScore[avatar.id]
    // 无预设权重且无计算函数（新角色），选择相应基本规则
    if (!def_weight && !scoreFnc[avatar.id]) {
      switch (avatar.avatar_profession) {
        case 1: // 强攻
          def_weight = ['主C·双爆']
          break
        case 2: // 击破
          def_weight = ['冲击·双爆', '冲击·攻击']
          break
        case 3: // 异常
          def_weight = ['主C·异常', '辅助·异常']
          break
        case 4: // 支援
        case 5: // 防护
          def_weight = ['辅助·双爆', '辅助·异常']
          break
        case 6: // 命破
          def_weight = ['命破·双爆']
          break
      }
    }
    /** 选择第一个符合条件的规则，若皆不符合则选择第一个有效规则 */
    const delRules = (rules: string[]) => {
      if (rules.length === 1) {
        rule_name = rules[0]
        final_weight = predefinedWeights[rules[0]]?.value
      } else {
        for (const name of rules) {
          if (predefinedWeights[name]?.rule(avatar)) {
            rule_name = name
            final_weight = predefinedWeights[name].value
            break
          }
        }
        if (!final_weight) {
          for (const name of rules) {
            if (predefinedWeights[name]) {
              rule_name = name
              final_weight = predefinedWeights[name].value
              break
            }
          }
        }
      }
      final_weight = { ...final_weight }
    }
    let rule_name = '默认', final_weight: Weight | undefined
    if (Array.isArray(def_weight)) {
      delRules(def_weight)
    } else if (def_weight.rules) {
      const { rules, ...rest } = def_weight
      delRules(rules)
      if (Object.keys(rest).length) {
        rule_name += '·改'
        Object.assign(final_weight!, rest)
      }
    } else {
      final_weight = def_weight
    }
    // console.log(avatar.name_mi18n, 'default_final_weight', final_weight)
    final_weight = formatScoreWeight(final_weight, avatar.id)
    const calc_weight = scoreFnc[avatar.id] && scoreFnc[avatar.id](avatar)
    if (calc_weight) {
      rule_name = calc_weight[0]
      final_weight = { ...final_weight, ...formatScoreWeight(calc_weight[1], avatar.id) }
    }
    // 小生命、小攻击、小防御动态映射为大生命、大攻击、大防御相对于基础属性的等效权重
    for (const [small, big, name] of [[11103, 11102, 'HP'], [12103, 12102, 'ATK'], [13103, 13102, 'DEF']] as const) {
      if (final_weight[big]) {
        final_weight[small] ??= +(baseValueData[small] * 100 / (baseValueData[big] * avatar.base_properties[name]) * final_weight[big]).toFixed(2)
      }
    }
    // console.log(avatar.name_mi18n, rule_name, final_weight)
    return [rule_name, final_weight]
  }

}

/** 预定义权重规则 */
const predefinedWeights: Record<string, {
  rule: (avatar: ZZZAvatarInfo) => boolean,
  value: Record<string, number>
}> = {
  主C·双爆: {
    rule: (avatar) => {
      const { ATK, CRITRate, CRITDMG, AnomalyMastery, AnomalyProficiency } = avatar.initial_properties
      return ATK > 2400 && CRITRate * 2 + CRITDMG >= 2.2 && AnomalyMastery < 150 && AnomalyProficiency < 200
    },
    value: {
      "生命值百分比": 0,
      "攻击力百分比": 0.75,
      "防御力百分比": 0,
      "冲击力": 0,
      "暴击率": 1,
      "暴击伤害": 1,
      "穿透率": 1,
      "穿透值": 0.25,
      "能量自动回复": 0,
      "异常精通": 0,
      "异常掌控": 0,
      "属性伤害加成": 1
    }
  },
  主C·异常: {
    rule: (avatar) => {
      const { ATK, CRITRate, CRITDMG, AnomalyMastery, AnomalyProficiency } = avatar.initial_properties
      if (CRITRate * 2 + CRITDMG >= 2) return false
      if (ATK < 2400) return false
      if (AnomalyMastery >= 180 && AnomalyProficiency >= 200) return true
      if (AnomalyMastery >= 120 && AnomalyProficiency >= 300) return true
      if (AnomalyMastery >= 150 && AnomalyProficiency >= 250) return true
      return false
    },
    value: {
      "生命值百分比": 0,
      "攻击力百分比": 0.75,
      "防御力百分比": 0,
      "冲击力": 0,
      "暴击率": 0,
      "暴击伤害": 0,
      "穿透率": 1,
      "穿透值": 0.25,
      "能量自动回复": 0,
      "异常精通": 1,
      "异常掌控": 1,
      "属性伤害加成": 1
    }
  },
  命破·双爆: {
    rule: (avatar) => {
      return true
    },
    value: {
      "生命值百分比": 0,
      "攻击力百分比": 0.25,
      "防御力百分比": 0,
      "冲击力": 0,
      "暴击率": 1,
      "暴击伤害": 1,
      "穿透率": 0,
      "穿透值": 0,
      "能量自动回复": 0,
      "异常精通": 0,
      "异常掌控": 0,
      "属性伤害加成": 1
    }
  },
  辅助·双爆: {
    rule: (avatar) => {
      const { CRITRate, CRITDMG, AnomalyProficiency } = avatar.initial_properties
      return CRITRate * 2 + CRITDMG >= 1.5 && AnomalyProficiency < 200
    },
    value: {
      "生命值百分比": 0,
      "攻击力百分比": 0.75,
      "防御力百分比": 0,
      "冲击力": 0,
      "暴击率": 1,
      "暴击伤害": 1,
      "穿透率": 0.75,
      "穿透值": 0.25,
      "能量自动回复": 1,
      "异常精通": 0,
      "异常掌控": 0,
      "属性伤害加成": 1
    }
  },
  辅助·攻击: {
    rule: (avatar) => {
      const { CRITRate, CRITDMG } = avatar.initial_properties
      return CRITRate * 2 + CRITDMG >= 1.5
    },
    value: {
      "生命值百分比": 0,
      "攻击力百分比": 1,
      "防御力百分比": 0,
      "冲击力": 0,
      "暴击率": 1,
      "暴击伤害": 0.75,
      "穿透率": 0.75,
      "穿透值": 0.25,
      "能量自动回复": 1,
      "异常精通": 0,
      "异常掌控": 0,
      "属性伤害加成": 1
    }
  },
  辅助·异常: {
    rule: (avatar) => {
      const { CRITRate, CRITDMG, AnomalyProficiency } = avatar.initial_properties
      return CRITRate * 2 + CRITDMG < 2 && AnomalyProficiency >= 200
    },
    value: {
      "生命值百分比": 0,
      "攻击力百分比": 0.75,
      "防御力百分比": 0,
      "冲击力": 0,
      "暴击率": 0,
      "暴击伤害": 0,
      "穿透率": 0.75,
      "穿透值": 0.25,
      "能量自动回复": 1,
      "异常精通": 1,
      "异常掌控": 1,
      "属性伤害加成": 1
    }
  },
  冲击·双爆: {
    rule: (avatar) => {
      const { CRITRate, CRITDMG } = avatar.initial_properties
      return CRITRate * 2 + CRITDMG >= 1.5
    },
    value: {
      "生命值百分比": 0,
      "攻击力百分比": 0.75,
      "防御力百分比": 0,
      "冲击力": 1,
      "暴击率": 1,
      "暴击伤害": 1,
      "穿透率": 0.75,
      "穿透值": 0.25,
      "能量自动回复": 0,
      "异常精通": 0,
      "异常掌控": 0,
      "属性伤害加成": 1
    }
  },
  冲击·攻击: {
    rule: (avatar) => {
      const { ATK, CRITRate, CRITDMG } = avatar.initial_properties
      return ATK > 2000 && CRITRate * 2 + CRITDMG >= 1
    },
    value: {
      "生命值百分比": 0,
      "攻击力百分比": 1,
      "防御力百分比": 0,
      "冲击力": 1,
      "暴击率": 1,
      "暴击伤害": 0.75,
      "穿透率": 0.75,
      "穿透值": 0.25,
      "能量自动回复": 0,
      "异常精通": 0,
      "异常掌控": 0,
      "属性伤害加成": 1
    }
  },
}