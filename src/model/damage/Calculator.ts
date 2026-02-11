import type { BuffManager, Runtime, anomaly, buff, buffType, element } from './BuffManager.ts'
import type { ZZZAvatarInfo } from '../avatar.js'
import { runtime, elementType2element, anomalyEnum } from './BuffManager.js'
import { getMapData } from '../../utils/file.js'
import { property } from '../../lib/convert.js'
import { charData } from './avatar.js'
import _ from 'lodash'

/** 技能类型 */
export interface skill {
  /** 技能名，唯一 */
  name: string
  /** 技能类型，唯一 @see [技能命名标准](https://github.com/ZZZure/ZZZ-Plugin/blob/dev/src/model/damage/README.md#技能类型命名标准) */
  type: string
  /** 属性类型，不指定时，默认取角色属性 */
  element: element
  /**
   * 指定技能倍率（基础倍率，可吃倍率增益）
   * @default number[] 默认于character/角色名/data.json中自动获取
   * @number
   * 此值即为倍率
   * @string
   * 技能类型（type）。等效于调用`calc.get_SkillMultiplier(skill.multiplier)`
   * @array
   * - 倍率值数组，根据技能等级获取值，索引为 **`技能等级-1`**
   * - 默认于character/角色名/data.json中自动获取，显式指定时以此值为准
   * @function
   * 函数返回值即为倍率
   */
  multiplier?: number | string | number[] | (({ avatar, buffM, calc, runtime }: {
    avatar: ZZZAvatarInfo
    buffM: BuffManager
    calc: Calculator
    runtime: Runtime
  }) => number)
  /** 指定局内固定属性 */
  props?: { [key in buffType]?: number }
  /**
   * 重定向技能伤害类型
   *
   * 当出现“X"(造成的伤害)被视为“Y”(伤害)时，可使用该参数指定Y的类型。
   * - 不存在重定向时，range向后覆盖生效
   * - 存在重定向时，range与type全匹配时生效，redirect向后覆盖生效
   *
   * 当为数组类型时（多类型共存），满足数组内其一类型即可，判断规则同上
   */
  redirect?: string | string[] | anomaly[] | "追加攻击"[]
  /** 是否为主要技能。`true`时%XX伤害 默认计算该技能且会作为角色伤害排名依据 */
  isMain?: boolean
  /** 角色面板伤害统计中是否隐藏显示 */
  isHide?: boolean
  /** 是否为异常伤害。自动判断 */
  isAnomalyDMG?: boolean
  /** 是否为贯穿伤害。自动判断 */
  isSheerDMG?: boolean
  /** 禁用伤害计算cache */
  banCache?: boolean
  /** 是否计算该技能 */
  check?: (({ avatar, buffM, calc, runtime }: {
    avatar: ZZZAvatarInfo
    buffM: BuffManager
    calc: Calculator
    runtime: Runtime
  }) => boolean)
  /** 自定义计算逻辑 */
  dmg?: (calc: Calculator) => damage
  /**
   * 伤害计算前调用，可自由定义各属性等
   * 此操作只作用于当前技能
   */
  before?: ({ avatar, calc, usefulBuffs, skill, props, areas, runtime }: {
    avatar: ZZZAvatarInfo
    calc: Calculator
    usefulBuffs: buff[]
    /** 技能自身 */
    skill: skill
    /** 属性数据。设置后不会更改 */
    props: damage['props']
    /** 乘区数据。设置后不会更改 */
    areas: damage['areas']
    runtime: Runtime
  }) => void
  /** 伤害计算后调用，可对结果进行修改等 */
  after?: ({ avatar, calc, usefulBuffs, skill, damage, runtime }: {
    avatar: ZZZAvatarInfo
    calc: Calculator
    usefulBuffs: buff[]
    /** 技能自身 */
    skill: skill
    damage: damage
    runtime: Runtime
  }) => void
}

export interface damage {
  /** 技能类型 */
  skill: skill
  /** 有益Buffs */
  usefulBuffs: buff[]
  /** 技能属性 */
  props?: skill['props']
  /** 各乘区数据 */
  areas: {
    /** 基础伤害区 */
    BasicArea: number
    /** 暴击区期望 */
    CriticalArea: number
    /** 增伤区 */
    BoostArea: number
    /** 易伤区 */
    VulnerabilityArea: number
    /** 抗性区 */
    ResistanceArea: number
    /** 防御区 */
    DefenceArea: number
    /** 失衡易伤区 */
    StunVulnerabilityArea: number
    /** 异常精通区 */
    AnomalyProficiencyArea: number
    /** 异常增伤区 */
    AnomalyBoostArea: number
    /** 等级区 */
    LevelArea: number
    /** 贯穿增伤区 */
    SheerBoostArea: number
  }
  /** 伤害结果 */
  result: {
    /** 暴击伤害 */
    critDMG: number
    /** 期望伤害 */
    expectDMG: number
  }
  fnc: (fnc: (n: number) => number) => void
  x: (n: number) => void
  add: (damage: string | damage) => void
  del: (damage: string | damage) => void
}

const subBaseValueData = {
  "生命值百分比": [0.03, '3.0%'],
  "生命值": [112, '112'],
  "攻击力百分比": [0.03, '3.0%'],
  "攻击力": [19, '19'],
  "防御力百分比": [0.048, '4.8%'],
  "防御力": [15, '15'],
  "暴击率": [0.024, '2.4%'],
  "暴击伤害": [0.048, '4.8%'],
  "穿透值": [9, '9'],
  "异常精通": [9, '9']
} as const

type subStatKeys = keyof typeof subBaseValueData

const mainBaseValueData = {
  "生命值百分比": [0.3, '30%'],
  "攻击力百分比": [0.3, '30%'],
  "防御力百分比": [0.48, '48%'],
  "暴击率": [0.24, '24%'],
  "暴击伤害": [0.48, '48%'],
  "异常精通": [92, '92'],
  "穿透率": [0.24, '24%'],
  "物理属性伤害加成": [0.3, '30%'],
  "火属性伤害加成": [0.3, '30%'],
  "冰属性伤害加成": [0.3, '30%'],
  "电属性伤害加成": [0.3, '30%'],
  "以太属性伤害加成": [0.3, '30%'],
  "异常掌控": [0.3, '30%'],
  "冲击力": [0.18, '18%'],
  "能量自动回复": [0.6, '60%']
} as const

type mainStatKeys = keyof typeof mainBaseValueData

const AnomalyData = getMapData('AnomalyData') as {
  name: string,
  element: element,
  element_type: number,
  sub_element_type: number,
  duration: number,
  interval: number,
  multiplier: number,
  discover?: {
    multiplier: number,
    fixed_multiplier: number
  }
}[]

interface enemy {
  /** 等级 */
  level: number
  /** 1级基础防御力 */
  basicDEF: number
  /** 抗性区常量 */
  resistance: number
}

const ratioAble = new Set<buffType>(['生命值', '防御力', '攻击力', '冲击力', '异常掌控'])

export class Calculator {
  readonly buffM: BuffManager
  readonly avatar: ZZZAvatarInfo
  readonly skills: skill[] = []
  /** 对当前所计算的技能有用的buff、计算后的buff */
  private readonly usefulBuffResults: Map<buff, buff & { value: number }> = new Map()
  /** 技能伤害缓存 */
  private cache: { [type: string]: damage } = Object.create(null)
  /** 角色属性缓存 */
  private props: NonNullable<damage['props']> = {}
  /** 当前正在计算的技能 */
  skill: skill
  defaultSkill: { [key in keyof skill]?: skill[key] } = {}
  enemy: enemy

  constructor(buffM: BuffManager) {
    this.buffM = buffM
    this.avatar = this.buffM.avatar
    this.enemy = {
      level: this.avatar.level,
      basicDEF: 50,
      resistance: -0.2
    }
  }

  get base_properties() {
    return this.avatar.base_properties
  }

  get initial_properties() {
    return this.avatar.initial_properties
  }

  /** 定义敌方属性 */
  defEnemy<T extends keyof enemy>(key: T, value: enemy[T]): void
  defEnemy(enemy: enemy): void
  defEnemy<T extends keyof enemy>(param: T | enemy, value?: enemy[T]) {
    if (typeof param === 'string' && value !== undefined) {
      this.enemy[param] = value
    } else if (typeof param === 'object') {
      _.merge(this.enemy, param)
    }
  }

  /** 注册并格式化skill */
  new(skill: skill): skill[]
  /** 注册并格式化skills */
  new(skills: skill[]): skill[]
  new(skill: skill | skill[]) {
    if (Array.isArray(skill)) {
      skill.forEach(s => this.new(s))
      return this.skills
    }
    const oriSkill = skill
    skill = { ...this.defaultSkill, ...skill }
    if (!skill.element) skill.element = oriSkill.element = elementType2element(this.avatar.element_type)
    for (const key of ['name', 'type'] as const) {
      if (!skill[key]) return logger.warn(`无效skill：缺少${key}字段`, skill)
    }
    if (skill.check && +skill.check) {
      const num = skill.check as unknown as number
      skill.check = oriSkill.check = ({ avatar }) => avatar.rank >= num
    }
    skill.isAnomalyDMG ??= oriSkill.isAnomalyDMG = typeof anomalyEnum[skill.type.slice(0, 2) as anomaly] === 'number'
    skill.isSheerDMG ??= oriSkill.isSheerDMG = this.avatar.avatar_profession === runtime.professionEnum.命破 && elementType2element(this.avatar.element_type) === skill.element && !skill.isAnomalyDMG
    this.skills.push(skill)
    return this.skills
  }

  /** 查找指定已注册技能 */
  find_skill<T extends keyof skill>(key: T, value: skill[T]) {
    return this.skills.find(skill => skill[key] === value)
  }

  /**
   * 计算已注册的技能伤害
   * @param type 技能类型名
   */
  calc_skill(type: skill['type']): damage
  /**
   * 计算技能伤害
   * @param skill 技能
   */
  calc_skill(skill: skill): damage
  calc_skill(skill: skill['type'] | skill) {
    if (typeof skill === 'string') {
      const MySkill = this.find_skill('type', skill)
      if (!MySkill) return
      return this.calc_skill(MySkill)
    }
    this.skill = skill
    if (!skill.banCache && this.cache[skill.type]) return this.cache[skill.type]
    if (skill.check && !skill.check({ avatar: this.avatar, buffM: this.buffM, calc: this, runtime })) return
    logger.debug(`${logger.green(skill.type)}${skill.name}伤害计算：`)
    if (skill.dmg) {
      const dmg = skill.dmg(this)
      if (!dmg.skill || dmg.skill.name !== skill.name) {
        dmg.skill = skill
      }
      logger.debug('自定义计算最终伤害：', dmg.result)
      this.usefulBuffResults.clear()
      return dmg
    }
    const props = this.props = skill.props || {}
    // 缩小筛选范围
    const usefulBuffs = this.buffM.filter({
      element: skill.element,
      range: [skill.type],
      redirect: skill.redirect
    }, this)
    const areas = {} as damage['areas']
    if (skill.before) skill.before({ avatar: this.avatar, calc: this, usefulBuffs, skill, props, areas, runtime })
    logger.debug(`有效buff*${usefulBuffs.length}/${this.buffM.buffs.length}`)
    const { isAnomalyDMG = false, isSheerDMG = false } = skill

    // 基础伤害区
    if (!areas.BasicArea) {
      let Multiplier = props.倍率
      if (!Multiplier) {
        if (skill.multiplier) { // 显式指定
          switch (typeof skill.multiplier) {
            case 'number':
              Multiplier = skill.multiplier
              break
            case 'string':
              Multiplier = this.get_SkillMultiplier(skill.multiplier)
              break
            case 'object':
              Multiplier = skill.multiplier[this.get_SkillLevel(skill.type[0]) - 1]
              break
            case 'function':
              Multiplier = skill.multiplier({ avatar: this.avatar, buffM: this.buffM, calc: this, runtime })
              break
            default:
              Multiplier = this.get_SkillMultiplier(skill.type)
              logger.warn('无效的技能倍率：', skill)
          }
        } else if (isAnomalyDMG) {
          Multiplier = (
            skill.type.startsWith('紊乱') ?
              this.get_DiscoverMultiplier(skill) :
              this.get_AnomalyMultiplier(skill, usefulBuffs, skill.name.includes('每') ? 1 : 0)
          ) || 0
        } else {
          Multiplier = this.get_SkillMultiplier(skill.type)
        }
        const ExtraMultiplier = this.get_ExtraMultiplier(skill, usefulBuffs)
        Multiplier += ExtraMultiplier
        if (!Multiplier) {
          this.usefulBuffResults.clear()
          return logger.warn('技能倍率缺失：', skill)
        }
        if (ExtraMultiplier) logger.debug(`最终倍率：${Multiplier}`)
      }
      props.倍率 = Multiplier
      if (isSheerDMG) {
        areas.BasicArea = this.get_SheerForce(skill, usefulBuffs) * Multiplier
      } else {
        areas.BasicArea = this.get_ATK(skill, usefulBuffs) * Multiplier
      }
    }
    logger.debug(`基础伤害区：${areas.BasicArea}`)
    // 暴击区
    let CRITRate = 0, CRITDMG = 0
    if (!areas.CriticalArea) {
      if (isAnomalyDMG) {
        if (!skill.type.startsWith('紊乱')) { // 紊乱暂无异常暴击区
          CRITRate = this.get_AnomalyCRITRate(skill, usefulBuffs)
          CRITDMG = this.get_AnomalyCRITDMG(skill, usefulBuffs)
        }
      } else {
        CRITRate = this.get_CRITRate(skill, usefulBuffs)
        CRITDMG = this.get_CRITDMG(skill, usefulBuffs)
      }
      areas.CriticalArea = 1 + CRITRate * CRITDMG
    }
    areas.CriticalArea !== 1 && logger.debug(`暴击期望：${areas.CriticalArea}`)
    // 通用乘区
    areas.BoostArea ??= this.get_BoostArea(skill, usefulBuffs)
    areas.VulnerabilityArea ??= this.get_VulnerabilityArea(skill, usefulBuffs)
    areas.ResistanceArea ??= this.get_ResistanceArea(skill, usefulBuffs)
    areas.DefenceArea ??= isSheerDMG ? 1 : this.get_DefenceArea(skill, usefulBuffs)
    areas.StunVulnerabilityArea ??= this.get_StunVulnerabilityArea(skill, usefulBuffs)
    // 异常乘区
    if (isAnomalyDMG) {
      areas.AnomalyProficiencyArea ??= this.get_AnomalyProficiencyArea(skill, usefulBuffs)
      areas.AnomalyBoostArea ??= this.get_AnomalyBoostArea(skill, usefulBuffs)
      areas.LevelArea ??= this.get_LevelArea()
    }
    // 贯穿乘区
    if (isSheerDMG) {
      areas.SheerBoostArea ??= this.get_SheerBoostArea(skill, usefulBuffs)
    }

    const {
      BasicArea, CriticalArea, BoostArea, VulnerabilityArea, ResistanceArea, DefenceArea,
      AnomalyProficiencyArea, LevelArea, AnomalyBoostArea, StunVulnerabilityArea, SheerBoostArea = 1
    } = areas
    const commonArea = BasicArea * BoostArea * VulnerabilityArea * ResistanceArea * DefenceArea * StunVulnerabilityArea
    const result: damage['result'] = isAnomalyDMG ?
      {
        critDMG: (CriticalArea !== 1) ? commonArea * (CRITDMG + 1) * AnomalyProficiencyArea * LevelArea * AnomalyBoostArea : 0,
        expectDMG: commonArea * CriticalArea * AnomalyProficiencyArea * LevelArea * AnomalyBoostArea
      } : {
        critDMG: commonArea * (CRITDMG + 1) * SheerBoostArea,
        expectDMG: commonArea * CriticalArea * SheerBoostArea
      }
    const damageHandler = {
      fnc: (fnc: (value: number) => number) => {
        damage.result.critDMG = fnc(damage.result.critDMG)
        damage.result.expectDMG = fnc(damage.result.expectDMG)
      },
      x: (n: number) => {
        logger.debug('伤害系数：' + n)
        damage.fnc(v => v * n)
      },
      add: (d: string | damage) => {
        if (typeof d === 'string') d = this.calc_skill(d)
        if (!d) return
        logger.debug('增加伤害：' + d.skill.name, d.result)
        damage.result.expectDMG += d.result.expectDMG
        damage.result.critDMG += d.result.critDMG || d.result.expectDMG
      },
      del: (d: string | damage) => {
        if (typeof d === 'string') d = this.calc_skill(d)
        if (!d) return
        logger.debug('减少伤害：' + d.skill.name, d.result)
        damage.result.expectDMG -= d.result.expectDMG
        damage.result.critDMG -= d.result.critDMG || d.result.expectDMG
      }
    }
    const damage = new Proxy({
      skill,
      usefulBuffs: _.sortBy(Array.from(this.usefulBuffResults.values()), ['type', 'value']).reverse(),
      props,
      areas,
      result
    }, {
      get: (target, prop: string) => {
        if (prop in damageHandler) {
          return damageHandler[prop as keyof typeof damageHandler]
        }
        return target[prop as Exclude<keyof damage, keyof typeof damageHandler>]
      }
    }) as damage
    if (skill.after) {
      skill.after({ avatar: this.avatar, calc: this, usefulBuffs, skill, damage, runtime })
    }
    logger.debug('最终伤害：', result)
    if (!skill.banCache) this.cache[skill.type] = damage
    this.usefulBuffResults.clear()
    // console.log(damage)
    return damage
  }

  calc_showInPanel_buffs() {
    return this.buffM.buffs
      .filter(buff => buff.showInPanel)
      .map(buff => {
        try {
          const value = this.calc_final_value(buff)
          // 计算buff最大值
          let max = 0
          // 已指定max，直接获取
          if (buff.max) {
            if (buff.max === Infinity) {
              max = 0
            } else {
              max = this.calc_final_value({
                ...buff,
                value: buff.max,
                max: undefined
              })
            }
          } else {
            // 未指定max，自动计算理论最大值
            const { _base_properties, _initial_properties } = this.avatar
            // @ts-expect-error
            this.avatar._base_properties = this.avatar._initial_properties = new Proxy({}, {
              get: (target, prop) => {
                // logger.debug(`计算buff理论最大值，访问属性：${String(prop)}`)
                return Number.MAX_SAFE_INTEGER
              }
            })
            try {
              this.props = {}
              max = this.calc_final_value(buff)
            } catch { }
            this.avatar._base_properties = _base_properties
            this.avatar._initial_properties = _initial_properties
          }
          if (max === Infinity || !max || max > 9999) {
            max = 0
          }
          return { ...buff, value, max }
        } catch (e) {
          logger.error('buff计算错误：', buff, e)
          return
        }
      })
      .filter(v => v && v.value) as (buff & {
        value: number
        max: number
      })[]
  }

  calc() {
    return this.skills.map(skill => {
      try {
        return this.calc_skill(skill)
      } catch (e) {
        logger.error('伤害计算错误：', e)
        return
      }
    }).filter(v => v && v.result?.expectDMG && !v.skill?.isHide) as damage[]
  }

  /**
   * 计算副词条伤害差异
   * @param types 需进行比较的词条数组
   */
  calc_sub_differences(skill?: skill['type'] | skill, types?: subStatKeys[]) {
    // 未指定types时，筛选评分权重大于0的词条进行差异计算
    if (!types || !types.length) {
      types = Object.entries(this.avatar.scoreWeight)
        .reduce((acc: { type: subStatKeys, weight: number }[], [id, weight]) => {
          if (weight > 0) {
            const type = property.idToName(id) as subStatKeys
            if (type && subBaseValueData[type]) {
              acc.push({ type, weight })
            }
          }
          return acc
        }, [])
        .sort((a, b) => b.weight - a.weight) // 按权重从大到小排序
        .slice(0, 6) // 默认最多6个
        .map(({ type }) => type)
    }
    const base: { [type: string]: number } = {}
    types.forEach(t => base[t] = t.includes('百分比') ? this.base_properties[property.nameZHToNameEN(t.replace('百分比', '')) as keyof ZZZAvatarInfo['base_properties']] * subBaseValueData[t][0] : subBaseValueData[t][0])
    logger.debug(logger.red('副词条差异计算变化值：'), base)
    const buffs: {
      name: subStatKeys
      shortName: string
      type: buff['type']
      value: number
      valueBase: typeof subBaseValueData[subStatKeys][1]
    }[] = types.map(t => ({
      name: t,
      shortName: property.nameToShortName3(t),
      type: t.replace('百分比', '') as buff['type'],
      value: base[t],
      valueBase: subBaseValueData[t][1]
    }))
    buffs.push({
      // @ts-expect-error
      name: '空白对照',
      shortName: '对照组',
      // @ts-expect-error
      type: '',
      value: 0,
      // @ts-expect-error
      valueBase: '0'
    })
    // @ts-expect-error
    return this.calc_differences(buffs, skill)
  }

  /**
   * 计算主词条伤害差异
   * @param types 需进行比较的词条数组
   */
  calc_main_differences(skill?: skill['type'] | skill, types?: mainStatKeys[]) {
    // 未指定types时，筛选评分权重大于0的词条进行差异计算
    if (!types || !types.length) {
      types = Object.entries(this.avatar.scoreWeight)
        .reduce((acc: { type: mainStatKeys, weight: number }[], [id, weight]) => {
          if (weight > 0) {
            const type = property.idToName(id) as mainStatKeys
            if (type && mainBaseValueData[type]) {
              acc.push({ type, weight })
            }
          }
          return acc
        }, [])
        .sort((a, b) => b.weight - a.weight) // 按权重从大到小排序
        .slice(0, 8)
        .map(({ type }) => type)
    }
    const base: { [type: string]: number } = {}
    types.forEach(t => base[t] = (t.includes('百分比') || ['异常掌控', '冲击力', '能量自动回复'].includes(t)) ?
      this.base_properties[property.nameZHToNameEN(t.replace('百分比', '')) as keyof ZZZAvatarInfo['base_properties']] * mainBaseValueData[t][0] :
      mainBaseValueData[t][0])
    logger.debug(logger.red('主词条差异计算变化值：'), base)
    const buffs: {
      name: mainStatKeys
      shortName: string
      type: buff['type']
      value: number
      element?: element
      valueBase: typeof mainBaseValueData[mainStatKeys][1]
    }[] = types.map(t => {
      const data: typeof buffs[number] = {
        name: t,
        shortName: property.nameToShortName3(t),
        type: (t.includes('属性伤害加成') ? '增伤' : t.replace('百分比', '')) as buff['type'],
        value: base[t],
        element: (t.includes('属性伤害加成') ? property.nameZHToNameEN(t).replace('DMGBonus', '') : '') as element,
        valueBase: mainBaseValueData[t][1]
      }
      if (!data.element) delete data.element
      return data
    })
    buffs.push({
      // @ts-expect-error
      name: '空白对照',
      shortName: '对照组',
      // @ts-expect-error
      type: '',
      value: 0,
      // @ts-expect-error
      valueBase: '0'
    })
    const equips = this.avatar.equip?.reduce((acc: string[], e) => {
      if (e.equipment_type < 4) return acc
      const name = e.main_properties[0]?.property_name
      if (name) acc.push(name)
      return acc
    }, ['空白对照']) || []
    // @ts-expect-error 只保留装备的主词条del
    const main_differences = this.calc_differences(buffs, skill)
    return main_differences.filter(v => {
      const name1 = v[0].del.name!.replace('百分比', '')
      const name2 = name1.replace('属性', '')
      return equips.some(e => e === name1 || e === name2)
    })
  }

  /**
   * 计算已注册技能差异
   * - 以buff形式两两组合进行差异计算
   * @param buffs 需要进行两两组合差异计算的buffs
   * @returns 差异计算结果。`buffs.length * buffs.length`的2维数组
   */
  calc_differences<B extends Partial<buff>>(
    buffs: B[],
    skill: skill['type']
  ): { add: B, del: B, damage: damage, difference: number }[][]
  /**
   * 计算给定技能差异
   * @param buffs 需要进行两两组合差异计算的buffs
   * @returns 差异计算结果。`buffs.length * buffs.length`的2维数组
   */
  calc_differences<B extends Partial<buff>>(
    buffs: B[],
    skill?: skill
  ): { add: B, del: B, damage: damage, difference: number }[][]
  calc_differences<B extends buff>(
    buffs: B[],
    skill?: skill['type'] | skill
  ): { add: B, del: B, damage: damage, difference: number }[][] {
    if (!skill) {
      skill = this.find_skill('isMain', true) // 主技能
        || this.calc().sort((a, b) => b.result.expectDMG - a.result.expectDMG)[0]?.skill // 伤害最高技能
    } else if (typeof skill === 'string') {
      const MySkill = this.find_skill('type', skill)
      if (!MySkill) return []
      return this.calc_differences(buffs, MySkill)
    }
    const oriDamage = this.calc_skill(skill)
    this.cache = Object.create(null)
    const result: { del: B, add: B, damage: damage, difference: number }[][] = []
    for (const i_del in buffs) {
      result[i_del] = []
      const buff_del = buffs[i_del]
      const { name: name_del = buff_del.type, value: value_del } = buff_del
      logger.debug(logger.blue(`差异计算：${name_del}`))
      this.buffM.buffs.push({
        ...buff_del,
        name: logger.green(`差异计算：${name_del}`),
        value: ({ calc }) => -calc.calc_value(value_del) // 转为负值
      })
      for (const i_add in buffs) {
        const buff_add = buffs[i_add]
        buff_add.name ??= buff_add.type
        const data = result[i_del][i_add] = {
          add: buff_add,
          del: buff_del,
          damage: oriDamage,
          difference: 0
        }
        const { name: name_add = buff_add.type } = buff_add
        if (name_del === name_add) continue
        logger.debug(logger.yellow(`差异计算：${name_del}->${name_add}`))
        this.buffM.buffs.push({
          ...buff_add,
          name: logger.green(`差异计算：${name_del}->${name_add}`)
        })
        const newDamage = this.calc_skill(skill)
        this.buffM.buffs.pop()
        this.cache = Object.create(null)
        data.damage = newDamage
        data.difference = newDamage.result.expectDMG - oriDamage.result.expectDMG
        logger.debug(logger.magenta(`差异计算：${name_del}->${name_add} 伤害变化：${data.difference}`))
      }
      this.buffM.buffs.pop()
    }
    return result
  }

  /**
   * 设置后续新增buff参数的默认值
   * @param obj 直接覆盖默认值
   */
  default(obj: { [key in keyof skill]?: skill[key] }): void
  /**
   * 设置后续新增技能参数的默认值
   * @param value 为undefined时删除默认值
   */
  default<T extends keyof skill>(type: T, value?: skill[T]): void
  default<T extends keyof skill>(param: T | { [key in keyof skill]?: skill[key] }, value?: skill[T]): void {
    if (typeof param === 'object') {
      this.defaultSkill = param
    } else {
      if (value === undefined) delete this.defaultSkill[param]
      else this.defaultSkill[param] = value
    }
  }

  /**
   * 获取技能等级
   * @param baseType 技能基类 'A', 'E', 'C', 'R', 'T', 'L'
   * @see [技能命名标准](https://github.com/ZZZure/ZZZ-Plugin/blob/dev/src/model/damage/README.md#技能类型命名标准)
   */
  get_SkillLevel(baseType: string) {
    const id = ['A', 'E', 'C', 'R', , 'T', 'L'].indexOf(baseType)
    if (id === -1) return 1
    return Number(this.avatar.skills.find(({ skill_type }) => skill_type === id)?.level || 1)
  }

  /**
   * 获取技能倍率
   * @param type 参见技能命名标准
   * @see [技能命名标准](https://github.com/ZZZure/ZZZ-Plugin/blob/dev/src/model/damage/README.md#技能类型命名标准)
   */
  get_SkillMultiplier(type: string) {
    const SkillLevel = this.get_SkillLevel(type[0])
    logger.debug(`${type[0]}等级：${SkillLevel}`)
    const Multiplier = charData[this.avatar.id].skill[type]?.[SkillLevel - 1]
    logger.debug(`技能倍率：${Multiplier}`)
    return Multiplier
  }

  /** 获取角色自身`出伤异常`的异常数据 */
  get_AnomalyData(): typeof AnomalyData[number]
  /** 获取角色自身`指定异常`的异常数据 */
  get_AnomalyData(anomaly: anomaly): typeof AnomalyData[number]
  get_AnomalyData(anomaly?: anomaly) {
    if (!anomaly) {
      return AnomalyData.find(({ element_type, sub_element_type, multiplier }) =>
        multiplier &&
        element_type === this.avatar.element_type &&
        sub_element_type === this.avatar.sub_element_type
      )
    }
    let a = AnomalyData.filter(({ element_type }) => element_type === this.avatar.element_type)
    if (anomaly === '紊乱') a = a.filter(({ discover }) => discover)
    else a = a.filter(({ name, multiplier }) => name === anomaly && multiplier)
    if (a.length === 1) return a[0]
    a = a.filter(({ sub_element_type }) => sub_element_type === this.avatar.sub_element_type)
    return a[0]
  }

  /** 获取属性异常倍率 */
  get_AnomalyMultiplier(skill: skill, usefulBuffs: buff[], times = 0) {
    const anomalyData = this.get_AnomalyData(skill?.type.slice(0, 2) as anomaly)
    if (!anomalyData) return
    // 未指定触发次数时，自动计算最大触发次数
    if (!times && anomalyData.duration && anomalyData.interval) {
      const AnomalyDuration = this.get_AnomalyDuration(skill, usefulBuffs, anomalyData.duration)
      times = Math.floor((AnomalyDuration * 10) / (anomalyData.interval * 10))
    }
    const Multiplier = anomalyData.multiplier * (times || 1)
    logger.debug(`倍率：${Multiplier}`)
    return Multiplier
  }

  /** 获取紊乱倍率 */
  get_DiscoverMultiplier(skill: skill) {
    const anomalyData = this.get_AnomalyData(skill?.type.slice(0, 2) as anomaly)
    if (!anomalyData) return
    const AnomalyDuration = this.get_AnomalyDuration({
      ...skill,
      name: anomalyData.name,
      type: anomalyData.name
    }, this.buffM.buffs, anomalyData.duration)
    const times = Math.floor((AnomalyDuration * 10) / (anomalyData.interval * 10))
    const discover = anomalyData.discover!
    const Multiplier = discover.fixed_multiplier + times * discover.multiplier
    logger.debug(`${anomalyData.name}紊乱倍率：${Multiplier}`)
    return Multiplier
  }

  /** 计算buff增益值（可能为百分比） */
  calc_value(value: buff['value'], buff?: buff) {
    switch (typeof value) {
      case 'number': return value
      case 'function': {
        if (buff) buff.status = false
        const v = +value({ avatar: this.avatar, buffM: this.buffM, calc: this, runtime }) || 0
        if (buff) buff.status = true
        return v
      }
      case 'string': return charData[this.avatar.id].buff?.[value]?.[this.get_SkillLevel(value[0]) - 1] || 0
      case 'object': {
        if (!Array.isArray(value) || !buff) return 0
        switch (buff.source) {
          case '音擎': return this.avatar.weapon ? value[this.avatar.weapon.star - 1] || 0 : 0
          case '核心被动':
          case '额外能力': return value[this.get_SkillLevel('T') - 1] || 0
        }
      }
      default: return 0
    }
  }

  /**
   * 计算buff增益最终值
   * - `buff.value`为数值/字符串/数组类型且计算结果绝对值<1时按 **`初始数值`** 百分比提高处理
   * @param buff 待计算buff
   * @param initial 指定初始数值，若不指定则根据角色初始属性和buff类型自动获取
   */
  calc_final_value(buff: buff): number {
    let initial: number | undefined
    const _calc_final_value = (buff: buff) => {
      const { value } = buff
      const add = this.calc_value(value, buff)
      if (!add || !ratioAble.has(buff.type) || Math.abs(add) >= 1) return add
      if (!(typeof value === 'number' || typeof value === 'string' || Array.isArray(value))) return add
      if (!initial) {
        if (buff.percentBase === 'initial') {
          initial = this.initial_properties[property.nameZHToNameEN(buff.type) as keyof ZZZAvatarInfo['initial_properties']] || 0
        } else {
          initial = this.base_properties[property.nameZHToNameEN(buff.type) as keyof ZZZAvatarInfo['base_properties']] || 0
        }
      }
      if (!initial) return add
      return add * initial
    }
    const value = _calc_final_value(buff)
    if (!value || !buff.max) return value
    const max = _calc_final_value({ ...buff, value: buff.max })
    return Math.min(value, max)
  }

  /**
   * 获取局内属性原始值
   */
  get(type: buff['type'], initial: number, skill: skill = this.skill, usefulBuffs: buff[] = this.buffM.buffs): number {
    const nonStackableBuffRecord = new Map<string, buff>()
    return this.props[type] ??= this.buffM._filter(usefulBuffs, {
      element: skill?.element,
      range: [skill?.type],
      redirect: skill?.redirect,
      type
    }, this).reduce((previousValue, buff) => {
      // 计算最终增益值
      const add = this.calc_final_value(buff)
      // 检查不可叠加buff
      if (buff.stackable === false) {
        const recorded = nonStackableBuffRecord.get(buff.name)
        if (recorded) {
          const recordedValue = this.usefulBuffResults.get(recorded)!.value
          if (Math.abs(recordedValue) >= Math.abs(add)) {
            logger.debug(`\tBuff：${buff.name}已存在，且数值相同/更高，不计入结果`)
            return previousValue
          }
          logger.debug(`\tBuff：${buff.name}已存在，且数值更低，替换为更高数值`)
          previousValue -= recordedValue
          this.usefulBuffResults.delete(recorded)
        }
        nonStackableBuffRecord.set(buff.name, buff)
      }
      if (!this.usefulBuffResults.has(buff))
        this.usefulBuffResults.set(buff, { ...buff, value: add })
      logger.debug(`\tBuff：${buff.name}对${(buff.include ? (buff.range ? [buff.range, buff.include] : buff.include) : buff.range) || '全类型'}增加${add}${buff.element || ''}${type}`)
      return previousValue + add
    }, initial)
  }

  /** 攻击力 */
  get_ATK(skill?: skill, usefulBuffs?: buff[]) {
    let ATK = this.get('攻击力', this.initial_properties.ATK, skill, usefulBuffs)
    ATK = this.min_max(0, 10000, ATK)
    logger.debug(`攻击力：${ATK}`)
    return ATK
  }

  /** 额外倍率 */
  get_ExtraMultiplier(skill?: skill, usefulBuffs?: buff[]) {
    const ExtraMultiplier = this.get('倍率', 0, skill, usefulBuffs)
    ExtraMultiplier && logger.debug(`额外倍率：${ExtraMultiplier}`)
    return ExtraMultiplier
  }

  /** 暴击率 */
  get_CRITRate(skill?: skill, usefulBuffs?: buff[]) {
    let CRITRate = this.get('暴击率', this.initial_properties.CRITRate, skill, usefulBuffs)
    CRITRate = this.min_max(0, 1, CRITRate)
    logger.debug(`暴击率：${CRITRate}`)
    return CRITRate
  }

  /** 暴击伤害 */
  get_CRITDMG(skill?: skill, usefulBuffs?: buff[]) {
    let CRITDMG = this.get('暴击伤害', this.initial_properties.CRITDMG, skill, usefulBuffs)
    CRITDMG = this.min_max(0, 5, CRITDMG)
    logger.debug(`暴击伤害：${CRITDMG}`)
    return CRITDMG
  }

  /** 增伤区 */
  get_BoostArea(skill?: skill, usefulBuffs?: buff[]) {
    let BoostArea = this.get('增伤', 1, skill, usefulBuffs)
    BoostArea = this.min_max(0, 6, BoostArea)
    logger.debug(`增伤区：${BoostArea}`)
    return BoostArea
  }

  /** (减)易伤区 */
  get_VulnerabilityArea(skill?: skill, usefulBuffs?: buff[]) {
    let VulnerabilityArea = this.get('易伤', 1, skill, usefulBuffs)
    VulnerabilityArea = this.min_max(0.2, 2, VulnerabilityArea)
    logger.debug(`易伤区：${VulnerabilityArea}`)
    return VulnerabilityArea
  }

  /** 失衡易伤区 */
  get_StunVulnerabilityArea(skill?: skill, usefulBuffs?: buff[]) {
    let StunVulnerabilityArea = this.get('失衡易伤', 1, skill, usefulBuffs)
    StunVulnerabilityArea = this.min_max(0.2, 5, StunVulnerabilityArea)
    StunVulnerabilityArea !== 1 && logger.debug(`失衡易伤区：${StunVulnerabilityArea}`)
    return StunVulnerabilityArea
  }

  /** 抗性区 */
  get_ResistanceArea(skill?: skill, usefulBuffs?: buff[]) {
    let ResistanceArea = this.get('无视抗性', 1 - this.enemy.resistance, skill, usefulBuffs)
    ResistanceArea = this.min_max(0, 2, ResistanceArea)
    logger.debug(`抗性区：${ResistanceArea}`)
    return ResistanceArea
  }

  /** 无视防御 */
  get_IgnoreDEF(skill?: skill, usefulBuffs?: buff[]) {
    const IgnoreDEF = this.get('无视防御', 0, skill, usefulBuffs)
    IgnoreDEF && logger.debug(`无视防御：${IgnoreDEF}`)
    return IgnoreDEF
  }

  /** 穿透值 */
  get_Pen(skill?: skill, usefulBuffs?: buff[]) {
    let Pen = this.get('穿透值', this.initial_properties.Pen, skill, usefulBuffs)
    Pen = Math.min(Pen, 1000)
    Pen && logger.debug(`穿透值：${Pen}`)
    return Pen
  }

  /** 穿透率 */
  get_PenRatio(skill?: skill, usefulBuffs?: buff[]) {
    let PenRatio = this.get('穿透率', this.initial_properties.PenRatio, skill, usefulBuffs)
    PenRatio = Math.min(PenRatio, 2)
    PenRatio && logger.debug(`穿透率：${PenRatio}`)
    return PenRatio
  }

  /** 防御区 */
  get_DefenceArea(skill?: skill, usefulBuffs?: buff[]) {
    const get_base = (level: number) => Math.floor(0.1551 * Math.min(60, level) ** 2 + 3.141 * Math.min(60, level) + 47.2039)
    /** 等级基数 */
    const base = get_base(this.avatar.level)
    /** 基础防御 */
    const DEF = this.enemy.basicDEF / 50 * get_base(this.enemy.level)
    const IgnoreDEF = this.get_IgnoreDEF(skill, usefulBuffs)
    const Pen = this.get_Pen(skill, usefulBuffs)
    const PenRatio = this.get_PenRatio(skill, usefulBuffs)
    /** 防御 */
    const defence = DEF * (1 - IgnoreDEF)
    /** 有效防御 */
    const effective_defence = Math.max(0, defence * (1 - PenRatio) - Pen)
    const DefenceArea = this.min_max(0, 1, base / (effective_defence + base))
    logger.debug(`防御区：${DefenceArea}`)
    return DefenceArea
  }

  /** 等级区 */
  get_LevelArea(level = this.avatar.level) {
    const LevelArea = +(1 + 1 / 59 * (level - 1)).toFixed(4)
    logger.debug(`等级区：${LevelArea}`)
    return LevelArea
  }

  /** 异常精通 */
  get_AnomalyProficiency(skill?: skill, usefulBuffs?: buff[]) {
    const AnomalyProficiency = this.get('异常精通', this.initial_properties.AnomalyProficiency, skill, usefulBuffs)
    logger.debug(`异常精通：${AnomalyProficiency}`)
    return AnomalyProficiency
  }

  /** 异常掌控 */
  get_AnomalyMastery(skill?: skill, usefulBuffs?: buff[]) {
    let AnomalyMastery = this.get('异常掌控', this.initial_properties.AnomalyMastery, skill, usefulBuffs)
    AnomalyMastery = this.min_max(0, 1000, AnomalyMastery)
    logger.debug(`异常掌控：${AnomalyMastery}`)
    return AnomalyMastery
  }

  /** 异常精通区 */
  get_AnomalyProficiencyArea(skill?: skill, usefulBuffs?: buff[]) {
    const AnomalyProficiency = this.get_AnomalyProficiency(skill, usefulBuffs)
    const AnomalyProficiencyArea = this.min_max(0, 10, AnomalyProficiency / 100)
    logger.debug(`异常精通区：${AnomalyProficiencyArea}`)
    return AnomalyProficiencyArea
  }

  /** 异常增伤区 */
  get_AnomalyBoostArea(skill?: skill, usefulBuffs?: buff[]) {
    let AnomalyBoostArea = this.get('异常增伤', 1, skill, usefulBuffs)
    AnomalyBoostArea = this.min_max(0, 3, AnomalyBoostArea)
    AnomalyBoostArea !== 1 && logger.debug(`异常增伤区：${AnomalyBoostArea}`)
    return AnomalyBoostArea
  }

  /** 异常暴击率 */
  get_AnomalyCRITRate(skill?: skill, usefulBuffs?: buff[]) {
    let AnomalyCRITRate = this.get('异常暴击率', 0, skill, usefulBuffs)
    AnomalyCRITRate = this.min_max(0, 1, AnomalyCRITRate)
    AnomalyCRITRate && logger.debug(`异常暴击率：${AnomalyCRITRate}`)
    return AnomalyCRITRate
  }

  /** 异常暴击伤害 */
  get_AnomalyCRITDMG(skill?: skill, usefulBuffs?: buff[]) {
    let AnomalyCRITDMG = this.get('异常暴击伤害', 0, skill, usefulBuffs)
    AnomalyCRITDMG = this.min_max(0, 5, AnomalyCRITDMG)
    AnomalyCRITDMG && logger.debug(`异常暴击伤害：${AnomalyCRITDMG}`)
    return AnomalyCRITDMG
  }

  /** 异常持续时间 */
  get_AnomalyDuration(skill?: skill, usefulBuffs?: buff[], duration: number = 0) {
    const AnomalyDuration = +this.get('异常持续时间', duration, skill, usefulBuffs).toFixed(1)
    logger.debug(`异常持续时间：${AnomalyDuration}`)
    return AnomalyDuration
  }

  /** 生命值 */
  get_HP(skill?: skill, usefulBuffs?: buff[]) {
    let HP = this.get('生命值', this.initial_properties.HP, skill, usefulBuffs)
    HP = this.min_max(0, 100000, HP)
    logger.debug(`生命值：${HP}`)
    return HP
  }

  /** 防御力 */
  get_DEF(skill?: skill, usefulBuffs?: buff[]) {
    let DEF = this.get('防御力', this.initial_properties.DEF, skill, usefulBuffs)
    DEF = this.min_max(0, 1000, DEF)
    logger.debug(`防御力：${DEF}`)
    return DEF
  }

  /** 冲击力 */
  get_Impact(skill?: skill, usefulBuffs?: buff[]) {
    let Impact = this.get('冲击力', this.initial_properties.Impact, skill, usefulBuffs)
    Impact = this.min_max(0, 1000, Impact)
    logger.debug(`冲击力：${Impact}`)
    return Impact
  }

  /** 贯穿力 */
  get_SheerForce(skill?: skill, usefulBuffs?: buff[]) {
    // 默认取 攻击力*0.3
    let SheerForce = Math.trunc(this.get_ATK(skill, usefulBuffs) * 0.3)
    SheerForce = this.get('贯穿力', SheerForce, skill, usefulBuffs)
    SheerForce = this.min_max(0, 10000, SheerForce)
    logger.debug(`贯穿力：${SheerForce}`)
    return SheerForce
  }

  /** 贯穿增伤区 */
  get_SheerBoostArea(skill?: skill, usefulBuffs?: buff[]) {
    let SheerBoostArea = this.get('贯穿增伤', 1, skill, usefulBuffs)
    SheerBoostArea = this.min_max(0.2, 9, SheerBoostArea)
    SheerBoostArea !== 1 && logger.debug(`贯穿增伤区：${SheerBoostArea}`)
    return SheerBoostArea
  }

  min_max(min: number, max: number, value: number) {
    return Math.min(Math.max(value, min), max)
  }

}