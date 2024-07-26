import _ from 'lodash';
import { getMapData } from '../../utils/file.js';
import { ZZZAvatarInfo } from '../avatar.js';
const weapon_effect = getMapData('weapon_effect');

/**
 * 武器加成
 * @param {ZZZAvatarInfo['weapon']} equipment 武器
 * @param {ZZZAvatarInfo['damage_basic_properties']['base_detail']} base_detail 基础属性
 * @param {ZZZAvatarInfo['damage_basic_properties']['bonus_detail']} bonus_detail 套装加成
 * @returns {ZZZAvatarInfo['damage_basic_properties']['bonus_detail']} 套装加成
 */
export const weapon_ability = (equipment, base_detail, bonus_detail) => {
  if (equipment.id == 14119) {
    let IceDmgAdd = _.get(bonus_detail, 'Ice_DmgAdd', 0);
    bonus_detail['Ice_DmgAdd'] =
      IceDmgAdd +
      weapon_effect['14119']['Param']['IceDmgAdd'][equipment.star - 1];
    logger.debug('14119,IceDmgAdd');

    let CriticalChanceBase = _.get(bonus_detail, 'CriticalChanceBase', 0);
    bonus_detail['CriticalChanceBase'] =
      CriticalChanceBase +
      weapon_effect['14119']['Param']['CriticalChanceBase'][equipment.star - 1];
  }
  return bonus_detail;
};
