import { getMapData } from '../../utils/file.js';
import { relice_ability } from './relice.js';
import { weapon_ability } from './weapon.js';
import { avatar_ability } from './avatar.js';
const propertyData = getMapData('Property2Name');
const elementData = getMapData('Avatarid2Element');

/**
 * 获取某个角色的伤害
 * @param {ZZZAvatarInfo} data
 * @returns {Promise<damagelist | null>}
 logger.debug(xxx)
 */
export const getDamage = async (data) => {
	/** 处理基础数据 */
	const retuan_detail = await get_base_info(data.properties,data.equip);
	let base_detail = retuan_detail['base_detail'];
	let bonus_detail = retuan_detail['bonus_detail'];
	let set_detail = retuan_detail['set_detail'];
	
	/** 处理驱动盘套装加成 */
	let set_detailkeys = Object.keys(set_detail)
	for (const set_id of set_detailkeys){
		let set_num = Number(set_detail[set_id])
		if (set_num >= 2)(
			bonus_detail = await relice_ability(set_id, set_num, base_detail, bonus_detail)
		)
	}
	logger.debug('bonus_detail', bonus_detail);
	
	/** 处理音频加成 */
	bonus_detail = await weapon_ability(data.weapon, base_detail, bonus_detail)
	logger.debug('bonus_detail', bonus_detail);
	
	/** 处理角色加成 */
	let damagelist = await avatar_ability(data, base_detail, bonus_detail)
	return damagelist
};

/**
 * 获取某个角色面包数据
 * @param {ZZZAvatarInfo} properties_l
 * @param {ZZZAvatarInfo} equip
 * @returns base_detail
 */
export const get_base_info = async (properties_l, equip) => {
	let retuan_detail = {}
	let base_detail = {}
	base_detail['hp'] = Number(properties_l.find(property => property.property_name === '生命值').final);
	base_detail['attack'] = Number(properties_l.find(property => property.property_name === '攻击力').final);
	base_detail['defence'] = Number(properties_l.find(property => property.property_name === '防御力').final);
	base_detail['ImpactRatio'] = Number(properties_l.find(property => property.property_name === '冲击力').final);
	base_detail['CriticalChanceBase'] = Number(properties_l.find(property => property.property_name === '暴击率').final.replace('%', ''))/100;
	base_detail['CriticalDamageBase'] = Number(properties_l.find(property => property.property_name === '暴击伤害').final.replace('%', ''))/100;
	base_detail['ElementAbnormalPower'] = Number(properties_l.find(property => property.property_name === '异常掌控').final);
	base_detail['ElementMystery'] = Number(properties_l.find(property => property.property_name === '异常精通').final);
	base_detail['PenRatioBase'] = Number(properties_l.find(property => property.property_name === '穿透率').final.replace('%', ''))/100;
	base_detail['SpGetRatio'] = Number(properties_l.find(property => property.property_name === '能量自动回复').final);
	logger.debug('base_detail', base_detail);
	retuan_detail['base_detail'] = base_detail
	
	/** 计算伤害加成与穿透值 
	 *	穿透值23203
	 *	伤害加成31503-31703
	 */
	let bonus_detail = {}
	/** 计算套装数量 */
	let set_detail = {}
	for (let equip_detail of equip){
		bonus_detail['PenDelta'] = await get_let_value(bonus_detail, 'PenDelta') + Number(equip_detail.properties.find(property => property.property_id === 23203)?.base || 0);
		if (equip_detail.equipment_type == 5){
			let propname = propertyData[String(equip_detail.main_properties[0].property_id)][1];
			if (propname.includes('属性伤害提高')) {
				let propenname = propertyData[String(equip_detail.main_properties[0].property_id)][0];
				bonus_detail[propenname] = await get_let_value(bonus_detail, propenname) + Number(equip_detail.main_properties[0].base.replace('%', ''))/100;
			}
		}
		let suit_id = String(equip_detail.equip_suit.suit_id)
		set_detail[suit_id] = await get_let_value(set_detail, suit_id) + 1
	}
	logger.debug('bonus_detail', bonus_detail);
	retuan_detail['bonus_detail'] = bonus_detail
	logger.debug('set_detail', set_detail);
	retuan_detail['set_detail'] = set_detail
	return retuan_detail;
}

export const get_let_value = async (let_list, name) => {
	if (let_list[name]) {
		return let_list[name]
	}
	return 0
}