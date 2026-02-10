import type { ZZZAvatarInfo } from '#interface'
import type { Calculator, skill } from './Calculator.ts'

export enum rarityEnum { S, A, B }

export enum elementEnum {
  Physical = 200,
  Fire = 201,
  Ice = 202,
  Electric = 203,
  Ether = 205
}

export enum anomalyEnum {
  // 伤害异常
  强击, 灼烧, 碎冰, 感电, 侵蚀, 紊乱,
  // 状态异常（异常持续时间buff应作用于对应的状态异常）
  畏缩, 霜寒
}

/** 属性类型 */
export type element = keyof typeof elementEnum

/** 异常类型 */
export type anomaly = keyof typeof anomalyEnum

/** Buff来源 */
export type buffSource = '音擎' | '套装' | '技能' | '影画' | '核心被动' | '额外能力'

export enum buffTypeEnum {
  // 通用乘区
  攻击力, 倍率, 增伤, 易伤, 无视抗性, 无视防御, 穿透值, 穿透率, 失衡易伤,
  // 直伤乘区
  暴击率, 暴击伤害,
  // 异常乘区
  异常精通, 异常增伤, 异常暴击率, 异常暴击伤害, 异常持续时间,
  // 贯穿乘区
  贯穿力, 贯穿增伤,
  // 其他属性，一般不直接影响伤害，但可能用于buff是否生效判断/转模
  生命值, 防御力, 冲击力, 异常掌控
}

/** Buff增益类型 */
export type buffType = keyof typeof buffTypeEnum

export enum professionEnum {
  强攻 = 1, 击破, 异常, 支援, 防护, 命破
}

/** ID 2 EN */
export const elementType2element = (elementType: number) => elementEnum[elementType] as element

export const runtime = { elementType2element, rarityEnum, elementEnum, anomalyEnum, buffTypeEnum, professionEnum }

/** 提供部分运行时变量，简化操作 */
export type Runtime = typeof runtime

export type percentBase = 'base' | 'initial'

export interface buff {
  /** Buff状态，true生效，false无效 */
  status: boolean
  /** Buff名称 */
  name: string
  /** Buff来源 */
  source: buffSource
  /** Buff增益的类型 */
  type: buffType
  /**
   * Buff增益数值，可为数值、字符串、数组、函数
   * @number
   * - 此值即为提高值
   * - 当buff增益类型为**生命值/防御力/攻击力/冲击力/异常掌控**时，若此值 **<1**，则将此值默认理解为**基础属性**的**百分比提高**
   * @string
   * 角色自身的buff提高值可能随技能/天赋等级提高而提高，此时可以于data.json的"buff"中添加倍率数组（同上支持百分比提高），此时value即为键名，其首字母必须为对应技能的基类（参考技能类型命名标准）
   * @array
   * 根据buff.source自动选择对应等级/星级的值（同上支持百分比提高），支持的source：
   * - 音擎：音擎进阶星级
   * - 核心被动、额外能力：核心技等级
   * @function
   * 函数返回值即为提高值
   */
  value: number | string | number[] | (({ avatar, buffM, calc, runtime }: {
    avatar: ZZZAvatarInfo
    buffM: BuffManager
    calc: Calculator
    runtime: Runtime
  }) => number)
  /**
   * Buff增益数值上限
   * - 与buff.value的类型和用法一致
   * - 用于简化value上限处理和进行buff上限计算
   * - 开启`showInPanel`时建议显式设置该值，如无上限可填写`Infinity`
   */
  max?: buff['value']
  /** 决定当value和max表示百分比时，基于何种属性进行百分比计算 @default 'base' */
  percentBase?: percentBase
  /**
   * Buff增益技能类型**生效范围**；参考技能类型命名标准
   * - 当技能参数不存在**redirect**时，**range**作用范围向后覆盖生效
   * - 当技能参数存在**redirect**时，**range**与**type**全匹配时生效，**redirect**向后覆盖生效
   * - 若需全匹配的精细操作，可使用**include**与**exclude**参数
   */
  range?: string[] | anomaly[] | "追加攻击"[]
  /**
   * Buff增益技能类型**生效技能**
   * - 不同于**range**，仅全匹配type时该值生效，不会向后覆盖生效
   * - 无**range**且无**include**则该buff对**exclude**以外的全部技能生效
   * - **range**与**include**符合其一则认为buff生效
   * - 当技能参数存在**redirect**时，**range**与**include**的区别在于**include**不会尝试匹配**redirect**
   */
  include?: string[]
  /**
   * Buff增益技能类型**排除技能**
   * - 与**include**相同，仅全匹配type时该值生效，不会向后覆盖生效
   * - 优先级高于**range**与**include**
   */
  exclude?: string[]
  /** Buff增益属性类型，无则对全部生效 */
  element?: element | element[]
  /**
   * 检查buff是否生效
   * @function
   * 音擎会自动添加职业检查
   * @number
   * - buff.source为**套装**时，判断套装数量>=该值
   * - buff.source为**影画**时，判断影画数量>=该值
   */
  check?: (({ avatar, buffM, calc, teammates, runtime }: {
    avatar: ZZZAvatarInfo
    buffM: BuffManager
    calc: Calculator
    teammates?: ZZZAvatarInfo[]
    runtime: Runtime
  }) => boolean) | number
  /** 是否在面板中显示。用于在面板的伤害统计中显示角色的buff增益值 @default false */
  showInPanel?: boolean
  /**
   * 判断在团队中增益哪些角色
   * @boolean `true`对全队生效 `false`仅对自身生效
   * @funtion
   * - 返回`true`则为团队增益，返回`false`则仅对自身生效，返回角色数组则只对这些角色生效
   * - 计算单人伤害时，`teammates`为空数组
   * @default false
   */
  teamTarget?: boolean | (({ teammates, avatar, buffM, calc, runtime }: {
    /** 队友实例数组 */
    teammates: ZZZAvatarInfo[]
    avatar: ZZZAvatarInfo
    buffM: BuffManager
    calc: Calculator
    runtime: Runtime
  }) => boolean | ZZZAvatarInfo[])
  /** 同名同类效果是否可叠加。不可叠加时，取最大值 @default true */
  stackable?: boolean
}

type filterable = 'name' | 'element' | 'type' | 'range' | 'source'
let depth = 0, weakMapCheck = new WeakMap<buff, boolean>()
/**
 * Buff管理器
 * 用于管理角色局内Buff
 */
export class BuffManager {
  readonly avatar: ZZZAvatarInfo
  readonly buffs: buff[] = []
  /** 套装计数 */
  setCount: { [name: string]: number } = {}
  defaultBuff: Partial<buff> = {}

  constructor(avatar: ZZZAvatarInfo) {
    this.avatar = avatar
  }

  /** 注册并格式化buff */
  new(buff: buff): buff[]
  /** 注册并格式化buffs */
  new(buffs: buff[]): buff[]
  new(buff: buff | buff[]) {
    if (Array.isArray(buff)) {
      buff.forEach(b => this.new(b))
      return this.buffs
    }
    // 简化参数
    if (!buff.name && (buff.source || this.defaultBuff.source) === '套装' && this.defaultBuff.name && typeof buff.check === 'number')
      buff.name = this.defaultBuff.name + buff.check
    const oriBuff = buff
    // @ts-expect-error
    buff = { status: true, ...this.defaultBuff, ...buff }
    if (buff.range && !Array.isArray(buff.range))
      buff.range = oriBuff.range = [buff.range]
    if (!buff.source) {
      if (buff.name.includes('核心') || buff.name.includes('天赋')) buff.source = oriBuff.source = '核心被动'
      else if (buff.name.includes('额外能力')) buff.source = oriBuff.source = '额外能力'
      else if (/^\d影/.test(buff.name)) buff.source = oriBuff.source = '影画'
      else if (buff.name.includes('技')) buff.source = oriBuff.source = '技能'
    }
    for (const key of ['name', 'value', 'source'] as const) {
      if (!buff[key]) return logger.warn(`无效buff：缺少${key}字段`, buff)
    }
    if (buffTypeEnum[buffTypeEnum[buff.type]] !== buff.type)
      return logger.warn(`无效buff：非法type字段`, buff)
    // 音擎buff职业检查
    if (buff.source === '音擎') {
      const professionCheck = (avatar: ZZZAvatarInfo) => {
        const weapon_profession = avatar.weapon?.profession
        if (!weapon_profession) return true
        return avatar.avatar_profession === weapon_profession
      }
      const oriCheck = typeof buff.check === 'function' && buff.check
      buff.check = ({ avatar, buffM, calc, runtime }) => professionCheck(avatar) && (!oriCheck || oriCheck({ avatar, buffM, calc, runtime }))
      // 影画buff影画数检查
    } else if (buff.source === '影画' && !buff.check) {
      buff.check = oriBuff.check = +buff.name[0]
    }
    this.buffs.push(buff)
    return this.buffs
  }

  _filter<T extends filterable>(buffs: buff[], type: T, value: buff[T]): buff[]
  _filter(buffs: buff[], obj: Partial<Pick<buff, filterable>> & { element: element, redirect?: skill['redirect'] }, calc?: Calculator): buff[]
  _filter(buffs: buff[], fnc: (buff: buff, index: number) => boolean): buff[]
  _filter<T extends filterable>(
    buffs: buff[],
    param:
      | T
      | (Partial<Pick<buff, filterable>> & { element: element, redirect?: skill['redirect'] })
      | ((buff: buff, index: number) => boolean),
    valueOcalc?: buff[T] | Calculator
  ) {
    depth++
    try {
      if (typeof param === 'string') {
        buffs = buffs.filter(buff => buff[param] === valueOcalc)
      } else if (typeof param === 'object') {
        buffs = buffs.filter(buff => {
          if (buff.status === false) return false
          const judge = (() => {
            // 未传入calc时不判断range、include、exclude
            if (typeof valueOcalc !== 'object' || Array.isArray(valueOcalc)) return true
            // buff指定排除该技能
            if (buff.exclude && buff.exclude.includes(valueOcalc.skill.type)) return false
            // 11 10 01
            if (buff.range || buff.include) {
              // 11 01 存在include且满足时则直接返回true
              if (buff.include && buff.include.includes(valueOcalc.skill.type)) return true
              // 01 没有range则代表只有include，直接返回false
              if (!buff.range) return false
              // 11 10 直接返回range的结果即可
              const buffRange = buff.range
              const skillRange = param.range?.filter(r => typeof r === 'string')
              if (!skillRange?.length) return true // 对任意类型生效
              // buff作用范围向后覆盖生效
              // 存在重定向时，range与type全匹配时生效，redirect向后覆盖生效
              else if (param.redirect) {
                if (skillRange.some(ST => buffRange.some(BT => BT === ST))) return true
                const redirect = Array.isArray(param.redirect) ? param.redirect : [param.redirect]
                if (buffRange.some(BT => redirect.some(RT => RT.startsWith(BT)))) return true
                return false
              }
              // 不存在重定向时，range向后覆盖生效
              return skillRange.some(ST => buffRange.some(BT => ST.startsWith(BT)))
            }
            // 00
            return true
          })()
          if (!judge) return false
          for (const key in param) {
            if (key === 'redirect' || key === 'range') continue
            if (key === 'element') {
              if (!buff.element || !param.element) continue // 对任意属性生效
              if (Array.isArray(buff.element)) {
                if (buff.element.includes(param.element)) continue
                return false
              }
            }
            // @ts-expect-error
            if (buff[key] !== param[key]) return false
          }
          if (buff.check) {
            if (typeof buff.check === 'number') {
              if (buff.source === '套装' && (this.setCount[buff.name.replace(/\d$/, '')] < buff.check)) return false
              else if (buff.source === '影画' && (this.avatar.rank < buff.check)) return false
            } else if (valueOcalc) {
              if (weakMapCheck.has(buff)) {
                // console.log(`depth：${depth} ${buff.name}：${weakMapCheck.get(buff)}`)
                if (!weakMapCheck.get(buff)) return false
              } else {
                weakMapCheck.set(buff, false)
                if (!buff.check({
                  avatar: this.avatar,
                  buffM: this,
                  calc: valueOcalc as Calculator,
                  runtime
                })) return false
                weakMapCheck.set(buff, true)
              }
            } else {
              logger.debug('未传入calc：' + buff.name)
              return false
            }
          }
          if (buff.teamTarget) {
            if (typeof buff.teamTarget === 'function') {
              const result = buff.teamTarget({ teammates: [], avatar: this.avatar, buffM: this, calc: valueOcalc as Calculator, runtime })
              if (Array.isArray(result)) return result.includes(this.avatar)
              return result
            }
            return buff.teamTarget
          }
          return true
        })
      } else {
        buffs = buffs.filter(param)
      }
    } catch (e) {
      logger.error(e)
    }
    if (--depth === 0) {
      // console.log('重置weakMapCheck')
      weakMapCheck = new WeakMap()
    }
    return buffs
  }

  /**
   * 根据单个指定属性筛选buff，不作进一步判断
   */
  filter<T extends filterable>(type: T, value: buff[T]): buff[]
  /**
   * 根据多个指定属性筛选 **启用状态** 的buff
   * - 对伤害类型range数组的筛选，只要其中有一个符合即认为满足
   * - 不存在重定向时，range向后覆盖生效
   * - 存在重定向时，range与type全匹配时生效，redirect向后覆盖生效
   */
  filter(obj: Partial<Pick<buff, filterable>> & { element: element, redirect?: skill['redirect'] }, calc?: Calculator): buff[]
  /**
   * 根据指定函数筛选buff
   */
  filter(fnc: (buff: buff, index: number) => boolean): buff[]
  filter<T extends filterable>(
    param:
      | T
      | (Partial<Pick<buff, filterable>> & { element: element, redirect?: skill['redirect'] })
      | ((buff: buff, index: number) => boolean),
    valueOcalc?: buff[T] | Calculator
  ) {
    // @ts-expect-error
    return this._filter(this.buffs, param, valueOcalc)
  }

  /** 遍历buff列表 */
  forEach(fnc: (buff: buff, index: number) => void) {
    return this.buffs.forEach(fnc)
  }

  /** 查找指定buff */
  find<T extends keyof buff>(type: T, value: buff[T]) {
    return this.buffs.find(buff => buff[type] === value)
  }

  operator(buff: Partial<buff>, fnc: (buff: buff) => void): void
  operator<T extends keyof buff>(key: T, value: buff[T], fnc: (buff: buff) => void): void
  operator<T extends keyof buff>(key: T | Partial<buff>, value: buff[T] | ((buff: buff) => void), fnc?: (buff: buff) => void) {
    const isMatch = typeof key === 'object' ?
      (targetBuff: buff) => Object.entries(key).every(([k, v]) => targetBuff[k as keyof buff] === v) :
      (targetBuff: buff) => targetBuff[key] === value
    this.forEach(buff => isMatch(buff) && (fnc || value as (buff: buff) => void)(buff))
  }

  /** 关闭符合条件的所有buff */
  close(buff: Partial<buff>): void
  close<T extends keyof buff>(key: T, value: buff[T]): void
  close<T extends keyof buff>(key: T | Partial<buff>, value?: buff[T] | Partial<buff>) {
    if (typeof key === 'object')
      this.operator(key, buff => buff.status = false)
    else
      this.operator(key, value as buff[T], buff => buff.status = false)
  }

  /** 开启符合条件的所有buff */
  open(buff: Partial<buff>): void
  open<T extends keyof buff>(key: T, value: buff[T]): void
  open<T extends keyof buff>(key: T, value?: buff[T]) {
    if (typeof key === 'object')
      this.operator(key, buff => buff.status = true)
    else
      this.operator(key, value as buff[T], buff => buff.status = true)
  }

  /**
   * 设置后续新增buff参数的默认值
   * @param obj 直接覆盖默认值
   */
  default(obj: Partial<buff>): void
  /**
   * 设置后续新增buff参数的默认值
   * @param value 为undefined时删除默认值
   */
  default<T extends keyof buff>(key: T, value?: buff[T]): void
  default<T extends keyof buff>(param: T | Partial<buff>, value?: buff[T]): void {
    if (typeof param === 'object') {
      this.defaultBuff = param
    } else {
      if (value === undefined) delete this.defaultBuff[param]
      else this.defaultBuff[param] = value
    }
  }

}