import { getMapData } from '../../utils/file.js'

const WeaponId2Data = getMapData('WeaponId2Data')

/**
 * 武器ID转武器文件名
 */
export const idToFileName = (id: string | number) => {
  const data = WeaponId2Data?.[id]?.CodeName
  return data
}

/**
 * 武器文件名转武器ID
 */
export const fileNameToId = (name: string) => {
  for (const [id, data] of Object.entries(WeaponId2Data)) {
    if (data.CodeName === name) return id
  }
  return null
}

/**
 * 获取所有武器的ID
 */
export const getAllWeaponID = () => {
  return Object.keys(WeaponId2Data)
}
