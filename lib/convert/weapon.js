// import WeaponId2Sprite from '../../resources/map/WeaponId2Sprite.json' assert { type: 'json' };
import { getMapData } from '../../utils/file.js';

const WeaponId2Sprite = getMapData('WeaponId2Sprite');

/**
 * @param {string} id
 * @returns string
 */
export const IDToWeaponFileName = id => {
  const data = WeaponId2Sprite?.[id];
  return data;
};

/**
 * @param {string} name
 * @returns string
 */
export const weaponFileNameToID = name => {
  for (const [id, data] of Object.entries(WeaponId2Sprite)) {
    if (data === name) return id;
  }
  return null;
};

/**
 * 获取所有武器的ID
 * @returns string[]
 */
export const getAllWeaponID = () => {
  return Object.keys(WeaponId2Sprite);
};

const WeaponId2Data = getMapData('WeaponId2Data');

/**
 * 武器名称转id
 * @param {string} name 武器全称
 * @returns {number | null}
 */
export const weaponNameToID = name => {
  for (const [id, data] of Object.entries(WeaponId2Data)) {
    if (data.name === name) return +id;
  }
  return null;
}

/**
 * 武器ID转职业
 * @param {number} id 武器全称
 * @returns {number | null}
 */
export const weaponIDToProfession = id => {
  return WeaponId2Data[id]?.profession ?? null;
}
