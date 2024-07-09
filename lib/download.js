import path from 'path';
import fs from 'fs';
import { ZZZ_SQUARE_AVATAR, ZZZ_SQUARE_BANGBOO } from './mysapi/api.js';
import { imageResourcesPath } from './path.js';

const ZZZ_SQUARE_AVATAR_PATH = path.join(imageResourcesPath, 'square_avatar');
const ZZZ_SQUARE_BANGBOO_PATH = path.join(
  imageResourcesPath,
  'bangboo_square_avatar'
);
const ZZZ_GUIDES_PATH = path.join(imageResourcesPath, 'guides');

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
  const download = await fetch(url);
  const arrayBuffer = await download.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (!fs.existsSync(ZZZ_SQUARE_AVATAR_PATH)) {
    fs.mkdirSync(ZZZ_SQUARE_AVATAR_PATH, { recursive: true });
  }
  fs.writeFileSync(savePath, buffer);
  return avatarPath;
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
  const download = await fetch(url);
  const arrayBuffer = await download.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (!fs.existsSync(ZZZ_SQUARE_BANGBOO_PATH)) {
    fs.mkdirSync(ZZZ_SQUARE_BANGBOO_PATH, { recursive: true });
  }
  fs.writeFileSync(savePath, buffer);
  return bangbooPath;
};
