import { getMapData } from '../../utils/file.js';
import { calculate_damage } from './role.js';
const skilldict = getMapData('SkillData');

export const get_let_value = async (let_list, name) => {
	if (let_list[name]) {
		return let_list[name]
	}
	return 0
}

export const Avatar = async (data, base_detail, bonus_detail) => {
	let damagelist = []
	if (data.id == 1191){
		/** 处理命座加成 */
		if (data.rank >= 1){
			let CriticalChanceBase = await get_let_value(bonus_detail, 'CriticalChanceBase');
			bonus_detail['CriticalChanceBase'] = CriticalChanceBase + 0.12;
		}
		if (data.rank >= 2){
			let ES_CriticalDamageBase = await get_let_value(bonus_detail, 'ES_CriticalDamageBase');
			bonus_detail['ES_CriticalDamageBase'] = ES_CriticalDamageBase + 0.6;
			let EH_CriticalDamageBase = await get_let_value(bonus_detail, 'EH_CriticalDamageBase');
			bonus_detail['EH_CriticalDamageBase'] = EH_CriticalDamageBase + 0.6;
		}
		if (data.rank >= 6){
			let PenRatio = await get_let_value(bonus_detail, 'PenRatioBase');
			bonus_detail['PenRatioBase'] = PenRatio + 0.2;
			
			let C_DmgAdd = await get_let_value(bonus_detail, 'C_DmgAdd');
			bonus_detail['C_DmgAdd'] = C_DmgAdd + 2.5;
		}
		
		/** 处理天赋加成 */
		/** 获取天赋等级与加成倍率 */
		let CDB = await getskilllevelnum(data.id, data.skills, 'T', 'T')
		let C_CriticalDamageBase = await get_let_value(bonus_detail, 'C_CriticalDamageBase');
		bonus_detail['C_CriticalDamageBase'] = C_CriticalDamageBase + CDB;
		let A_CriticalDamageBase = await get_let_value(bonus_detail, 'A_CriticalDamageBase');
		bonus_detail['A_CriticalDamageBase'] = A_CriticalDamageBase + CDB;
		
		let IceDmgAdd = await get_let_value(bonus_detail, 'Ice_DmgAdd');
		bonus_detail['Ice_DmgAdd'] = IceDmgAdd + 0.3;
		
		/** 计算伤害 */
		/** 计算普攻伤害 */
		let skill_multiplier1 = await getskilllevelnum(data.id, data.skills, 'A', 'A')
		let damagelist1 = await calculate_damage(base_detail, bonus_detail, "A", "A", "Ice", skill_multiplier1, data.level)
		let damage1 = {
			title: '普通攻击：急冻修剪法',
			value: damagelist1
		}
		damagelist.push(damage1)
		
		/** 计算冲刺伤害 */
		let skill_multiplier2 = await getskilllevelnum(data.id, data.skills, 'C', 'C')
		let damagelist2 = await calculate_damage(base_detail, bonus_detail, "C", "C", "Ice", skill_multiplier2, data.level)
		let damage2 = {
			title: '冲刺攻击：冰渊潜袭',
			value: damagelist2
		}
		damagelist.push(damage2)
		
		/** 计算特殊技伤害 */
		let skill_multiplier3 = await getskilllevelnum(data.id, data.skills, 'E', 'EH')
		let damagelist3 = await calculate_damage(base_detail, bonus_detail, "E", "EH", "Ice", skill_multiplier3, data.level)
		let damage3 = {
			title: '强化特殊技：横扫',
			value: damagelist3
		}
		damagelist.push(damage3)
		
		let skill_multiplier4 = await getskilllevelnum(data.id, data.skills, 'E', 'ES')
		let damagelist4 = await calculate_damage(base_detail, bonus_detail, "E", "ES", "Ice", skill_multiplier4, data.level)
		let damage4 = {
			title: '强化特殊技：鲨卷风',
			value: damagelist4
		}
		damagelist.push(damage4)
		
		/** 计算连携技伤害 */
		let skill_multiplier5 = await getskilllevelnum(data.id, data.skills, 'R', 'RL')
		let damagelist5 = await calculate_damage(base_detail, bonus_detail, "RL", "RL", "Ice", skill_multiplier5, data.level)
		let damage5 = {
			title: '连携技：雪崩',
			value: damagelist5
		}
		damagelist.push(damage5)
		
		/** 计算终结技伤害 */
		let skill_multiplier6 = await getskilllevelnum(data.id, data.skills, 'R', 'R')
		let damagelist6 = await calculate_damage(base_detail, bonus_detail, "R", "R", "Ice", skill_multiplier6, data.level)
		let damage6 = {
			title: '终结技：永冬狂宴',
			value: damagelist6
		}
		damagelist.push(damage6)
		
		logger.debug('伤害', damagelist);
	}
    return damagelist;
};

export const avatar_ability = async (data, base_detail, bonus_detail) => {
    const damagelist = await Avatar(data, base_detail, bonus_detail);
    return damagelist;
}

export const getskilllevelnum = async (avatarId, skills, skilltype, skillname) => {
	let skill_typeid = 0
	if (skilltype == 'A') skill_typeid = 0;
	else if(skilltype == 'C') skill_typeid = 2;
	else if(skilltype == 'E') skill_typeid = 1;
	else if(skilltype == 'R') skill_typeid = 3;
	else if(skilltype == 'L') skill_typeid = 6;
	else if(skilltype == 'T') skill_typeid = 5;
	let skilllevel = Number(skills.find(property => property.skill_type === skill_typeid)?.level || 1) - 1;
    return skilldict[avatarId][skillname][skilllevel];
}
