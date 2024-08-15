import path from 'path';
import fs from 'fs';
import {
  ZZZ_SQUARE_AVATAR,
  ZZZ_SQUARE_BANGBOO,
  NEW_ZZZ_SQUARE_BANGBOO,
  NEW_ZZZ_SQUARE_AVATAR,
} from './mysapi/api.js';
import { imageResourcesPath } from './path.js';
import { char, equip, weapon } from './convert.js';
import { getResourceRemotePath } from './assets.js';
import request from '../utils/request.js';

const ZZZ_SQUARE_AVATAR_PATH = path.join(imageResourcesPath, 'square_avatar');
const ZZZ_SMALL_SQUARE_AVATAR_PATH = path.join(
  imageResourcesPath,
  'role_general'
);
const ZZZ_SQUARE_BANGBOO_PATH = path.join(
  imageResourcesPath,
  'bangboo_square_avatar'
);
const ZZZ_WEAPON_PATH = path.join(imageResourcesPath, 'weapon');
const ZZZ_ROLE_PATH = path.join(imageResourcesPath, 'role');
const ZZZ_ROLE_CIRCLE_PATH = path.join(imageResourcesPath, 'role_circle');
const ZZZ_SUIT_3D_PATH = path.join(imageResourcesPath, 'suit_3d');
const ZZZ_SUIT_PATH = path.join(imageResourcesPath, 'suit');
// const ZZZ_GUIDES_PATH = path.join(imageResourcesPath, 'guides');

/**
 * 下载文件
 * @param {string} url 下载地址
 * @param {string} savePath 保存路径
 * @returns {Promise<string | null>} 保存路径
 */
export const downloadFile = async (url, savePath) => {
  // 下载文件
  try {
    const download = await request(url, {}, 5);
    const arrayBuffer = await download.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // 保存文件
    if (!fs.existsSync(path.dirname(savePath))) {
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
    }
    fs.writeFileSync(savePath, buffer);
    // 返回保存路径
    return savePath;
  } catch (error) {
    return null;
  }
};

/**
 * 查看文件是否存在，如果存在则返回路径，否则下载文件
 * @param {string} url 下载地址
 * @param {string} savePath 保存路径
 * @returns {Promise<string | null>} 保存路径
 */
export const checkFile = async (url, savePath) => {
  if (fs.existsSync(savePath)) {
    const stats = fs.statSync(savePath);
    if (stats.size > 0) {
      return savePath;
    }
  }
  const download = await downloadFile(url, savePath);
  return download;
};

/**
 * 获取角色头像（方形）
 * @param {string | number} charID
 * @returns Promise<string>
 */
export const getSquareAvatar = async charID => {
  const filename = `role_square_avatar_${charID}.png`;
  const avatarPath = path.join(ZZZ_SQUARE_AVATAR_PATH, filename);
  let url = `${ZZZ_SQUARE_AVATAR}/${filename}`;
  let result = await checkFile(url, avatarPath);
  if (!result) {
    url = `${NEW_ZZZ_SQUARE_AVATAR}/${filename}`;
    result = await checkFile(url, avatarPath);
  }
  return result;
};

/**
 * 获取角色头像（小方形）
 * @param {string | number} charID
 * @returns Promise<string>
 * @returns {Promise<string>}
 */
export const getSmallSquareAvatar = async charID => {
  const sprite = char.IDToCharSprite(charID);
  if (!sprite) return null;
  const filename = `IconRoleGeneral${sprite}.png`;
  const avatarPath = path.join(ZZZ_SMALL_SQUARE_AVATAR_PATH, filename);
  const url = await getResourceRemotePath('role_general', filename);
  const result = await checkFile(url, avatarPath);
  return result;
};

/**
 * 获取邦布头像（方形）
 * @param {string | number} bangbooId
 * @returns Promise<string>
 */
export const getSquareBangboo = async bangbooId => {
  const filename = `bangboo_rectangle_avatar_${bangbooId}.png`;
  const bangbooPath = path.join(ZZZ_SQUARE_BANGBOO_PATH, filename);
  let url = `${ZZZ_SQUARE_BANGBOO}/${filename}`;
  let result = await checkFile(url, bangbooPath);
  if (!result) {
    url = `${NEW_ZZZ_SQUARE_BANGBOO}/${filename}`;
    result = await checkFile(url, bangbooPath);
  }
  return result;
};

/**
 * 获取武器图片
 * @param {string} id
 * @returns Promise<string>
 */
export const getWeaponImage = async id => {
  const name = weapon.IDToWeaponFileName(id);
  let filename = `${name}_High.png`;
  const weaponPath = path.join(ZZZ_WEAPON_PATH, filename);
  const url = await getResourceRemotePath('weapon', filename);
  let result = await checkFile(url, weaponPath);
  if (!result) {
    filename = `${name}.png`;
    const weaponPath = path.join(ZZZ_WEAPON_PATH, filename);
    const url = await getResourceRemotePath('weapon', filename);
    result = await checkFile(url, weaponPath);
  }
  return result;
};

/**
 * 获取角色图片
 * @param {string | number} id
 * @returns Promise<string>
 */
export const getRoleImage = async id => {
  const sprite = char.IDToCharSprite(id);
  if (!sprite) return null;
  const filename = `IconRole${sprite}.png`;
  const rolePath = path.join(ZZZ_ROLE_PATH, filename);
  const url = await getResourceRemotePath('role', filename);
  const result = await checkFile(url, rolePath);
  return result;
};

/**
 * 获取角色圆形图片
 * @param {string | number} id
 * @returns Promise<string>
 */
export const getRoleCircleImage = async id => {
  const sprite = char.IDToCharSprite(id);
  if (!sprite) return null;
  const filename = `IconRoleCircle${sprite}.png`;
  const roleCirclePath = path.join(ZZZ_ROLE_CIRCLE_PATH, filename);
  const url = await getResourceRemotePath('role_circle', filename);
  const result = await checkFile(url, roleCirclePath);
  return result;
};

/**
 * 获取套装图片
 * @param {string | number} suitId
 * @returns Promise<string>
 */
export const getSuitImage = async suitId => {
  const suitName = equip.equipIdToSprite(suitId);
  const filename = `${suitName}.png`;
  const suitPath = path.join(ZZZ_SUIT_PATH, filename);
  const url = await getResourceRemotePath('suit', filename);
  const result = await checkFile(url, suitPath);
  return result;
};

/**
 * 获取3D套装图片
 * @param {string | number} suitId
 * @returns Promise<string>
 */
export const getSuit3DImage = async suitId => {
  const suitName = equip.equipIdToSprite(suitId);
  const filename = `${suitName}_3d.png`;
  const suitPath = path.join(ZZZ_SUIT_3D_PATH, filename);
  const url = await getResourceRemotePath('suit_3d', filename);
  const result = await checkFile(url, suitPath);
  return result;
};
