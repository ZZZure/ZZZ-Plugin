import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { ZZZ_SQUARE_AVATAR, ZZZ_SQUARE_BANGBOO } from './mysapi/api.js';
import { imageResourcesPath } from './path.js';
import { char, equip, weapon } from './convert.js';
import { getResourceRemotePath } from './assets.js';

const ZZZ_SQUARE_AVATAR_PATH = path.join(imageResourcesPath, 'square_avatar');
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
 * @returns
 */
export const downloadFile = async (url, savePath) => {
  const _download = async (url, savePath, retry = 0) => {
    // 重试次数超过 5 次则返回 null
    if (retry > 5) {
      return null;
    }
    // 下载文件
    try {
      const download = await fetch(url);
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
      // 下载失败，重试
      return await _download(url, savePath, retry + 1);
    }
  };
  return await _download(url, savePath);
};

/**
 * 获取角色头像（方形）
 * @param {string | number} charID
 * @returns Promise<string>
 */
export const getSquareAvatar = async charID => {
  const filename = `role_square_avatar_${charID}.png`;
  const avatarPath = path.join(ZZZ_SQUARE_AVATAR_PATH, filename);
  if (fs.existsSync(avatarPath)) return avatarPath;
  const url = `${ZZZ_SQUARE_AVATAR}/${filename}`;
  const savePath = avatarPath;
  const download = await downloadFile(url, savePath);
  return download;
};

/**
 * 获取邦布头像（方形）
 * @param {string | number} bangbooId
 * @returns Promise<string>
 */
export const getSquareBangboo = async bangbooId => {
  const filename = `bangboo_rectangle_avatar_${bangbooId}.png`;
  const bangbooPath = path.join(ZZZ_SQUARE_BANGBOO_PATH, filename);
  if (fs.existsSync(bangbooPath)) return bangbooPath;
  const url = `${ZZZ_SQUARE_BANGBOO}/${filename}`;
  const savePath = bangbooPath;
  const download = await downloadFile(url, savePath);
  return download;
};

/**
 * 获取武器图片
 * @param {string} id
 * @returns Promise<string>
 */
export const getWeaponImage = async id => {
  const name = weapon.IDToWeaponFileName(id);
  const filename = `${name}.png`;
  const weaponPath = path.join(ZZZ_WEAPON_PATH, filename);
  if (fs.existsSync(weaponPath)) return weaponPath;
  const url = await getResourceRemotePath('weapon', filename);
  const savePath = weaponPath;
  const download = await downloadFile(url, savePath);
  return download;
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
  if (fs.existsSync(rolePath)) return rolePath;
  const url = await getResourceRemotePath('role', filename);
  const savePath = rolePath;
  const download = await downloadFile(url, savePath);
  return download;
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
  if (fs.existsSync(roleCirclePath)) return roleCirclePath;
  const url = await getResourceRemotePath('role_circle', filename);
  const savePath = roleCirclePath;
  const download = await downloadFile(url, savePath);
  return download;
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
  if (fs.existsSync(suitPath)) return suitPath;
  const url = await getResourceRemotePath('suit', filename);
  const savePath = suitPath;
  const download = await downloadFile(url, savePath);
  return download;
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
  if (fs.existsSync(suitPath)) return suitPath;
  const url = await getResourceRemotePath('suit_3d', filename);
  const savePath = suitPath;
  const download = await downloadFile(url, savePath);
  return download;
};
