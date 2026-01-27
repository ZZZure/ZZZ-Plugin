import type { Weight } from '#interface'
import { nameToId } from './convert/property.js'
import { getMapData } from '../utils/file.js'
import { char } from './convert.js'

export const baseValueData = getMapData('EquipBaseValue')

const elementType2propId = (elementType: number) => [31503, 31603, 31703, 31803, , 31903][elementType - 200]

/**
 * 将权重数据格式化为ID格式权重数据
 */
export function formatScoreWeight(
  oriScoreWeight: string[],
  charID: number
): string[]
export function formatScoreWeight(
  oriScoreWeight: { [propName: string]: number },
  charID: number
): Weight
export function formatScoreWeight(
  oriScoreWeight: string[] | { [propName: string]: number },
  charID: number
) {
  if (!oriScoreWeight) return false
  if (Array.isArray(oriScoreWeight)) return oriScoreWeight
  if (typeof oriScoreWeight !== 'object') return false
  const weight: { [propID: string]: number } = {}
  for (const propName in oriScoreWeight) {
    if (!oriScoreWeight[propName] && oriScoreWeight[propName] !== 0)
      continue
    let propID
    if (charID && propName === '属性伤害加成') {
      propID = elementType2propId(+char.idToData(charID)?.ElementType)
    } else {
      propID = +propName || nameToId(propName)
    }
    if (!propID)
      continue
    weight[propID] = oriScoreWeight[propName]
  };
  return weight
}

/**
 * 获取词条强化次数
 * @param propertyID 属性id
 * @param value 属性值
 */
export const getEquipPropertyEnhanceCount = (propertyID: string | number, value: string): number => {
  const baseValue = baseValueData[propertyID]
  const numericValue = +value.replace('%', '')
  return Math.trunc(numericValue / baseValue - 1 || 0)
}
