import * as convert from './convert.js';
import {
  downloadMysImage,
  downloadResourceImage,
  downloadHakushFile,
} from './download/download.js';

/**
 * 获取角色头像（方形）
 * @param {string | number} charID
 * @returns Promise<string>
 */
export const getSquareAvatar = async charID => {
  const filename = `role_square_avatar_${charID}.png`;
  const result = await downloadMysImage(
    'ZZZ_SQUARE_AVATAR',
    'ZZZ_SQUARE_AVATAR_PATH',
    filename,
    'NEW_ZZZ_SQUARE_AVATAR'
  );
  return result;
};

/**
 * 获取角色头像（小方形）
 * @param {string | number} charID
 * @returns {Promise<string>}
 */
export const getSmallSquareAvatar = async charID => {
  const sprite = convert.char.IDToCharSprite(charID);
  if (!sprite) return null;
  const filename = `IconRoleGeneral${sprite}.png`;
  const result = await downloadResourceImage(
    'role_general',
    'ZZZ_SMALL_SQUARE_AVATAR_PATH',
    filename
  );
  return result;
};

/**
 * 获取邦布头像（方形）
 * @param {string | number} bangbooId
 * @returns {Promise<string>}
 */
export const getSquareBangboo = async bangbooId => {
  const filename = `bangboo_rectangle_avatar_${bangbooId}.png`;
  const result = await downloadMysImage(
    'ZZZ_SQUARE_BANGBOO',
    'ZZZ_SQUARE_BANGBOO_PATH',
    filename,
    'NEW_ZZZ_SQUARE_BANGBOO'
  );
  return result;
};

/**
 * 获取武器图片
 * @param {string} id
 * @returns {Promise<string>}
 */
export const getWeaponImage = async id => {
  const name = convert.weapon.IDToWeaponFileName(id);
  if (!name) return null;
  const filename = `${name}_High.png`;
  const replaceFilename = `${name}_High.png`;
  const result = await downloadResourceImage(
    'weapon',
    'ZZZ_WEAPON_PATH',
    filename,
    replaceFilename
  );
  return result;
};

/**
 * 获取角色图片
 * @param {string | number} id
 * @returns {Promise<string>}
 */
export const getRoleImage = async id => {
  const sprite = convert.char.IDToCharSprite(id);
  if (!sprite) return null;
  const filename = `IconRole${sprite}.png`;
  const result = await downloadResourceImage('role', 'ZZZ_ROLE_PATH', filename);
  return result;
};

/**
 * 获取角色圆形图片
 * @param {string | number} id
 * @returns {Promise<string>}
 */
export const getRoleCircleImage = async id => {
  const sprite = convert.char.IDToCharSprite(id);
  if (!sprite) return null;
  const filename = `IconRoleCircle${sprite}.png`;
  const result = await downloadResourceImage(
    'role_circle',
    'ZZZ_ROLE_CIRCLE_PATH',
    filename
  );
  return result;
};

/**
 * 获取套装图片
 * @param {string | number} suitId
 * @returns Promise<string>
 */
export const getSuitImage = async suitId => {
  const suitName = convert.equip.equipIdToSprite(suitId);
  if (!suitName) return null;
  const filename = `${suitName}.png`;
  const result = await downloadResourceImage('suit', 'ZZZ_SUIT_PATH', filename);
  return result;
};

/**
 * 获取3D套装图片
 * @param {string | number} suitId
 * @returns Promise<string>
 */
export const getSuit3DImage = async suitId => {
  const suitName = convert.equip.equipIdToSprite(suitId);
  const filename = `${suitName}_3d.png`;
  const result = await downloadResourceImage(
    'suit_3d',
    'ZZZ_SUIT_3D_PATH',
    filename
  );
  return result;
};

/**
 * 获取Hakush角色数据
 * @param {string} charId
 * @returns {Promise<object | null>} 文件内容（JSON）
 */
export const getHakushCharacter = async charId => {
  const filename = `${charId}.json`;
  const result = await downloadHakushFile(
    'ZZZ_CHARACTER',
    'HAKUSH_CHARACTER_DATA_PATH',
    filename
  );
  return result;
};

/**
 * 获取Hakush武器数据
 * @param {string} weaponId
 * @returns {Promise<string>}
 */
export const getHakushWeapon = async weaponId => {
  const filename = `${weaponId}.json`;
  const result = await downloadHakushFile(
    'ZZZ_WEAPON',
    'HAKUSH_WEAPON_DATA_PATH',
    filename
  );
  return result;
};
