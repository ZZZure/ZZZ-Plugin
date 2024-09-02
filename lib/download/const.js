import path from 'path';
import { imageResourcesPath, dataResourcesPath } from '../path.js';

export const ZZZ_SQUARE_AVATAR_PATH = path.join(
    imageResourcesPath,
    'square_avatar'
  ),
  ZZZ_SMALL_SQUARE_AVATAR_PATH = path.join(imageResourcesPath, 'role_general'),
  ZZZ_SQUARE_BANGBOO_PATH = path.join(
    imageResourcesPath,
    'bangboo_square_avatar'
  ),
  ZZZ_WEAPON_PATH = path.join(imageResourcesPath, 'weapon'),
  ZZZ_ROLE_PATH = path.join(imageResourcesPath, 'role'),
  ZZZ_ROLE_CIRCLE_PATH = path.join(imageResourcesPath, 'role_circle'),
  ZZZ_SUIT_3D_PATH = path.join(imageResourcesPath, 'suit_3d'),
  ZZZ_SUIT_PATH = path.join(imageResourcesPath, 'suit');
// const ZZZ_GUIDES_PATH = path.join(imageResourcesPath, 'guides');

export const HAKUSH_CHARACTER_DATA_PATH = path.join(
    dataResourcesPath,
    'hakush/data/character'
  ),
  HAKUSH_WEAPON_DATA_PATH = path.join(dataResourcesPath, 'hakush/data/weapon');
