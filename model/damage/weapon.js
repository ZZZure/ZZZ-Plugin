import { getMapData } from '../../utils/file.js';
const weapon_effect = getMapData('weapon_effect');

export const get_let_value = async (let_list, name) => {
	if (let_list[name]) {
		return let_list[name]
	}
	return 0
}

export const Weapon = async (equipment, base_detail, bonus_detail) => {
	if (equipment.id == 14119){
		let IceDmgAdd = await get_let_value(bonus_detail, 'Ice_DmgAdd');
		bonus_detail['Ice_DmgAdd'] = IceDmgAdd + weapon_effect['14119']['Param']['IceDmgAdd'][equipment.star - 1];
		logger.debug('14119,IceDmgAdd');
		
		let CriticalChanceBase = await get_let_value(bonus_detail, 'CriticalChanceBase');
		bonus_detail['CriticalChanceBase'] = CriticalChanceBase + weapon_effect['14119']['Param']['CriticalChanceBase'][equipment.star - 1];
	}
    return bonus_detail;
};

export const weapon_ability = async (equipment, base_detail, bonus_detail) => {
    bonus_detail = await Weapon(equipment, base_detail, bonus_detail);
    return bonus_detail;
}
