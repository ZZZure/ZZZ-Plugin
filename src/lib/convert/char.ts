import settings from '../settings.js'
import { getMapData } from '../../utils/file.js'

const PartnerId2Data = getMapData('PartnerId2Data')

/**
 * 角色ID转角色名
 * @param id
 * @param full 显示全称
 * @param en 是否为英文
 */
export const idToName = (id: string | number, full: boolean = true, en: boolean = false): string | null => {
  const data = PartnerId2Data?.[id]
  if (!data) return null
  if (en) return data?.['en_name']
  if (full) return data?.['full_name']
  return data?.['name']
}

/**
 * 角色ID转图片名
 */
export const idToSprite = (id: string | number): string | null => {
  const data = PartnerId2Data?.[id]
  if (!data) return null
  return data?.['sprite_id']
}

/**
 * 角色数据
 */
export const idToData = (id: string | number) => {
  return PartnerId2Data[id] || null
}

/**
 * 角色名转ID
 */
export const nameToId = (name: string | null): number | null => {
  for (const [id, data] of Object.entries(PartnerId2Data)) {
    if (data['name'] === name) return Number(id)
    if (data['full_name'] && data['full_name'] === name) return Number(id)
  }
  return null
}

/**
 * 角色名转图片名
 */
export const nameToSprite = (name: string | null): string | null => {
  for (const [_id, data] of Object.entries(PartnerId2Data)) {
    if (data['name'] === name) return data['sprite_id']
  }
  return null
}

/**
 * 别称转角色名
 */
export const aliasToName = (_alias: string): string | null => {
  const alias = settings.getConfig('alias')
  for (const [name, data] of Object.entries(alias)) {
    if (name === _alias) return name
    if (data.includes(_alias)) return name
  }
  // 判断PartnerId2SpriteId是否有对应的name
  for (const [_, data] of Object.entries(PartnerId2Data)) {
    if (data['name'] === _alias) return data['name']
    if (data['full_name'] && data['full_name'] === _alias) return data['name']
  }
  return null
}

/**
 * 别称转图片名
 */
export const aliasToSprite = (_alias: any): string | null => {
  const name = aliasToName(_alias)
  return nameToSprite(name)
}

/**
 * 别称转ID
 */
export const aliasToId = (name: any): number | null => {
  const _name = aliasToName(name)
  const id = nameToId(_name)
  return id
}

/**
 * 获取所有角色ID（不包含主角）
 */
export const getAllCharactersID = (): string[] => {
  return Object.keys(PartnerId2Data).filter(id => id !== '2011' && id !== '2021')
}

/**
 * 获取皮肤id文件名
 */
export const skinIdToFilename = (id: string | number, skin_id: string | number) => {
  const data = PartnerId2Data?.[id]
  if (!data) return null
  const skinData = data.Skin
  return skinData?.[skin_id]?.Image || null
}
