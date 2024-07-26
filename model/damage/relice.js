export const get_let_value = async (let_list, name) => {
	if (let_list[name]) {
		return let_list[name]
	}
	return 0
}

export const Relic = async (set_id, set_num, base_detail, bonus_detail) => {
    if (set_id == '31100'){
		if (set_num >= 4){
			let R_DmgAdd = await get_let_value(bonus_detail, 'R_DmgAdd');
			bonus_detail['R_DmgAdd'] = R_DmgAdd + 0.2;
			let AttackAddedRatio = await get_let_value(bonus_detail, 'AttackAddedRatio');
			bonus_detail['AttackAddedRatio'] = AttackAddedRatio + 0.15;
			logger.debug('relicGetter,4,R_DmgAdd');
		}
	}else if(set_id == '32500'){
		if (set_num >= 2){
			let IceDmgAdd = await get_let_value(bonus_detail, 'Ice_DmgAdd');
			bonus_detail['Ice_DmgAdd'] = IceDmgAdd + 0.1;
			logger.debug('32500,2,Ice_DmgAdd');
		}
		if (set_num >= 4){
			let A_DmgAdd = await get_let_value(bonus_detail, 'A_DmgAdd');
			bonus_detail['A_DmgAdd'] = A_DmgAdd + 0.4;
			let C_DmgAdd = await get_let_value(bonus_detail, 'C_DmgAdd');
			bonus_detail['C_DmgAdd'] = C_DmgAdd + 0.4;
			logger.debug('32500,4,A_DmgAdd');
			logger.debug('32500,4,C_DmgAdd');
		}
	}
    return bonus_detail;
}

export const relice_ability = async (set_id, set_num, base_detail, bonus_detail) => {
    bonus_detail = await Relic(set_id, set_num, base_detail, bonus_detail);
    return bonus_detail;
}
