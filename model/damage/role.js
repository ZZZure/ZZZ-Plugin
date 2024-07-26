export const get_let_value = async (let_list, name) => {
	if (let_list[name]) {
		return let_list[name]
	}
	return 0
}

export const calculate_damage = async (base_detail, bonus_detail, skill_type, add_skill_type, avatar_element, skill_multiplier, level) => {
	let merged_attr = await merge_attribute(base_detail, bonus_detail)
	logger.debug('merged_attr', merged_attr);
	
	let attack = merged_attr.attack
	logger.debug('攻击区', attack);
	
	let defence_multiplier = await get_defence_multiplier(merged_attr, level);
	logger.debug('防御区', defence_multiplier);
	
	let injury_area = await get_injury_area(merged_attr, skill_type, add_skill_type, avatar_element);
	logger.debug('增伤区', injury_area);
	
	let damage_ratio = await get_damage_ratio(merged_attr, skill_type, add_skill_type, avatar_element);
	logger.debug('易伤区', damage_ratio);
	
	let critical_damage_base = await get_critical_damage_base(merged_attr, skill_type, add_skill_type, avatar_element);
	logger.debug('爆伤区', critical_damage_base);
	
	let critical_chance_base = await get_critical_chance_base(merged_attr, skill_type, add_skill_type, avatar_element);
	logger.debug('暴击区', critical_chance_base);
	
	let qiwang_damage = critical_chance_base * critical_damage_base
	logger.debug('暴击期望', qiwang_damage);
	
	let damagelist = {}
	let damage_cd = attack * skill_multiplier * defence_multiplier * injury_area * damage_ratio * critical_damage_base * 1.2 * 1.5
	let damage_qw = attack * skill_multiplier * defence_multiplier * injury_area * damage_ratio * qiwang_damage * 1.2 * 1.5
	damagelist['cd'] = damage_cd
	damagelist['qw'] = damage_qw
	return damagelist
};

export const get_critical_chance_base = async (merged_attr, skill_type, add_skill_type, avatar_element) => {
	let critical_chance_base = await get_let_value(merged_attr, 'CriticalChanceBase')
	let merged_attrkey = Object.keys(merged_attr)
	for (const attr of merged_attrkey){
		if (attr.search('_CriticalChanceBase') != -1) {
			let attr_name = attr.split('_CriticalChanceBase')[0]
			if ([skill_type, add_skill_type, 'All', avatar_element].includes(attr_name)) {
				logger.debug(attr + '对' + attr_name + '有' + merged_attr[attr] + '暴击加成')
				critical_chance_base = critical_chance_base + merged_attr[attr]
			}
		}
	}
	critical_chance_base = Math.min(1, critical_chance_base)
	return critical_chance_base
}

export const get_critical_damage_base = async (merged_attr, skill_type, add_skill_type, avatar_element) => {
	let critical_damage_base = await get_let_value(merged_attr, 'CriticalDamageBase')
	let merged_attrkey = Object.keys(merged_attr)
	for (const attr of merged_attrkey){
		if (attr.search('_CriticalDamageBase') != -1) {
			let attr_name = attr.split('_CriticalDamageBase')[0]
			if ([skill_type, add_skill_type, 'All', avatar_element].includes(attr_name)) {
				logger.debug(attr + '对' + attr_name + '有' + merged_attr[attr] + '爆伤加成')
				critical_damage_base = critical_damage_base + merged_attr[attr]
			}
		}
	}
	return critical_damage_base + 1
}

export const get_damage_ratio = async (merged_attr, skill_type, add_skill_type, avatar_element) => {
	let damage_ratio = await get_let_value(merged_attr, 'DmgRatio')
	let merged_attrkey = Object.keys(merged_attr)
	for (const attr of merged_attrkey){
		if (attr.search('_DmgRatio') != -1) {
			let attr_name = attr.split('_DmgRatio')[0]
			if ([skill_type, add_skill_type, 'All', avatar_element].includes(attr_name)) {
				logger.debug(attr + '对' + attr_name + '有' + merged_attr[attr] + '易伤加成')
				damage_ratio = damage_ratio + merged_attr[attr]
			}
		}
	}
	return damage_ratio + 1
}

export const get_injury_area = async (merged_attr, skill_type, add_skill_type, avatar_element) => {
	let injury_area = 1.0
	let merged_attrkey = Object.keys(merged_attr)
	for (const attr of merged_attrkey){
		if (attr.search('_DmgAdd') != -1) {
			let attr_name = attr.split('_DmgAdd')[0]
			if ([skill_type, add_skill_type, 'All', avatar_element].includes(attr_name)) {
				logger.debug(attr + '对' + attr_name + '有' + merged_attr[attr] + '增伤')
				injury_area = injury_area + merged_attr[attr]
			}
		}
	}
	return injury_area
}

export const get_defence_multiplier = async (merged_attr, level) => {
	/** 计算防御基础值 */
	let defadd = (0.155 * (level * level)) + (3.12 * level) + 46.95
	/** 计算降防 */
	let ignore_defence = 1.0
    if (merged_attr.ignore_defence) {
		ignore_defence = 1 - merged_attr.ignore_defence
    }
	/** 计算穿透率 */
	let penratio = 1.0
    if (merged_attr.PenRatioBase) {
		penratio = 1 - merged_attr.PenRatioBase
    }
	/** 计算穿透值 */
	let pendelta = await get_let_value(merged_attr, 'PenDelta')
	/** 计算防御乘区 */
	let defence_multiplier = defadd / (defadd + ((defadd * ignore_defence) * penratio - pendelta))
	return defence_multiplier
	
}

export const merge_attribute = async (base_detail, bonus_detail) => {
	let merged_attr = {}
	let bonus_detailkey = Object.keys(bonus_detail)
	for (const merged of bonus_detailkey){
		if (merged.search('Attack') != -1 || merged.search('Defence') != -1 || merged.search('HP') != -1) {
			continue
		} else if (merged.search('Base') != -1) {
			merged_attr[merged] = await get_let_value(base_detail, merged) + await get_let_value(bonus_detail, merged)
		} else {
			merged_attr[merged] = await get_let_value(bonus_detail, merged)
		}
	}
	merged_attr['hp'] = await get_let_value(bonus_detail, 'HPDelta') + await get_let_value(base_detail, 'hp') * (await get_let_value(bonus_detail, 'HPAddedRatio') + 1)
	merged_attr['attack'] = await get_let_value(bonus_detail, 'AttackDelta') + await get_let_value(base_detail, 'attack') * (await get_let_value(bonus_detail, 'AttackAddedRatio') + 1)
	merged_attr['defence'] = await get_let_value(bonus_detail, 'DefenceDelta') + await get_let_value(base_detail, 'defence') * (await get_let_value(bonus_detail, 'DefenceAddedRatio') + 1)
	merged_attr['CriticalChanceBase'] = await get_let_value(bonus_detail, 'CriticalChanceBase') + await get_let_value(base_detail, 'CriticalChanceBase')
	merged_attr['CriticalDamageBase'] = await get_let_value(bonus_detail, 'CriticalDamageBase') + await get_let_value(base_detail, 'CriticalDamageBase')
	merged_attr['PenRatioBase'] = await get_let_value(bonus_detail, 'PenRatioBase') + await get_let_value(base_detail, 'PenRatioBase')
	return merged_attr
}

