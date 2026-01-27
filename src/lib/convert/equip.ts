import { getMapData } from '../../utils/file.js'

const SuitData = getMapData('SuitData')

/**
 * 获取驱动盘装备的图片名
 * @param equipId 套装ID
 */
export function idToSprite(equipId: string | number): string | null {
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
 */
export function getAllSuitID(): string[] {
  return Object.keys(SuitData)
}
