import { getMapData } from '../../utils/file.js'

/** @type {import('../../model/Enka/interface.js').Map.SuitData} */
const SuitData = getMapData('SuitData')

/**
 * 获取驱动盘装备的图片名
 * @param {string | number} equipId
 * @returns {string | null}
 */
export function equipIdToSprite(equipId) {
  equipId = equipId.toString()
  if (equipId.length === 5) {
    const suitId = equipId.slice(0, 3) + '00'
    if (SuitData.hasOwnProperty(suitId)) {
      return SuitData[suitId]['sprite_file']
    }
  }
  return null
}

/**
 * 获取所有套装id
 * @returns {string[]}
 */
export function getAllSuitID() {
  return Object.keys(SuitData)
}
