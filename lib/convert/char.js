import settings from '../settings.js';
import PartnerId2SpriteId from '../../resources/map/PartnerId2Data.json' assert { type: 'json' };

/**
 *
 * @param {string} id
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
 * @param {string} id
 * @returns string | null
 */
export const IDToCharSprite = id => {
  const data = PartnerId2SpriteId?.[id];
  if (!data) return null;
  return data?.['sprite'];
};

/**
 * @param {string} name
 * @returns string | null
 */
export const charNameToID = name => {
  for (const [id, data] of Object.entries(PartnerId2SpriteId)) {
    if (data['full_name'] === name) return id;
  }
  return null;
};

/**
 * @param {string} name
 * @returns string | null
 */
export const charNameToSprite = name => {
  for (const [_id, data] of Object.entries(PartnerId2SpriteId)) {
    if (data['full_name'] === name) return data['sprite'];
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
  const atlas = settings.getConfig('atlas');
  for (const [_id, data] of Object.entries(atlas)) {
    if (data.includes(_atlas)) return data['sprite'];
  }
  return null;
};

/**
 * @param {string} name
 * @returns string | null
 */
export const atlasToID = name => {
  const atlas = settings.getConfig('atlas');
  for (const [id, data] of Object.entries(atlas)) {
    if (data.includes(name)) return charNameToID(id);
  }
  return null;
};
