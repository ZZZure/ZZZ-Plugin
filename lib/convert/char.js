import settings from '../settings.js'
// import PartnerId2SpriteId from '../../resources/map/PartnerId2Data.json' assert { type: 'json' };
import { getMapData } from '../../utils/file.js'

/** @type {import('../../model/Enka/interface.js').Map.PartnerId2Data} */
const PartnerId2Data = getMapData('PartnerId2Data')

/**
 *
 * @param {string | number} id
 * @param {boolean} full 显示全称
 * @param {boolean} en 是否为英文
 * @returns {string | null}
 */
export const IDToCharName = (id, full = true, en = false) => {
  const data = PartnerId2Data?.[id]
  if (!data) return null
  if (en) return data?.['en_name']
  if (full) return data?.['full_name']
  return data?.['name']
}

/**
 *
 * @param {string | number} id
 * @returns {string | null}
 */
export const IDToCharSprite = id => {
  const data = PartnerId2Data?.[id]
  if (!data) return null
  return data?.['sprite_id']
}

/**
 * 角色数据
 * @param {string | number} id
 */
export const IDToCharData = id => {
  return PartnerId2Data[id] || null
}

/**
 * @param {string} name
 * @returns {number | null}
 */
export const charNameToID = name => {
  for (const [id, data] of Object.entries(PartnerId2Data)) {
    if (data['name'] === name) return Number(id)
    if (data['full_name'] && data['full_name'] === name) return Number(id)
  }
  return null
}

/**
 * @param {string} name
 * @returns {string | null}
 */
export const charNameToSprite = name => {
  for (const [_id, data] of Object.entries(PartnerId2Data)) {
    if (data['name'] === name) return data['sprite_id']
  }
  return null
}

/**
 * @param {string} _alias
 * @returns {string | null}
 */
export const aliasToName = _alias => {
  const alias = settings.getConfig('alias')
  for (const [name, data] of Object.entries(alias)) {
    if (name === _alias) return name
    if (data.includes(_alias)) return name
  }
  // 判断PartnerId2SpriteId是否有对应的name
  for (const [_, data] of Object.entries(PartnerId2Data)) {
    if (data['name'] === _alias) return data['name']
    if (data['full_name'] && data['full_name'] === _alias) return data['full_name']
  }
  return null
}

/**
 * @param {string} _alias
 * @returns {string | null}
 */
export const aliasToSprite = _alias => {
  const name = aliasToName(_alias)
  return charNameToSprite(name)
}

/**
 * @param {string} name
 * @returns {number | null}
 */
export const aliasToID = name => {
  const _name = aliasToName(name)
  const id = charNameToID(_name)
  return id
}

/**
 * 获取所有角色ID
 * @returns {string[]}
 */
export const getAllCharactersID = () => {
  return Object.keys(PartnerId2Data)
}
