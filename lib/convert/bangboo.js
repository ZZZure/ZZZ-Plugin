import { getMapData } from '../../utils/file.js'

/** @type {import('#interface').Map.BangbooId2Data} */
const BangbooId2Data = getMapData('BangbooId2Data')

/**
 * 邦布数据
 * @param {string | number} bangboo_id
 */
export const bangbooIdToData = bangboo_id => {
  return BangbooId2Data[bangboo_id] || null
}

/**
 * @param {string} bangboo_id
 */
export const bangbooIdToName = (bangboo_id) => {
  return BangbooId2Data[bangboo_id]?.CHS || null
}

/**
 * @param {string} bangboo_id
 */
export const bangbooIdToSprite = (bangboo_id) => {
  return BangbooId2Data[bangboo_id]?.sprite_id || null
}

/**
 * 获取所有邦布ID
 */
export const getAllBangbooID = () => {
  return Object.keys(BangbooId2Data)
}
