import WeaponId2Sprite from '../../resources/map/WeaponId2Sprite.json';

/**
 * @param {string} id
 * @returns string
 */
export const IDToWeaponName = id => {
  const data = WeaponId2Sprite?.[id];
  return data;
};

/**
 * @param {string} name
 * @returns string
 */
export const weaponNameToID = name => {
  for (const [id, data] of Object.entries(WeaponId2Sprite)) {
    if (data === name) return id;
  }
  return null;
};
