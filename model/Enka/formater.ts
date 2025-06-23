import type { Mys, Enka, Map } from './interface.ts'
import { getMapData } from '../../utils/file.js'

type FilterValueType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
} & {}

type Values<T> = T extends Record<string, infer U> ? U : never

enum Rarity {
  S = 4,
  A = 3,
  B = 2
}

const WeaponId2Data = getMapData('WeaponId2Data') as Map.WeaponId2Data
const PartnerId2Data = getMapData('PartnerId2Data') as Map.PartnerId2Data
const EquipId2Data = getMapData('EquipId2Data') as Map.EquipId2Data
const SuitData = getMapData('SuitData') as Map.SuitData

const id2zh = {
  111: '生命值',
  121: '攻击力',
  122: '冲击力',
  131: '防御力',
  201: '暴击率',
  211: '暴击伤害',
  231: '穿透率',
  232: '穿透值',
  305: '能量自动回复',
  312: '异常精通',
  314: '异常掌控',
  315: '物理伤害加成',
  316: '火属性伤害加成',
  317: '冰属性伤害加成',
  318: '电属性伤害加成',
  319: '以太伤害加成'
} as const
const zh2id = Object.fromEntries(
  Object.entries(id2zh).map(([key, value]) => [value, +key])
) as Record<Zhs, number>

const id2en = {
  111: 'HpMax',
  121: 'Attack',
  122: 'BreakStun',
  131: 'Defence',
  201: 'Crit',
  211: 'CritDamage',
  231: 'PenRate',
  232: 'PenDelta',
  305: 'SpRecover',
  312: 'ElementMystery',
  314: 'ElementAbnormalPower',
  315: 'PhysDmgBonus',
  316: 'FireDmgBonus',
  317: 'IceDmgBonus',
  318: 'ThunderDmgBonus',
  319: 'EtherDmgBonus'
} as const
const en2id = Object.fromEntries(
  Object.entries(id2en).map(([key, value]) => [value, +key])
) as Record<Ens, number>

type Ids = keyof typeof id2zh
type IdsString = `${Ids}`
type Zhs = Values<typeof id2zh>
type Ens = Values<typeof id2en>

const percentPropId = [11102, 12102, 12202, 13102, 20103, 21103, 23103, 30502, 31402, 31503, 31603, 31703, 31803, 31903]
function get_base(propId: number, value: number) {
  if (percentPropId.includes(propId)) {
    const v = value / 100
    return v.toFixed(v % 1 === 0 ? 0 : 1) + '%'
  }
  return Math.trunc(value).toString()
}

export class Equip {
  readonly enkaEquip: Enka.Equip
  readonly Equipment: Enka.Equip['Equipment']
  readonly id: number
  readonly data: Map.EquipId2Data[string]
  readonly info: FilterValueType<Mys.Equip, string | number | boolean>
  readonly equip: Mys.Equip
  constructor(enkaEquip: Enka.Equip) {
    this.enkaEquip = enkaEquip
    this.Equipment = this.enkaEquip.Equipment
    this.id = this.Equipment.Id
    this.data = EquipId2Data[`${this.id.toString().slice(0, 3)}00`]
    if (!this.data) {
      throw new Error(`驱动盘数据缺失: ${this.id}`)
    }
    this.info = this.init()
    this.equip = this.info as Mys.Equip
  }

  static main(EquippedList: Enka.Avatar['EquippedList']) {
    const equips: Mys.Equip[] = []
    for (const equip of EquippedList) {
      if (equip.Equipment?.Id) {
        const e = new Equip(equip)
        equips.push(e.main())
      }
    }
    // 统计own
    const cache: Record<number, number> = {}
    for (const equip of equips) {
      const suit_id = equip.equip_suit.suit_id
      cache[suit_id] ??= equips.reduce((acc, cur) => {
        if (cur.equip_suit.suit_id === suit_id) {
          return acc + 1
        }
        return acc
      }, 0)
      equip.equip_suit.own = cache[suit_id]
    }
    return equips
  }

  main() {
    this.equip.properties = this.properties(this.Equipment.RandomPropertyList, false)
    this.equip.main_properties = this.properties(this.Equipment.MainPropertyList, true)
    this.equip.equip_suit = this.equip_suit()
    return this.equip
  }

  init(): Equip['info'] {
    return {
      id: this.id,
      level: this.Equipment.Level,
      name: `${this.data.equip_name}[${this.enkaEquip.Slot}]`,
      icon: '',
      rarity: Rarity[+String(this.id)[3]] || 'S',
      equipment_type: this.enkaEquip.Slot,
      invalid_property_cnt: 0,
      all_hit: false
    }
  }

  properties(enkaProperties: Enka.Property[], isMain: boolean) {
    const properties: Mys.Property[] = []
    for (const p of enkaProperties) {
      const property = {} as Mys.Property
      const propId = p.PropertyId
      property.property_name = id2zh[propId.toString().slice(0, 3) as IdsString]
      property.property_id = propId
      const value = p.PropertyValue * (isMain ? (1 + this.info.level * ({
        S: 0.2,
        A: 0.25,
        B: 0.3
      })[this.info.rarity]!) : p.PropertyLevel)
      property.base = get_base(propId, value)
      property.level = p.PropertyLevel
      property.valid = false
      property.system_id = 0
      property.add = p.PropertyLevel - 1
      properties.push(property)
    }
    return properties
  }

  equip_suit(): Mys.Equip['equip_suit'] {
    return {
      suit_id: +`${this.id.toString().slice(0, 3)}00`,
      name: this.data.equip_name,
      own: 0,
      desc1: this.data.desc1,
      desc2: this.data.desc2
    }
  }
}

export class Weapon {
  readonly id: number
  readonly data: Map.WeaponId2Data[string]
  readonly info: FilterValueType<Mys.Weapon, string | number | boolean>
  readonly weapon: Mys.Weapon
  constructor(readonly enkaWeapon: Enka.Weapon) {
    this.id = this.enkaWeapon.Id
    this.data = WeaponId2Data[this.id]
    if (!this.data) {
      throw new Error(`音擎数据缺失: ${this.id}`)
    }
    this.info = this.init()
    this.weapon = this.info as Mys.Weapon
  }

  static main(enkaWeapon: Enka.Avatar['Weapon']) {
    if (!enkaWeapon) return null
    const weapon = new Weapon(enkaWeapon)
    return weapon.main()
  }

  main() {
    this.weapon.properties = this.properties(false)
    this.weapon.main_properties = this.properties(true)
    return this.weapon
  }

  init(): Weapon['info'] {
    return {
      id: this.id,
      level: this.enkaWeapon.Level,
      name: this.data.Name,
      star: this.enkaWeapon.UpgradeLevel,
      icon: '',
      rarity: this.data.Rarity,
      talent_title: this.data.Talents[1].Name,
      talent_content: this.data.Talents[1].Desc,
      profession: this.data.Profession
    }
  }

  properties(isMain: boolean) {
    const property = {} as Mys.Property
    const p = this.data[isMain ? 'BaseProperty' : 'RandProperty']
    const propId = p.Id
    property.property_name = id2zh[propId.toString().slice(0, 3) as IdsString]
    if (isMain && property.property_name === '攻击力') {
      property.property_name = '基础攻击力'
    }
    property.property_id = propId
    // 计算属性值
    let value: number
    const baseValue = p.Value
    if (isMain) { // 基础属性
      value = baseValue * (1 +
        (this.data.Level[this.info.level].Rate +
          this.data.Stars[this.enkaWeapon.BreakLevel].StarRate
        ) / 10000)
    } else { // 高级属性
      value = baseValue * (1 + this.data.Stars[this.enkaWeapon.BreakLevel].RandRate / 10000)
    }
    property.base = get_base(propId, value)
    property.level = 0
    property.valid = false
    property.system_id = 0
    property.add = 0
    return [property]
  }

}

let isToFixed = true

type initialProperty = {
  property_name: string
  property_id: number
  base: number
  add: number
  final: number
}

export class Property {
  readonly data: Map.PartnerId2Data[string]
  readonly keepPercent = [201, 211, 231, 315, 316, 317, 318, 319]
  constructor(
    readonly info: FilterValueType<Mys.Avatar, string | number | boolean>,
    readonly equips: Mys.Avatar['equip'],
    readonly weapon: Mys.Avatar['weapon'],
    readonly enkaAvatar: Enka.Avatar
  ) {
    this.data = PartnerId2Data[this.info.id]
  }

  static main(info: FilterValueType<Mys.Avatar, string | number | boolean>, equips: Mys.Avatar['equip'], weapon: Mys.Avatar['weapon'], enkaAvatar: Enka.Avatar) {
    return new Property(info, equips, weapon, enkaAvatar).main()
  }

  main(): Mys.AvatarProperty[] {
    const initial = this.initial()
    const properties = initial.map(prop => {
      const propId = prop.property_id
      const isPercent = this.keepPercent.includes(propId)
      if (!isToFixed) {
        return {
          property_name: prop.property_name,
          property_id: prop.property_id,
          base: isPercent ? `${prop.base}%` : `${prop.base}`,
          add: isPercent ? `${prop.add}%` : `${prop.add}`,
          final: isPercent ? `${prop.final}%` : `${prop.final}`,
        }
      }
      const isTofixed2 = propId === 305 // 能量自动回复
      return {
        property_name: prop.property_name,
        property_id: prop.property_id,
        base: isPercent ? `${prop.base.toFixed(1)}%` : `${isTofixed2 ? prop.base.toFixed(2) : prop.base}`,
        add: isPercent ? `${prop.add.toFixed(1)}%` : `${isTofixed2 ? prop.add.toFixed(2) : prop.add}`,
        final: isPercent ? `${prop.final.toFixed(1)}%` : `${isTofixed2 ? prop.final.toFixed(2) : prop.final}`,
      }
    })
    // 筛选属伤
    const elementType2PropId: Record<number, number> = {
      200: 315,
      201: 316,
      202: 317,
      203: 318,
      205: 319
    }
    const elementIds = Object.values(elementType2PropId)
    const propId = elementType2PropId[this.info.element_type]
    if (propId) {
      return properties.filter(prop => !elementIds.includes(prop.property_id) || prop.property_id === propId)
    }
    return properties
  }

  /** 计算基础属性 */
  base() {
    // const base = new Proxy({} as Record<IdsString, number>, {
    //   get(target, prop: IdsString) {
    //     return target[prop] || 0
    //   },
    //   set(target, prop: IdsString, value: number) {
    //     console.log(`${prop}: ${String(target[prop]).padStart(10, ' ')} => ${String(value).padEnd(10, ' ')} ${value - target[prop]}`)
    //     target[prop] = value
    //     return true
    //   }
    // })
    const base = {} as Record<IdsString, number>
    const ids = Object.keys(id2en).map(Number) as Ids[]
    ids.forEach((id) => {
      const prop = id2en[id]
      if (Object.prototype.hasOwnProperty.call(this.data, prop)) {
        // @ts-expect-error
        base[id] = +this.data[prop] || 0
      } else {
        base[id] = 0
      }
    });
    // 生命、攻击、防御随等级额外提升
    ([111, 121, 131] as const).forEach((id) => {
      const prop = id2en[id]
      // 等级提升
      if (this.info.level) {
        const growth = ({
          111: this.data.HpGrowth,
          121: this.data.AttackGrowth,
          131: this.data.DefenceGrowth
        })[id] || 0
        base[id] += (this.info.level - 1) * growth / 10000
      }
      // 突破提升
      const PromotionLevel = this.enkaAvatar.PromotionLevel || 0
      base[id] += this.data.Level[PromotionLevel][prop] || 0
    })
    // 核心技额外提升
    const CoreSkillEnhancement = this.enkaAvatar.CoreSkillEnhancement || 0
    if (CoreSkillEnhancement) {
      const extra = this.data.ExtraLevel[CoreSkillEnhancement].Extra
      const extraIds = Object.keys(extra).map(Number)
      extraIds.forEach((id) => base[id.toString().slice(0, 3) as IdsString] += extra[id].Value || 0)
    }
    // 处理音擎基础属性
    if (this.weapon) {
      for (const property of this.weapon.main_properties) {
        base[property.property_id.toString().slice(0, 3) as IdsString] += +property.base
      }
    }
    // console.log('----------------base保留整数----------------')
    // 保留整数
    ids.forEach(id => base[id] = Math.trunc(base[id]));
    ([201, 211, 231, 305] as const).forEach(id => base[id] /= 100)
    return base
  }

  en2id(data: Record<keyof typeof en2id, number>) {
    const idData = {} as Record<IdsString, number>
    const ens = Object.keys(data) as (keyof typeof en2id)[]
    ens.forEach((en) => {
      const id = en2id[en] as Ids
      idData[id] = data[en] || 0
    })
    return idData
  }

  en2zh(data: Record<keyof typeof en2id, number>) {
    const idData = this.en2id(data)
    return this.id2zh(idData)
  }

  id2zh(idData: Record<IdsString, number>) {
    const zhData = {} as typeof zh2id
    const ids = Object.keys(idData).map(Number) as Ids[]
    ids.forEach(id => {
      const zh = id2zh[id]
      if (zhData[zh]) {
        if (!idData[id]) return
        zhData[zh] += idData[id]
      } else {
        zhData[zh] = idData[id] || 0
      }
    })
    return zhData
  }

  /** 计算初始属性 */
  initial(base = this.id2zh(this.base())) {
    const properties = Object.entries(base)
      .reduce((
        acc: Record<number, initialProperty>,
        [key, value]
      ) => {
        const property_id = zh2id[key as keyof typeof zh2id]
        acc[property_id] = {
          property_name: key,
          property_id,
          base: value,
          add: 0,
          final: 0
        }
        return acc
      }, {})
    const all_properties: Mys.Property[] = []
    // 处理音擎高级属性
    if (this.weapon?.properties.length) {
      all_properties.push(...this.weapon.properties)
    }
    // 处理驱动盘词条
    for (const equip of this.equips) {
      equip.properties.length && all_properties.push(...equip.properties)
      equip.main_properties.length && all_properties.push(...equip.main_properties)
    }
    // 处理驱动盘套装效果
    const suitIds = Array.from(new Set(this.equips.filter(equip => equip.equip_suit.own >= 2).map(v => v.equip_suit.suit_id)))
    for (const suitId of suitIds) {
      const suitData = SuitData[suitId]
      if (!suitData || !suitData.properties) {
        logger.warn(`驱动盘套装数据缺失: ${suitId}，跳过套装效果计算`)
        continue
      }
      if (!suitData.properties.length) continue
      all_properties.push(...suitData.properties)
    }
    for (const property of all_properties) {
      const propId = +property.property_id.toString().slice(0, 3) as Ids
      if (property.base.includes('%')) {
        if (this.keepPercent.includes(propId)) {
          properties[propId].add += +property.base.replace('%', '')
        } else {
          properties[propId].add += properties[propId].base * +property.base.replace('%', '') / 100
        }
      } else {
        properties[propId].add += +property.base
      }
    }
    // 格式化前特殊处理
    const sp = special[this.info.id]
    if (sp && sp.initial_before_format) {
      sp.initial_before_format(properties, this)
    }
    // 格式化、计算final
    if (isToFixed) {
      for (const propId in properties) {
        const property = properties[propId]
        if (this.keepPercent.includes(+propId)) {
          property.add = +property.add.toFixed(1)
          property.final = +(property.base + property.add).toFixed(1)
        } else if (propId === '305') { // 能量自动回复
          property.add = +(Math.trunc(property.add * 100) / 100).toFixed(2)
          property.final = +(property.base + property.add).toFixed(2)
        } else if (propId === '111') { // 生命值
          property.add = Math.ceil(property.add)
          property.final = property.base + property.add
        } else {
          property.add = Math.trunc(property.add)
          property.final = property.base + property.add
        }
      }
    } else {
      for (const propId in properties) {
        const property = properties[propId]
        property.final = property.base + property.add
      }
    }
    // 格式化后特殊处理
    if (sp && sp.initial_after_format) {
      sp.initial_after_format(properties, this)
    }
    return Object.values(properties)
  }

}

export class Skill {
  static main(skills: Enka.Avatar['SkillLevelList'], rank: Enka.Avatar['TalentLevel']) {
    const result = skills.map(skill => ({
      level: skill.Level,
      skill_type: skill.Index,
      items: []
    }))
    // >=3额外提升2，>=5额外提升4
    const rankLevel = rank >= 3 ? (rank >= 5 ? 4 : 2) : 0
    if (rankLevel) {
      result.forEach(skill => {
        if (skill.skill_type === 5) return
        skill.level += rankLevel
      })
    }
    return result
  }
}

export function parseInfo(enkaAvatar: Enka.Avatar) {
  const info = {} as FilterValueType<Mys.Avatar, string | number | boolean>
  info.id = enkaAvatar.Id
  const data = PartnerId2Data[info.id]
  if (!data) return
  info.name_mi18n = data.name
  info.level = enkaAvatar.Level
  info.full_name_mi18n = data.full_name
  info.element_type = +data.ElementType
  info.camp_name_mi18n = data.Camp
  info.avatar_profession = +data.WeaponType
  info.rarity = data.Rarity
  info.rank = enkaAvatar.TalentLevel
  info.us_full_name = data.en_name
  /** 特殊元素属性 */
  info.sub_element_type = ({
    1091: 1, // 星见雅
    1371: 2, // 仪玄
  })[info.id] || 0
  info.group_icon_path = ''
  info.hollow_icon_path = ''
  info.role_vertical_painting_url = ''
  info.vertical_painting_color = ''
  info.role_square_url = ''
  return info
}

export function Enka2Mys(enkaAvatar: Enka.Avatar, __isToFixed__?: boolean): Mys.Avatar
export function Enka2Mys(enkaAvatars: Enka.Avatar[], __isToFixed__?: boolean): Mys.Avatar[]
export function Enka2Mys(enkaAvatars: Enka.Avatar | Enka.Avatar[], __isToFixed__ = true) {
  isToFixed = __isToFixed__
  const avatars = Array.isArray(enkaAvatars) ? enkaAvatars : [enkaAvatars]
  const results: Mys.Avatar[] = []
  for (const enkaAvatar of avatars) {
    try {
      const info = parseInfo(enkaAvatar)
      if (!info) {
        throw new Error(`角色数据缺失: ${enkaAvatar.Id}`)
      }
      const avatar = info as Mys.Avatar
      avatar.ranks = []
      avatar.equip = Equip.main(enkaAvatar.EquippedList)
      avatar.weapon = Weapon.main(enkaAvatar.Weapon)
      avatar.properties = Property.main(info, avatar.equip, avatar.weapon, enkaAvatar)
      avatar.skills = Skill.main(enkaAvatar.SkillLevelList, enkaAvatar.TalentLevel)
      results.push(avatar)
    } catch (error) {
      logger.warn(`Enka数据失败 ID: ${enkaAvatar.Id}\n`, error)
      continue
    }
  }
  return Array.isArray(enkaAvatars) ? results : results[0]
}

/** 特殊处理 */
const special: Record<number, {
  id: number
  name: string
  initial_before_format?: (
    properties: Record<number, initialProperty>,
    propertyClient: Property
  ) => void
  initial_after_format?: (
    properties: Record<number, initialProperty>,
    propertyClient: Property
  ) => void
}> = {
  1121: {
    id: 1121,
    name: '本',
    initial_before_format: (properties, { enkaAvatar }) => {
      const core = [0.4, 0.46, 0.52, 0.6, 0.66, 0.72, 0.8]
      const { CoreSkillEnhancement } = enkaAvatar
      const value = (core[CoreSkillEnhancement] || 0) * Math.trunc(properties[131].base + properties[131].add)
      properties[121].add += Math.trunc(value)
    }
  },
  1371: {
    id: 1371,
    name: '仪玄',
    initial_after_format: (properties) => {
      delete properties[231], delete properties[232]
      delete properties[305]
      const sheerForce =
        Math.trunc(properties[111].final * 1 / 10) +
        Math.trunc(properties[121].final * 3 / 10)
      properties[19] = {
        property_name: '贯穿力',
        property_id: 19,
        base: 0,
        add: sheerForce,
        final: sheerForce
      }
      properties[20] = {
        property_name: '闪能自动累积',
        property_id: 20,
        base: 2,
        add: 0,
        final: 2
      }
    }
  }
}