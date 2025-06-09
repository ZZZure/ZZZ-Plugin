// import WeaponId2Sprite from '../../resources/map/WeaponId2Sprite.json' assert { type: 'json' };
import { getMapData } from '../../utils/file.js'

/** @type {import('../../model/Enka/interface.js').Map.WeaponId2Data} */
const WeaponId2Data = getMapData('WeaponId2Data')

/**
 * @param {string} id
 * @returns string
 */
export const IDToWeaponFileName = id => {
  const data = WeaponId2Data?.[id]?.CodeName
  return data
}

/**
 * @param {string} name
 * @returns string
 */
export const weaponFileNameToID = name => {
  for (const [id, data] of Object.entries(WeaponId2Data)) {
    if (data.CodeName === name) return id
  }
  return null
}

/**
 * 获取所有武器的ID
 * @returns string[]
 */
export const getAllWeaponID = () => {
  return Object.keys(WeaponId2Data)
}
