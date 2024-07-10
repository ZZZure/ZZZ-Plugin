import path from 'path';
import fs from 'fs';
import { ZZZ_SQUARE_AVATAR, ZZZ_SQUARE_BANGBOO } from './mysapi/api.js';
import { imageResourcesPath } from './path.js';
import { weapon } from './convert.js';
import { getResourceRemotePath } from './assets.js';

const ZZZ_SQUARE_AVATAR_PATH = path.join(imageResourcesPath, 'square_avatar');
const ZZZ_SQUARE_BANGBOO_PATH = path.join(
  imageResourcesPath,
  'bangboo_square_avatar'
);
const ZZZ_WEAPON_PATH = path.join(imageResourcesPath, 'weapon');
const ZZZ_GUIDES_PATH = path.join(imageResourcesPath, 'guides');

// 将下面的下载封装起来，支持错误重试5次
const downloadFile = async (url, savePath) => {
  const _download = async (url, savePath, retry = 0) => {
    if (retry > 5) {
      return null;
    }
    try {
      const download = await fetch(url);
      const arrayBuffer = await download.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (!fs.existsSync(path.dirname(savePath))) {
        fs.mkdirSync(path.dirname(savePath), { recursive: true });
      }
      fs.writeFileSync(savePath, buffer);
      return savePath;
    } catch (error) {
      return await _download(url, savePath, retry + 1);
    }
  };
  return await _download(url, savePath);
};

/**
 *
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
 *
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
 * Get weapon image path
 * @param {string} id
 * @returns Promise<string>
 */
export const getWeaponImage = async id => {
  logger.mark('getWeaponImage', id);
  const name = weapon.IDToWeaponFileName(id);
  logger.mark('getWeaponImage', name);
  const filename = `${name}.png`;
  const weaponPath = path.join(ZZZ_WEAPON_PATH, filename);
  if (fs.existsSync(weaponPath)) return weaponPath;
  const url = await getResourceRemotePath('weapon', filename);
  const savePath = weaponPath;
  const download = await downloadFile(url, savePath);
  logger.mark('getWeaponImage', download);
  return download;
};
