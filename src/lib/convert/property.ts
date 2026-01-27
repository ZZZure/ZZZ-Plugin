import { getMapData } from '../../utils/file.js'

const propertyData = getMapData('Property2Name')

/** 属性css命名 */
const prop_id = {
  111: 'hpmax',
  121: 'attack',
  131: 'def',
  122: 'breakstun',
  201: 'crit',
  211: 'critdam',
  314: 'elementabnormalpower',
  312: 'elementmystery',
  231: 'penratio',
  232: 'penvalue',
  305: 'sprecover',
  310: 'spgetratio',
  115: 'spmax',
  315: 'physdmg',
  316: 'fire',
  317: 'ice',
  318: 'thunder',
  319: 'dungeonbuffether',
}

/** 职业css命名 */
const pro_id = {
  1: 'attack',
  2: 'stun',
  3: 'anomaly',
  4: 'support',
  5: 'defense',
}

/**
 * 获取属性css类名
 * @param _id 属性id
 */
export function idToClassName(_id: string | number): string | null {
  const propId = +_id.toString().slice(0, 3) as keyof typeof prop_id
  const propIcon = prop_id[propId]
  if (!propIcon) return null
  return propIcon
}

/**
 * 获取属性标识
 * @param id 属性id
 */
export const idToSignName = (id: string | number): string | null => {
  const result = propertyData[id]
  if (!result) return null
  return result[0]
}

/**
 * 获取属性全称
 * @param id 属性id
 */
export const idToName = (id: string | number): string | null => {
  const result = propertyData[id]
  if (!result) return null
  return result[1]
}

/**
 * 获取属性2字简称
 * @param id 属性id
 */
export const idToShortName2 = (id: string | number): string => {
  const result = propertyData[id]
  if (!result) return ''
  return result[2]
}

/**
 * 获取属性2~3字简称
 * @param id 属性id
 */
export const idToShortName3 = (id: string | number): string => {
  const result = propertyData[id]
  if (!result) return ''
  return result[3]
}

/**
 * 获取属性2~3字简称
 */
export const nameToShortName3 = (propName: string): string => {
  for (const id in propertyData) {
    if (propertyData[id][1] === propName) return propertyData[id][3]
  };
  return propName
}

/**
 * 属性名转id
 * @param propName 属性名
 */
export const nameToId = (propName: string): number => {
  for (const id in propertyData) {
    if (propertyData[id][1] === propName ||
      propertyData[id][1].replace('属性', '') === propName
    ) return Number(id)
  };
  return 0
}

/**
 * 中文属性名转英文属性名
 * @param propNameZH 属性名
 */
export const nameZHToNameEN = (propNameZH: string): string => {
  for (const id in propertyData) {
    if (propertyData[id]?.[1] === propNameZH) return propertyData[id][0]
  };
  return ''
}