import { getMapData } from '../../utils/file.js';
const propertyData = getMapData('Property2Name');
const prop_id = {
  111: 'hpmax',
  121: 'attack',
  131: 'def',
  122: 'breakstun',
  201: 'crit',
  211: 'critdam',
  314: 'elementabnormalpower',
  312: 'elementmystery',
  231: 'penratio',
  232: 'penvalue',
  305: 'sprecover',
  310: 'spgetratio',
  115: 'spmax',
  315: 'physdmg',
  316: 'fire',
  317: 'ice',
  318: 'thunder',
  319: 'dungeonbuffether',
};

const pro_id = {
  1: 'attack',
  2: 'stun',
  3: 'anomaly',
  4: 'support',
  5: 'defense',
};

/**
 * 获取属性css类名
 * @param {string} _id 属性id
 * @returns {string | null}
 */
export function idToClassName(_id) {
  let propId = _id.toString();
  propId = propId.slice(0, 3);
  const propIcon = prop_id[propId];
  if (!propIcon) return null;
  return propIcon;
}

/**
 * 获取属性标识
 * @param {string | number} id 属性id
 * @returns {string | null}
 */
export const idToSignName = id => {
  const result = propertyData[id];
  if (!result) return null;
  return result[0];
};

/**
 * 获取属性全称
 * @param {string | number} id 属性id
 * @returns {string | null}
 */
export const idToName = id => {
  const result = propertyData[id];
  if (!result) return null;
  return result[1];
};

/**
 * 获取属性二字简称
 * @param {string | number} id 属性id
 * @returns {string | null}
 */
export const idToShortName = id => {
  const result = propertyData[id];
  if (!result) return null;
  return result[2];
};

/**
 * 属性名转id
 * @param {string} propName 属性名
 */
export const nameToId = (propName) => {
  for (const id in propertyData) {
    if (propertyData[id]?.[1] === propName) return Number(id);
  }
  return null;
};
