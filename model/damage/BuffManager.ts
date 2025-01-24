import type { ZZZAvatarInfo } from '../avatar.js'
import type { Calculator, skill } from './Calculator.ts'
import _ from 'lodash'

export enum elementEnum {
  // 物理、火、冰、电、以太
  Physical, Fire, Ice, Electric, Ether
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

/**
 * Buff来源
 * @Weapon 武器
 * @Set 套装
 * @Rank 影画
 * @Talent 核心被动
 * @Addition 额外能力
 * @Skill 技能
 */
export type buffSource = 'Weapon' | 'Set' | 'Rank' | 'Talent' | 'Addition' | 'Skill'

export enum buffTypeEnum {
  // 通用乘区
  攻击力, 倍率, 增伤, 易伤, 无视抗性, 无视防御, 穿透值, 穿透率,
  // 直伤乘区
  暴击率, 暴击伤害,
  // 异常乘区
  异常精通, 异常增伤, 异常暴击率, 异常暴击伤害, 异常持续时间,
  // 其他属性，一般不直接影响伤害，但可能用于buff是否生效判断/转模
  生命值, 防御力, 冲击力, 异常掌控
}

/** Buff增益类型 */
export type buffType = keyof typeof buffTypeEnum

export interface buff {
  /** Buff状态，true生效，false无效 */
  status: boolean
  /** Buff是否常驻 */
  isForever: boolean
  /** Buff名称 */
  name: string
  /** Buff来源 */
  source: buffSource
  /** Buff增益的类型 */
  type: buffType
  /**
   * Buff增益数值，可为数值、数组、函数、字符串
   * @number
   * - 一般情况下此值即为提高值
   * - 当buff增益类型为**攻击力/冲击力/异常精通/异常掌控/防御力/生命值**时，若此值 **<1**，则将此值理解为**初始属性**的**百分比提高**
   * @array
   * 根据buff.source自动选择对应等级/星级的值（同上支持百分比提高），支持的source：
   * - Weapon：武器星级（进阶）
   * - Talent/Addition：天赋（核心技）等级
   * @function
   * 函数返回值则为提高值
   * @string
   * 角色自身的buff提高值可能随技能/天赋等级提高而提高，此时可以于data.json的"buff"中添加对应的倍率信息（同上支持百分比提高），此时value即为键名，其首字母必须为对应技能的基类（参考技能类型命名标准）
   */
  value: number | (({ avatar, buffM, calc }: {
    avatar: ZZZAvatarInfo
    buffM: BuffManager
    calc: Calculator
  }) => number) | string | number[]
  /** Buff增益技能类型范围，无则对全部生效；参考技能类型命名标准 */
  range?: string[] | anomaly[]
  /** Buff增益属性类型，无则对全部生效 */
  element?: element | element[]
  /** 
   * 检查buff是否生效
   * @function
   * 一般情况。武器会自动添加职业检查
   * @number
   * - buff.source为Set时，判断套装数量>=该值
   * - buff.source为Rank时，判断影画数量>=该值
   */
  check?: (({ avatar, buffM, calc }: {
    avatar: ZZZAvatarInfo
    buffM: BuffManager
    calc: Calculator
  }) => boolean) | number
}

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
  defaultBuff: { [key in keyof buff]?: buff[key] } = {}

  constructor(avatar: ZZZAvatarInfo) {
    this.avatar = avatar
  }

  /** 注册buff */
  new(buff: buff): buff[]
  /** 注册buffs */
  new(buffs: buff[]): buff[]
  new(buff: buff | buff[]) {
    if (Array.isArray(buff)) {
      buff.forEach(b => this.new(b))
      return this.buffs
    }
    // 简化参数
    if (!buff.name && (buff.source || this.defaultBuff.source) === 'Set' && this.defaultBuff.name && typeof buff.check === 'number')
      buff.name = this.defaultBuff.name + buff.check
    buff = _.merge({
      status: true,
      isForever: false,
      ...this.defaultBuff
    }, buff)
    if (!buff.source) {
      if (buff.name.includes('核心') || buff.name.includes('天赋')) buff.source = 'Talent'
      else if (buff.name.includes('额外能力')) buff.source = 'Addition'
      else if (buff.name.includes('影')) buff.source = 'Rank'
      else if (buff.name.includes('技')) buff.source = 'Skill'
    }
    if (!buff.name || !buff.value || !buff.source || !buffTypeEnum[buffTypeEnum[buff.type]])
      return logger.warn('无效buff：', buff)
    // 武器buff职业检查
    if (buff.source === 'Weapon') {
      const professionCheck = (avatar: ZZZAvatarInfo) => {
        const weapon_profession = avatar.weapon?.profession
        if (!weapon_profession) return true
        return avatar.avatar_profession === weapon_profession
      }
      const oriCheck = typeof buff.check === 'function' && buff.check
      buff.check = ({ avatar, buffM, calc }) => professionCheck(avatar) && (!oriCheck || oriCheck({ avatar, buffM, calc }))
    } else if (buff.source === 'Rank') {
      buff.check ??= +buff.name.match(/\d/)!?.[0]
    }
    this.buffs.push(buff)
    return this.buffs
  }

  _filter<T extends keyof buff>(buffs: buff[], type: T, value: buff[T]): buff[]
  _filter(buffs: buff[], obj: { [key in Exclude<keyof buff, 'status' | 'check' | 'element'>]?: buff[key] } & { element: element, redirect?: skill['type'] }, calc?: Calculator): buff[]
  _filter(buffs: buff[], fnc: (buff: buff, index: number) => boolean): buff[]
  _filter<T extends keyof buff>(
    buffs: buff[],
    param:
      | T
      | ({ [key in Exclude<keyof buff, 'status' | 'check' | 'element'>]?: buff[key] } & { element: element, redirect?: skill['type'] })
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
          for (const key in param) {
            if (key === 'redirect') continue
            if (key === 'range') {
              const buffRange = buff.range
              const skillRange = param.range?.filter(r => typeof r === 'string')
              if (!buffRange || !skillRange) continue // 对任意类型生效
              if (!skillRange.length) continue
              // buff作用范围向后覆盖
              // 存在重定向时，range须全匹配，redirect向后覆盖
              else if (param.redirect) {
                if (skillRange.some(ST => buffRange.some(BT => BT === ST))) continue
                if (buffRange.some(BT => param.redirect!.startsWith(BT))) continue
                return false
              }
              // 不存在重定向时，range向后覆盖
              else if (!skillRange.some(ST => buffRange.some(BT => ST.startsWith(BT)))) return false
              else continue
            } else if (key === 'element') {
              if (!buff.element || !param.element) continue // 对任意属性生效
              if (Array.isArray(buff.element)) {
                if (buff.element.includes(param.element)) continue
                return false
              }
            }
            // @ts-ignore
            if (buff[key] !== param[key]) return false
          }
          if (buff.check) {
            if (typeof buff.check === 'number') {
              if (buff.source === 'Set' && (this.setCount[buff.name.replace(/\d$/, '')] < buff.check)) return false
              else if (buff.source === 'Rank' && (this.avatar.rank < buff.check)) return false
            } else if (valueOcalc) {
              if (weakMapCheck.has(buff)) {
                // console.log(`depth：${depth} ${buff.name}：${weakMapCheck.get(buff)}`)
                if (!weakMapCheck.get(buff)) return false
              } else {
                weakMapCheck.set(buff, false)
                if (!buff.check({
                  avatar: this.avatar,
                  buffM: this,
                  calc: valueOcalc as Calculator
                })) return false
                weakMapCheck.set(buff, true)
              }
            } else {
              logger.debug('未传入calc：' + buff.name)
              return false
            }
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
  filter<T extends keyof buff>(type: T, value: buff[T]): buff[]
  /**
   * 根据多个指定属性筛选 **启用状态** 的buff
   * - 对伤害类型range数组的筛选，只要其中有一个符合即认为满足
   * - 存在重定向时，range须全匹配，redirect向后覆盖
   * - 不存在重定向时，range向后覆盖
   */
  filter(obj: { [key in Exclude<keyof buff, 'status' | 'check' | 'element'>]?: buff[key] } & { element: element, redirect?: skill['type'] }, calc?: Calculator): buff[]
  /**
   * 根据指定函数筛选buff
   */
  filter(fnc: (buff: buff, index: number) => boolean): buff[]
  filter<T extends keyof buff>(
    param:
      | T
      | ({ [key in Exclude<keyof buff, 'status' | 'check' | 'element'>]?: buff[key] } & { element: element, redirect?: skill['type'] })
      | ((buff: buff, index: number) => boolean),
    valueOcalc?: buff[T] | Calculator
  ) {
    // @ts-ignore
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

  operator<T extends keyof buff>(type: T, value: buff[T], fnc: (buff: buff) => void) {
    this.forEach(buff => {
      if (buff[type] === value) {
        fnc(buff)
      }
    })
  }

  /** 
   * 关闭符合条件的所有buff
   */
  close<T extends keyof buff>(type: T, value: buff[T]) {
    this.operator(type, value, buff => buff.status = false)
  }

  /**
   * 开启符合条件的所有buff
   */
  open<T extends keyof buff>(type: T, value: buff[T]) {
    this.operator(type, value, buff => buff.status = true)
  }

  /**
   * 设置后续新增buff参数的默认值
   * @param obj 直接覆盖默认值
   */
  default(obj: { [key in keyof buff]?: buff[key] }): void
  /**
   * 设置后续新增buff参数的默认值
   * @param value 为undefined时删除默认值
   */
  default<T extends keyof buff>(type: T, value?: buff[T]): void
  default<T extends keyof buff>(param: T | { [key in keyof buff]?: buff[key] }, value?: buff[T]): void {
    if (typeof param === 'object') {
      this.defaultBuff = param
    } else {
      if (value === undefined) delete this.defaultBuff[param]
      else this.defaultBuff[param] = value
    }
  }

}