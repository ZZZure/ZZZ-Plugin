import settings from '../settings.js';
// import PartnerId2SpriteId from '../../resources/map/PartnerId2Data.json' assert { type: 'json' };
import { getMapData } from '../../utils/file.js';

const PartnerId2SpriteId = getMapData('PartnerId2Data');

/**
 *
 * @param {string | number} id
 * @param {boolean} full 显示全称
 * @param {boolean} en 是否为英文
 * @returns string | null
 */
export const IDToCharName = (id, full = true, en = false) => {
  const data = PartnerId2SpriteId?.[id];
  if (!data) return null;
  if (en) return data?.['en_name'];
  if (full) return data?.['full_name'];
  return data?.['name'];
};

/**
 *
 * @param {string | number} id
 * @returns string | null
 */
export const IDToCharSprite = id => {
  const data = PartnerId2SpriteId?.[id];
  if (!data) return null;
  return data?.['sprite_id'];
};

/**
 * @param {string} name
 * @returns number | null
 */
export const charNameToID = name => {
  for (const [id, data] of Object.entries(PartnerId2SpriteId)) {
    if (data['name'] === name) return Number(id);
  }
  return null;
};

/**
 * @param {string} name
 * @returns string | null
 */
export const charNameToSprite = name => {
  for (const [_id, data] of Object.entries(PartnerId2SpriteId)) {
    if (data['name'] === name) return data['sprite'];
  }
  return null;
};

/**
 * @param {string} atlas
 * @returns string | null
 */
export const atlasToName = _atlas => {
  const atlas = settings.getConfig('atlas');
  for (const [id, data] of Object.entries(atlas)) {
    if (id === _atlas) return id;
    if (data.includes(_atlas)) return id;
  }
  return null;
};

/**
 * @param {string} _atlas
 * @returns string | null
 */
export const atlasToSprite = _atlas => {
  const name = atlasToName(name);
  return charNameToSprite(name);
};

/**
 * @param {string} name
 * @returns number | null
 */
export const atlasToID = name => {
  const _name = atlasToName(name);
  const id = charNameToID(_name);
  return id;
};
