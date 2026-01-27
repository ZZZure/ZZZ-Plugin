import { getMapData } from '../../utils/file.js'

const BangbooId2Data = getMapData('BangbooId2Data')

/**
 * 邦布ID转数据
 */
export const idToData = (bangboo_id: string | number) => {
  return BangbooId2Data[bangboo_id] || null
}

/**
 * 邦布ID转中文名
 */
export const idToName = (bangboo_id: string | number) => {
  return BangbooId2Data[bangboo_id]?.CHS || null
}

/**
 * 邦布ID转图片名
 */
export const idToSprite = (bangboo_id: string | number) => {
  return BangbooId2Data[bangboo_id]?.sprite_id || null
}

/**
 * 获取所有邦布ID
 */
export const getAllBangbooID = () => {
  return Object.keys(BangbooId2Data)
}
