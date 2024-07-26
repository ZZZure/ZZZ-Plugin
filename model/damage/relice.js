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
		case '32600':
			if (set_num >= 2) {
				let PhysicalDmgAdd = _.get(bonus_detail, 'Physical_DmgAdd', 0);
				bonus_detail['Physical_DmgAdd'] = PhysicalDmgAdd + 0.1;
				logger.debug('32600,2,Physical_DmgAdd');
			}
			if (set_num >= 4) {
				let AllDmgAdd = _.get(bonus_detail, 'All_DmgAdd', 0);
				bonus_detail['All_DmgAdd'] = AllDmgAdd + 0.35;
				logger.debug('32600,4,All_DmgAdd');
			}
			break;
		case '32400':
			if (set_num >= 2) {
				let Electric_DmgAdd = _.get(bonus_detail, 'Electric_DmgAdd', 0);
				bonus_detail['Electric_DmgAdd'] = Electric_DmgAdd + 0.1;
				logger.debug('32400,2,Electric_DmgAdd');
			}
			if (set_num >= 4) {
				let AttackAddedRatio = _.get(bonus_detail, 'AttackAddedRatio', 0);
				bonus_detail['AttackAddedRatio'] = AttackAddedRatio + 0.28;
				logger.debug('32400,4,AttackAddedRatio');
			}
			break;
		case '32200':
			if (set_num >= 2) {
				let Fire_DmgAdd = _.get(bonus_detail, 'Fire_DmgAdd', 0);
				bonus_detail['Fire_DmgAdd'] = Fire_DmgAdd + 0.1;
				logger.debug('32200,4,Fire_DmgAdd');
			}
			if (set_num >= 4) {
				let CriticalChanceBase = _.get(bonus_detail, 'CriticalChanceBase', 0);
				bonus_detail['CriticalChanceBase'] = CriticalChanceBase + 0.28;
				logger.debug('32200,4,CriticalChanceBase');
			}
			break;
		case '32300':
			if (set_num >= 2) {
				let Ether_DmgAdd = _.get(bonus_detail, 'Ether_DmgAdd', 0);
				bonus_detail['Ether_DmgAdd'] = Ether_DmgAdd + 0.1;
				logger.debug('32300,4,Ether_DmgAdd');
			}
			if (set_num >= 4) {
				let CriticalDamageBase = _.get(bonus_detail, 'CriticalDamageBase', 0);
				bonus_detail['CriticalDamageBase'] = CriticalDamageBase + 0.53;
				logger.debug('32300,4,CriticalDamageBase');
			}
			break;
		case '31600':
			if (set_num >= 4) {
				let All_DmgAdd = _.get(bonus_detail, 'All_DmgAdd', 0);
				bonus_detail['All_DmgAdd'] = All_DmgAdd + 0.53;
				logger.debug('31600,4,All_DmgAdd');
			}
			break;
		case '31400':
			if (set_num >= 4) {
				let AttackAddedRatio = _.get(bonus_detail, 'AttackAddedRatio', 0);
				bonus_detail['AttackAddedRatio'] = AttackAddedRatio + 0.25;
				logger.debug('31400,4,AttackAddedRatio');
			}
			break;
		case '31000':
			if (set_num >= 4) {
				let AttackAddedRatio = _.get(bonus_detail, 'AttackAddedRatio', 0);
				bonus_detail['AttackAddedRatio'] = AttackAddedRatio + 0.27;
				logger.debug('31400,4,AttackAddedRatio');
			}
			break;
	}
	return bonus_detail;
};
