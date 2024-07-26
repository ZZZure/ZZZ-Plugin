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
	let equipid = equipment.id
	switch (equipid) {
		case 14119:{
			let IceDmgAdd = _.get(bonus_detail, 'Ice_DmgAdd', 0);
			bonus_detail['Ice_DmgAdd'] = IceDmgAdd + weapon_effect[equipment.id]['Param']['IceDmgAdd'][equipment.star - 1];

			let CriticalChanceBase = _.get(bonus_detail, 'CriticalChanceBase', 0);
			bonus_detail['CriticalChanceBase'] = CriticalChanceBase +weapon_effect[equipment.id]['Param']['CriticalChanceBase'][equipment.star - 1];
			break;
		}
		case 14102:{
			let Physical_DmgAdd = _.get(bonus_detail, 'Physical_DmgAdd', 0);
			bonus_detail['Physical_DmgAdd'] = Physical_DmgAdd + weapon_effect[equipment.id]['Param']['Physical_DmgAdd'][equipment.star - 1];

			let All_DmgAdd = _.get(bonus_detail, 'All_DmgAdd', 0);
			bonus_detail['All_DmgAdd'] = All_DmgAdd + weapon_effect[equipment.id]['Param']['All_DmgAdd'][equipment.star - 1];
			break;
		}
		case 14104:{
			let AttackAddedRatio = _.get(bonus_detail, 'AttackAddedRatio', 0);
			bonus_detail['AttackAddedRatio'] = AttackAddedRatio + weapon_effect[equipment.id]['Param']['AttackAddedRatio'][equipment.star - 1] * 8;
			break;
		}
		case 14124:{
			let A_DmgAdd = _.get(bonus_detail, 'A_DmgAdd', 0);
			bonus_detail['A_DmgAdd'] = A_DmgAdd + weapon_effect[equipment.id]['Param']['A_DmgAdd'][equipment.star - 1] * 8;
			break;
		}
		case 13001:{
			let R_DmgAdd = _.get(bonus_detail, 'R_DmgAdd', 0);
			bonus_detail['R_DmgAdd'] = R_DmgAdd + weapon_effect[equipment.id]['Param']['R_DmgAdd'][equipment.star - 1] * 3;
			break;
		}
		case 13004:{
			let AttackAddedRatio = _.get(bonus_detail, 'AttackAddedRatio', 0);
			bonus_detail['AttackAddedRatio'] = AttackAddedRatio + weapon_effect[equipment.id]['Param']['AttackAddedRatio'][equipment.star - 1];
			break;
		}
		case 13013:{
			let EUP_DmgAdd = _.get(bonus_detail, 'EUP_DmgAdd', 0);
			bonus_detail['EUP_DmgAdd'] = EUP_DmgAdd + weapon_effect[equipment.id]['Param']['EUP_DmgAdd'][equipment.star - 1];
			break;
		}
		case 13106:{
			let EUP_DmgAdd = _.get(bonus_detail, 'EUP_DmgAdd', 0);
			bonus_detail['EUP_DmgAdd'] = EUP_DmgAdd + weapon_effect[equipment.id]['Param']['EUP_DmgAdd'][equipment.star - 1] * 15;
			break;
		}
		case 13108:{
			let Physical_DmgAdd = _.get(bonus_detail, 'Physical_DmgAdd', 0);
			bonus_detail['Physical_DmgAdd'] = Physical_DmgAdd + weapon_effect[equipment.id]['Param']['Physical_DmgAdd'][equipment.star - 1];
			break;
		}
		case 13111:{
			let A_DmgAdd = _.get(bonus_detail, 'A_DmgAdd', 0);
			bonus_detail['A_DmgAdd'] = A_DmgAdd + weapon_effect[equipment.id]['Param']['A_DmgAdd'][equipment.star - 1];
			let C_DmgAdd = _.get(bonus_detail, 'C_DmgAdd', 0);
			bonus_detail['C_DmgAdd'] = C_DmgAdd + weapon_effect[equipment.id]['Param']['A_DmgAdd'][equipment.star - 1];
			break;
		}
	}
	return bonus_detail;
};
