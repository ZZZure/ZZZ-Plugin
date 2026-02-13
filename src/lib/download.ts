import * as convert from './convert.js'
import {
  downloadMysImage,
  downloadResourceImage,
  downloadHakushFile,
} from './download/download.js'

/**
 * 获取角色头像（方形）
 * @param charID 角色ID
 */
export const getSquareAvatar = async (charID: string | number) => {
  let result: string | null = ''
  const sprite = convert.char.idToSprite(charID)
  if (sprite) {
    const filename = `IconRoleCrop${sprite}.webp`
    result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_SQUARE_AVATAR_PATH', filename)
  }
  if (!result) {
    const filename = `role_square_avatar_${charID}.png`
    result = await downloadMysImage(
      'ZZZ_SQUARE_AVATAR_V2',
      'ZZZ_SQUARE_AVATAR_PATH',
      filename
    )
  }
  return result
}

/**
 * 获取角色头像（小方形）
 * @param charID 角色ID
 */
export const getSmallSquareAvatar = async (charID: string | number) => {
  const sprite = convert.char.idToSprite(charID)
  if (!sprite) return null
  let filename = `IconRoleGeneral${sprite}.png`
  let result: string | null = ''
  result = await downloadResourceImage(
    'role_general',
    'ZZZ_SMALL_SQUARE_AVATAR_PATH',
    filename
  )
  if (!result) {
    filename = `IconRoleSelect${sprite}.webp`
    result = await downloadHakushFile(
      'ZZZ_UI',
      'HAKUSH_ZZZ_SMALL_SQUARE_AVATAR_PATH',
      filename
    )
  }
  return result
}

/**
 * 获取邦布头像（方形）
 * @param bangbooId 邦布ID
 */
export const getSquareBangboo = async (bangbooId: string | number) => {
  let result: string | null = ''
  const sprite = convert.bangboo.idToSprite(bangbooId)
  if (sprite) {
    const filename = `BangbooGarageRole${sprite}.webp`
    result = await downloadHakushFile(
      'ZZZ_UI',
      'HAKUSH_ZZZ_SQUARE_BANGBOO_PATH',
      filename
    )
  }
  const filename = `bangboo_rectangle_avatar_${bangbooId}.png`
  if (!result) {
    result = await downloadResourceImage(
      'square_bangbo',
      'ZZZ_SQUARE_BANGBOO_PATH',
      filename
    )
  }
  if (!result)
    result = await downloadMysImage(
      'ZZZ_SQUARE_BANGBOO_V2',
      'ZZZ_SQUARE_BANGBOO_PATH',
      filename
    )
  return result
}

/**
 * 获取武器图片
 * @param id 武器ID
 */
export const getWeaponImage = async (id: string | number) => {
  const name = convert.weapon.idToFileName(id)
  if (!name) return null
  let result: string | null = ''
  const filename = `${name}_High.png`
  result = await downloadResourceImage(
    'weapon',
    'ZZZ_WEAPON_PATH',
    filename
  )
  if (!result) {
    const filename = `${name}.webp`
    result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_WEAPON_PATH', filename)
  }
  return result
}

/**
 * 获取角色图片
 * @param id 角色ID
 * @param skin_id 皮肤ID
 */
export const getRoleImage = async (id: string | number, skin_id?: string | number) => {
  const sprite = convert.char.idToSprite(id)
  if (!sprite) return null
  let result: string | null = ''
  let filename = `IconRole${sprite}.png`
  if (!skin_id) {
    result = await downloadResourceImage('role', 'ZZZ_ROLE_PATH', filename)
  }
  if (!result) {
    if (skin_id) {
      filename = `${convert.char.skinIdToFilename(id, skin_id) || `IconRole${sprite}`}.webp`
    } else {
      filename = `IconRole${sprite}.webp`
    }
    result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_ROLE_PATH', filename)
  }
  return result
}

/**
 * 获取角色圆形图片
 * @param id 角色ID
 */
export const getRoleCircleImage = async (id: string | number) => {
  const sprite = convert.char.idToSprite(id)
  if (!sprite) return null
  let result: string | null = ''
  let filename = `IconRoleCircle${sprite}.png`
  result = await downloadResourceImage(
    'role_circle',
    'ZZZ_ROLE_CIRCLE_PATH',
    filename
  )
  if (!result) {
    filename = `IconRoleCircle${sprite}.webp`
    result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_ROLE_CIRCLE_PATH', filename)
  }
  return result
}

/**
 * 获取套装图片
 * @param suitId 套装ID
 */
export const getSuitImage = async (suitId: string | number) => {
  const suitName = convert.equip.idToSprite(suitId)
  if (!suitName) return null
  const filename = `${suitName}.png`
  let result: string | null = ''
  result = await downloadResourceImage('suit', 'ZZZ_SUIT_PATH', filename)
  if (!result) {
    const filename = `${suitName}.webp`
    result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_SUIT_PATH', filename)
  }
  return result
}

/**
 * 获取3D套装图片
 * @param suitId 套装ID
 */
export const getSuit3DImage = async (suitId: string | number) => {
  const suitName = convert.equip.idToSprite(suitId)
  const filename = `${suitName}_3d.png`
  const result = await downloadResourceImage(
    'suit_3d',
    'ZZZ_SUIT_3D_PATH',
    filename
  )
  return result
}

/**
 * 获取Hakush角色数据
 * @param charId 角色ID
 * @returns 文件内容（JSON）
 */
export const getHakushCharacter = async (charId: string | number) => {
  const filename = `${charId}.json`
  const result = await downloadHakushFile(
    'ZZZ_CHARACTER',
    'HAKUSH_CHARACTER_DATA_PATH',
    filename
  )
  return result
}

/**
 * 获取Hakush武器数据
 * @param weaponId 武器ID
 */
export const getHakushWeapon = async (weaponId: string | number) => {
  const filename = `${weaponId}.json`
  const result = await downloadHakushFile(
    'ZZZ_WEAPON',
    'HAKUSH_WEAPON_DATA_PATH',
    filename
  )
  return result
}

/**
 * 获取Hakush UI
 * @param filename 文件名
 */
export const getHakushUI = async (filename: string) => {
  const result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_UI_PATH', filename)
  return result
}
