import { getMapData } from '../../utils/file.js';

const equipData = getMapData('EquipId2Data');

/**
 * 获取驱动盘装备的图片
 * @param {string | number} equipId
 * @returns {string | null}
 */
export function equipIdToSprite(equipId) {
  equipId = equipId.toString();
  if (equipId.length === 5) {
    const suitId = equipId.slice(0, 3) + '00';
    if (equipData.hasOwnProperty(suitId)) {
      return equipData[suitId]['sprite_file'].replace('3D', '');
    }
  }
  return null;
}

/**
 * 获取所有装备的id
 * @returns {string[]}
 */
export function getAllEquipID() {
  return Object.keys(equipData);
}
