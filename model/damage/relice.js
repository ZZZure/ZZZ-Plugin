import _ from 'lodash';
import { ZZZAvatarInfo } from '../avatar.js';

/**
 *
 * @param {string} set_id 套装id
 * @param {number} set_num 套装数量
 * @param {ZZZAvatarInfo['damage_basic_properties']['base_detail']} base_detail 基础属性
 * @param {ZZZAvatarInfo['damage_basic_properties']['bonus_detail']} bonus_detail 套装加成
 * @returns {ZZZAvatarInfo['damage_basic_properties']['bonus_detail']} 套装加成
 */
export const relice_ability = (set_id, set_num, base_detail, bonus_detail) => {
  switch (set_id) {
    case '31100':
      if (set_num >= 4) {
        let R_DmgAdd = _.get(bonus_detail, 'R_DmgAdd', 0);
        bonus_detail['R_DmgAdd'] = R_DmgAdd + 0.2;
        let AttackAddedRatio = _.get(bonus_detail, 'AttackAddedRatio', 0);
        bonus_detail['AttackAddedRatio'] = AttackAddedRatio + 0.15;
        logger.debug('relicGetter,4,R_DmgAdd');
      }
      break;
    case '32500':
      if (set_num >= 2) {
        let IceDmgAdd = _.get(bonus_detail, 'Ice_DmgAdd', 0);
        bonus_detail['Ice_DmgAdd'] = IceDmgAdd + 0.1;
        logger.debug('32500,2,Ice_DmgAdd');
      }
      if (set_num >= 4) {
        let A_DmgAdd = _.get(bonus_detail, 'A_DmgAdd', 0);
        bonus_detail['A_DmgAdd'] = A_DmgAdd + 0.4;
        let C_DmgAdd = _.get(bonus_detail, 'C_DmgAdd', 0);
        bonus_detail['C_DmgAdd'] = C_DmgAdd + 0.4;
        logger.debug('32500,4,A_DmgAdd');
        logger.debug('32500,4,C_DmgAdd');
      }
      break;
  }
  return bonus_detail;
};
