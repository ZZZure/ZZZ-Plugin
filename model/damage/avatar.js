import _ from 'lodash';
import { getMapData } from '../../utils/file.js';
import { calculate_damage } from './role.js';
import { ZZZAvatarInfo } from '../avatar.js';
const skilldict = getMapData('SkillData');
/**
 * 角色加成
 * @param {ZZZAvatarInfo} data 角色信息
 * @param {ZZZAvatarInfo['damage_basic_properties']['base_detail']} base_detail 基础属性
 * @param {ZZZAvatarInfo['damage_basic_properties']['bonus_detail']} bonus_detail 套装加成
 * @returns {{
 * title: string,
 * value: {name: string, value: number}[]
 * }[]} 伤害列表
 */
export const avatar_ability = (data, base_detail, bonus_detail) => {
	const damagelist = [];
	switch (data.id) {
		// 艾莲
		case 1191: {
			/** 处理命座加成 */
			if (data.rank >= 1) {
				const CriticalChanceBase = _.get(bonus_detail, 'CriticalChanceBase', 0);
				bonus_detail['CriticalChanceBase'] = CriticalChanceBase + 0.12;
			}
			if (data.rank >= 2) {
				const ES_CriticalDamageBase = _.get(
					bonus_detail,
					'ES_CriticalDamageBase',
					0
				);
				bonus_detail['ES_CriticalDamageBase'] = ES_CriticalDamageBase + 0.6;
				const EH_CriticalDamageBase = _.get(
					bonus_detail,
					'EH_CriticalDamageBase',
					0
				);
				bonus_detail['EH_CriticalDamageBase'] = EH_CriticalDamageBase + 0.6;
			}
			if (data.rank >= 6) {
				const PenRatio = _.get(bonus_detail, 'PenRatioBase', 0);
				bonus_detail['PenRatioBase'] = PenRatio + 0.2;

				const C_DmgAdd = _.get(bonus_detail, 'C_DmgAdd', 0);
				bonus_detail['C_DmgAdd'] = C_DmgAdd + 2.5;
			}

			/** 处理天赋加成 */
			/** 获取天赋等级与加成倍率 */
			const CDB = getskilllevelnum(data.id, data.skills, 'T', 'T');
			const C_CriticalDamageBase = _.get(
				bonus_detail,
				'C_CriticalDamageBase',
				0
			);
			bonus_detail['C_CriticalDamageBase'] = C_CriticalDamageBase + CDB;
			const A_CriticalDamageBase = _.get(
				bonus_detail,
				'A_CriticalDamageBase',
				0
			);
			bonus_detail['A_CriticalDamageBase'] = A_CriticalDamageBase + CDB;

			const IceDmgAdd = _.get(bonus_detail, 'Ice_DmgAdd', 0);
			bonus_detail['Ice_DmgAdd'] = IceDmgAdd + 0.3;

			/** 计算伤害 */
			/** 计算普攻伤害 */
			const skill_multiplier1 = getskilllevelnum(
				data.id,
				data.skills,
				'A',
				'A'
			);
			const damagelist1 = calculate_damage(
				base_detail,
				bonus_detail,
				'A',
				'A',
				'Ice',
				skill_multiplier1,
				data.level
			);
			const damage1 = {
				title: '普通攻击：急冻修剪法',
				value: damagelist1,
			};
			damagelist.push(damage1);

			/** 计算冲刺伤害 */
			const skill_multiplier2 = getskilllevelnum(
				data.id,
				data.skills,
				'C',
				'C'
			);
			const damagelist2 = calculate_damage(
				base_detail,
				bonus_detail,
				'C',
				'C',
				'Ice',
				skill_multiplier2,
				data.level
			);
			const damage2 = {
				title: '冲刺攻击：冰渊潜袭',
				value: damagelist2,
			};
			damagelist.push(damage2);

			/** 计算特殊技伤害 */
			const skill_multiplier3 = getskilllevelnum(
				data.id,
				data.skills,
				'E',
				'EH'
			);
			const damagelist3 = calculate_damage(
				base_detail,
				bonus_detail,
				'EUP',
				'EH',
				'Ice',
				skill_multiplier3,
				data.level
			);
			const damage3 = {
				title: '强化特殊技：横扫',
				value: damagelist3,
			};
			damagelist.push(damage3);

			const skill_multiplier4 = getskilllevelnum(
				data.id,
				data.skills,
				'E',
				'ES'
			);
			const damagelist4 = calculate_damage(
				base_detail,
				bonus_detail,
				'EUP',
				'ES',
				'Ice',
				skill_multiplier4,
				data.level
			);
			const damage4 = {
				title: '强化特殊技：鲨卷风',
				value: damagelist4,
			};
			damagelist.push(damage4);

			/** 计算连携技伤害 */
			const skill_multiplier5 = getskilllevelnum(
				data.id,
				data.skills,
				'R',
				'RL'
			);
			const damagelist5 = calculate_damage(
				base_detail,
				bonus_detail,
				'RL',
				'RL',
				'Ice',
				skill_multiplier5,
				data.level
			);
			const damage5 = {
				title: '连携技：雪崩',
				value: damagelist5,
			};
			damagelist.push(damage5);

			/** 计算终结技伤害 */
			const skill_multiplier6 = getskilllevelnum(
				data.id,
				data.skills,
				'R',
				'R'
			);
			const damagelist6 = calculate_damage(
				base_detail,
				bonus_detail,
				'R',
				'R',
				'Ice',
				skill_multiplier6,
				data.level
			);
			const damage6 = {
				title: '终结技：永冬狂宴',
				value: damagelist6,
			};
			damagelist.push(damage6);
			break;
		}
		// 朱鸢
		case 1241: {
			/** 处理命座加成 */
			if (data.rank >= 2) {
				let A_DmgAdd = _.get(bonus_detail, 'A_DmgAdd', 0);
				bonus_detail['A_DmgAdd'] = A_DmgAdd + 0.5;
				let C_DmgAdd = _.get(bonus_detail, 'C_DmgAdd', 0);
				bonus_detail['C_DmgAdd'] = C_DmgAdd + 0.5;
			}
			if (data.rank >= 4) {
				let Ether_ResistancePenetration = _.get(
					bonus_detail,
					'Ether_ResistancePenetration',
					0
				);
				bonus_detail['Ether_ResistancePenetration'] =
					Ether_ResistancePenetration + 0.25;
			}

			/** 处理天赋加成 */
			/** 获取天赋等级与加成倍率 */
			const DMG_ADD = getskilllevelnum(data.id, data.skills, 'T', 'T');
			let A_DmgAdd = _.get(bonus_detail, 'A_DmgAdd', 0);
			bonus_detail['A_DmgAdd'] = A_DmgAdd + DMG_ADD;

			let C_DmgAdd = _.get(bonus_detail, 'C_DmgAdd', 0);
			bonus_detail['C_DmgAdd'] = C_DmgAdd + DMG_ADD;

			let CriticalChanceBase = _.get(bonus_detail, 'CriticalChanceBase', 0);
			bonus_detail['CriticalChanceBase'] = CriticalChanceBase + 0.3;

			/** 计算伤害 */
			/** 计算普攻伤害 */
			const skill_multiplier1 = getskilllevelnum(
				data.id,
				data.skills,
				'A',
				'A'
			);
			const damagelist1 = calculate_damage(
				base_detail,
				bonus_detail,
				'A',
				'A',
				'Ether',
				skill_multiplier1,
				data.level
			);
			const damage1 = {
				title: '普通攻击：请勿抵抗',
				value: damagelist1,
			};
			damagelist.push(damage1);

			/** 计算冲刺伤害 */
			const skill_multiplier2 = getskilllevelnum(
				data.id,
				data.skills,
				'C',
				'C'
			);
			const damagelist2 = calculate_damage(
				base_detail,
				bonus_detail,
				'C',
				'C',
				'Ether',
				skill_multiplier2,
				data.level
			);
			const damage2 = {
				title: '冲刺攻击：火力压制',
				value: damagelist2,
			};
			damagelist.push(damage2);

			/** 计算强化特殊技伤害 */
			const skill_multiplier3 = getskilllevelnum(
				data.id,
				data.skills,
				'E',
				'EUP'
			);
			let damagelist3 = calculate_damage(
				base_detail,
				bonus_detail,
				'EUP',
				'EUP',
				'Ether',
				skill_multiplier3,
				data.level
			);
			if (data.rank >= 6) {
				let damagelist_add = calculate_damage(
					base_detail,
					bonus_detail,
					'EUP',
					'EUP',
					'Ether',
					2.2,
					data.level
				);
				damagelist3['cd'] = damagelist3['cd'] + damagelist_add['cd'] * 4;
				damagelist3['qw'] = damagelist3['qw'] + damagelist_add['qw'] * 4;
			}
			const damage3 = {
				title: '强化特殊技：全弹连射',
				value: damagelist3,
			};
			damagelist.push(damage3);

			/** 计算连携技伤害 */
			const skill_multiplier4 = getskilllevelnum(
				data.id,
				data.skills,
				'R',
				'RL'
			);
			const damagelist4 = calculate_damage(
				base_detail,
				bonus_detail,
				'RL',
				'RL',
				'Ether',
				skill_multiplier4,
				data.level
			);
			const damage4 = {
				title: '连携技：歼灭模式',
				value: damagelist4,
			};
			damagelist.push(damage4);

			/** 计算终结技伤害 */
			const skill_multiplier5 = getskilllevelnum(
				data.id,
				data.skills,
				'R',
				'R'
			);
			const damagelist5 = calculate_damage(
				base_detail,
				bonus_detail,
				'R',
				'R',
				'Ether',
				skill_multiplier5,
				data.level
			);
			const damage5 = {
				title: '终结技：歼灭模式MAX',
				value: damagelist5,
			};
			damagelist.push(damage5);
			break;
		}
		// 11号
		case 1041: {
			/** 处理命座加成 */
			if (data.rank >= 2) {
				let A_DmgAdd = _.get(bonus_detail, 'A_DmgAdd', 0);
				bonus_detail['A_DmgAdd'] = A_DmgAdd + 0.36;
				let C_DmgAdd = _.get(bonus_detail, 'C_DmgAdd', 0);
				bonus_detail['C_DmgAdd'] = C_DmgAdd + 0.36;
			}
			if (data.rank >= 6) {
				let A_ResistancePenetration = _.get(bonus_detail, 'A_ResistancePenetration', 0);
				bonus_detail['A_ResistancePenetration'] = A_ResistancePenetration + 0.25;
				let C_ResistancePenetration = _.get(bonus_detail, 'C_ResistancePenetration', 0);
				bonus_detail['C_ResistancePenetration'] = C_ResistancePenetration + 0.25;
			}

			/** 处理天赋加成 */
			/** 获取天赋等级与加成倍率 */
			const DMG_ADD = getskilllevelnum(data.id, data.skills, 'T', 'T');
			let A_DmgAdd = _.get(bonus_detail, 'A_DmgAdd', 0);
			bonus_detail['A_DmgAdd'] = A_DmgAdd + DMG_ADD;
			let C_DmgAdd = _.get(bonus_detail, 'C_DmgAdd', 0);
			bonus_detail['C_DmgAdd'] = C_DmgAdd + DMG_ADD;

			let Fire_DmgAdd = _.get(bonus_detail, 'Fire_DmgAdd', 0);
			bonus_detail['Fire_DmgAdd'] = Fire_DmgAdd + 0.1;

			/** 计算伤害 */
			/** 计算普攻伤害 */
			const skill_multiplier1 = getskilllevelnum(data.id, data.skills, 'A', 'A');
			const damagelist1 = calculate_damage(base_detail, bonus_detail, 'A', 'A', 'Fire', skill_multiplier1, data.level);
			const damage1 = {
				title: '普通攻击：火力镇压',
				value: damagelist1,
			};
			damagelist.push(damage1);

			/** 计算冲刺伤害 */
			const skill_multiplier2 = getskilllevelnum(data.id, data.skills, 'C', 'C');
			const damagelist2 = calculate_damage(base_detail, bonus_detail, 'C', 'C', 'Fire', skill_multiplier2, data.level);
			const damage2 = {
				title: '闪避反击：逆火',
				value: damagelist2,
			};
			damagelist.push(damage2);

			/** 计算强化特殊技伤害 */
			const skill_multiplier3 = getskilllevelnum(data.id, data.skills, 'E', 'E');
			let damagelist3 = calculate_damage(base_detail, bonus_detail, 'E', 'E', 'Fire', skill_multiplier3, data.level);
			const damage3 = {
				title: '强化特殊技：盛燃烈火',
				value: damagelist3,
			};
			damagelist.push(damage3);

			/** 计算连携技伤害 */
			const skill_multiplier4 = getskilllevelnum(data.id, data.skills, 'R', 'RL');
			const damagelist4 = calculate_damage(base_detail, bonus_detail, 'RL', 'RL', 'Fire', skill_multiplier4, data.level);
			const damage4 = {
				title: '连携技：昂扬烈焰',
				value: damagelist4,
			};
			damagelist.push(damage4);

			/** 计算终结技伤害 */
			const skill_multiplier5 = getskilllevelnum(data.id, data.skills, 'R', 'R');
			const damagelist5 = calculate_damage(base_detail, bonus_detail, 'R', 'R', 'Fire', skill_multiplier5, data.level);
			const damage5 = {
				title: '终结技：轰鸣烈焰',
				value: damagelist5,
			};
			damagelist.push(damage5);
			break;
		}
		// 青衣
		case 1251: {
			/** 处理命座加成 */
			if (data.rank >= 1) {
				let ignore_defence = _.get(bonus_detail, 'ignore_defence', 0);
				bonus_detail['ignore_defence'] = ignore_defence + 0.15;
				let CriticalChanceBase = _.get(bonus_detail, 'CriticalChanceBase', 0);
				bonus_detail['CriticalChanceBase'] = CriticalChanceBase + 0.2;
			}
			if (data.rank >= 2) {
				let T_stundmgmultiplier = _.get(bonus_detail, 'T_stundmgmultiplier', 0);
				bonus_detail['T_stundmgmultiplier'] = T_stundmgmultiplier * 1.35;
			}
			if (data.rank >= 6) {
				let All_ResistancePenetration = _.get(bonus_detail, 'All_ResistancePenetration', 0);
				bonus_detail['All_ResistancePenetration'] = All_ResistancePenetration + 0.20;
				let A_CriticalDamageBase = _.get(bonus_detail, 'A_CriticalDamageBase', 0);
				bonus_detail['A_CriticalDamageBase'] = A_CriticalDamageBase + 1;
			}

			/** 处理天赋加成 */
			/** 获取天赋等级与加成倍率 */
			const TF = getskilllevelnum(data.id, data.skills, 'T', 'T');
			let stundmgmultiplier = _.get(bonus_detail, 'stundmgmultiplier', 0);
			bonus_detail['stundmgmultiplier'] = stundmgmultiplier + TF * 20;
			let ImpactRatio = _.get(bonus_detail, 'ImpactRatio', 0);
			if (ImpactRatio > 120) {
				if (ImpactRatio >= 220) {
					let AttackDelta = _.get(bonus_detail, 'AttackDelta', 0);
					bonus_detail['AttackDelta'] = AttackDelta + 600;
				} else {
					let AttackDelta = _.get(bonus_detail, 'AttackDelta', 0);
					bonus_detail['AttackDelta'] = (AttackDelta - 120) * 6;
				}
			}

			/** 计算伤害 */
			/** 计算普攻伤害 */
			const skill_multiplier1 = getskilllevelnum(data.id, data.skills, 'A', 'A');
			const damagelist1 = calculate_damage(base_detail, bonus_detail, 'A', 'A', 'Electric', skill_multiplier1, data.level);
			const damage1 = {
				title: '普通攻击：醉花月云转',
				value: damagelist1,
			};
			damagelist.push(damage1);

			/** 计算冲刺伤害 */
			const skill_multiplier2 = getskilllevelnum(data.id, data.skills, 'C', 'C');
			const damagelist2 = calculate_damage(base_detail, bonus_detail, 'C', 'C', 'Electric', skill_multiplier2, data.level);
			const damage2 = {
				title: '闪避反击：意不尽',
				value: damagelist2,
			};
			damagelist.push(damage2);

			/** 计算强化特殊技伤害 */
			const skill_multiplier3 = getskilllevelnum(data.id, data.skills, 'E', 'E');
			let damagelist3 = calculate_damage(base_detail, bonus_detail, 'E', 'E', 'Ether', skill_multiplier3, data.level);
			const damage3 = {
				title: '强化特殊技：月上海棠',
				value: damagelist3,
			};
			damagelist.push(damage3);

			/** 计算连携技伤害 */
			const skill_multiplier4 = getskilllevelnum(data.id, data.skills, 'R', 'RL');
			const damagelist4 = calculate_damage(base_detail, bonus_detail, 'RL', 'RL', 'Electric', skill_multiplier4, data.level);
			const damage4 = {
				title: '连携技：太平令',
				value: damagelist4,
			};
			damagelist.push(damage4);

			/** 计算终结技伤害 */
			const skill_multiplier5 = getskilllevelnum(data.id, data.skills, 'R', 'R');
			const damagelist5 = calculate_damage(base_detail, bonus_detail, 'R', 'R', 'Electric', skill_multiplier5, data.level);
			const damage5 = {
				title: '终结技：八声甘州',
				value: damagelist5,
			};
			damagelist.push(damage5);
			break;
		}
		// 猫又
		case 1021: {
			/** 处理命座加成 */
			if (data.rank >= 1) {
				let Physical_ResistancePenetration = _.get(bonus_detail, 'Physical_ResistancePenetration', 0);
				bonus_detail['Physical_ResistancePenetration'] = Physical_ResistancePenetration + 0.16;
			}
			if (data.rank >= 4) {
				let CriticalChanceBase = _.get(bonus_detail, 'CriticalChanceBase', 0);
				bonus_detail['CriticalChanceBase'] = CriticalChanceBase * 0.14;
			}
			if (data.rank >= 6) {
				let CriticalDamageBase = _.get(bonus_detail, 'CriticalDamageBase', 0);
				bonus_detail['CriticalDamageBase'] = CriticalDamageBase + 0.54;
			}

			/** 处理天赋加成 */
			/** 获取天赋等级与加成倍率 */
			const TF = getskilllevelnum(data.id, data.skills, 'T', 'T');
			let DmgAdd = _.get(bonus_detail, 'DmgAdd', 0);
			bonus_detail['DmgAdd'] = DmgAdd + TF;
			let E_DmgAdd = _.get(bonus_detail, 'E_DmgAdd', 0);
			bonus_detail['E_DmgAdd'] = E_DmgAdd + 0.7;

			/** 计算伤害 */
			/** 计算普攻伤害 */
			const skill_multiplier1 = getskilllevelnum(data.id, data.skills, 'A', 'A');
			const damagelist1 = calculate_damage(base_detail, bonus_detail, 'A', 'A', 'Physical', skill_multiplier1, data.level);
			const damage1 = {
				title: '普通攻击：猫猫爪刺',
				value: damagelist1,
			};
			damagelist.push(damage1);

			/** 计算冲刺伤害 */
			const skill_multiplier2 = getskilllevelnum(data.id, data.skills, 'C', 'C');
			const damagelist2 = calculate_damage(base_detail, bonus_detail, 'C', 'C', 'Physical', skill_multiplier2, data.level);
			const damage2 = {
				title: '闪避反击：虚影双刺',
				value: damagelist2,
			};
			damagelist.push(damage2);

			/** 计算强化特殊技伤害 */
			const skill_multiplier3 = getskilllevelnum(data.id, data.skills, 'E', 'E');
			let damagelist3 = calculate_damage(base_detail, bonus_detail, 'E', 'E', 'Physical', skill_multiplier3, data.level);
			const damage3 = {
				title: '强化特殊技：超~凶奇袭！',
				value: damagelist3,
			};
			damagelist.push(damage3);

			/** 计算连携技伤害 */
			const skill_multiplier4 = getskilllevelnum(data.id, data.skills, 'R', 'RL');
			const damagelist4 = calculate_damage(base_detail, bonus_detail, 'RL', 'RL', 'Physical', skill_multiplier4, data.level);
			const damage4 = {
				title: '连携技：刃爪挥击',
				value: damagelist4,
			};
			damagelist.push(damage4);

			/** 计算终结技伤害 */
			const skill_multiplier5 = getskilllevelnum(data.id, data.skills, 'R', 'R');
			const damagelist5 = calculate_damage(base_detail, bonus_detail, 'R', 'R', 'Physical', skill_multiplier5, data.level);
			const damage5 = {
				title: '终结技：刃爪强袭',
				value: damagelist5,
			};
			damagelist.push(damage5);
			break;
		}
		// 安东
		case 1111: {
			/** 处理命座加成 */
			if (data.rank >= 4) {
				let CriticalChanceBase = _.get(bonus_detail, 'CriticalChanceBase', 0);
				bonus_detail['CriticalChanceBase'] = CriticalChanceBase + 0.1;
			}
			if (data.rank >= 6) {
				let A_DmgAdd = _.get(bonus_detail, 'A_DmgAdd', 0);
				bonus_detail['A_DmgAdd'] = A_DmgAdd + 0.24;
				let C_DmgAdd = _.get(bonus_detail, 'C_DmgAdd', 0);
				bonus_detail['C_DmgAdd'] = C_DmgAdd + 0.24;
			}

			/** 处理天赋加成 */
			/** 获取天赋等级与加成倍率 */
			const TF = getskilllevelnum(data.id, data.skills, 'T', 'T');
			const TF2 = getskilllevelnum(data.id, data.skills, 'T', 'T2');

			let A_DmgAdd = _.get(bonus_detail, 'A_DmgAdd', 0);
			bonus_detail['A_DmgAdd'] = A_DmgAdd + TF2;
			let C_DmgAdd = _.get(bonus_detail, 'C_DmgAdd', 0);
			bonus_detail['C_DmgAdd'] = C_DmgAdd + TF2;

			let E_DmgAdd = _.get(bonus_detail, 'E_DmgAdd', 0);
			bonus_detail['E_DmgAdd'] = E_DmgAdd + TF;
			let L_DmgAdd = _.get(bonus_detail, 'L_DmgAdd', 0);
			bonus_detail['L_DmgAdd'] = L_DmgAdd + TF;
			let R_DmgAdd = _.get(bonus_detail, 'R_DmgAdd', 0);
			bonus_detail['R_DmgAdd'] = R_DmgAdd + TF;

			/** 计算伤害 */
			/** 计算普攻伤害 */
			const skill_multiplier1 = getskilllevelnum(data.id, data.skills, 'A', 'A');
			const damagelist1 = calculate_damage(base_detail, bonus_detail, 'A', 'A', 'Electric', skill_multiplier1, data.level);
			const damage1 = {
				title: '普通攻击：热血上工操',
				value: damagelist1,
			};
			damagelist.push(damage1);

			/** 计算冲刺伤害 */
			const skill_multiplier2 = getskilllevelnum(data.id, data.skills, 'C', 'C');
			const damagelist2 = calculate_damage(base_detail, bonus_detail, 'C', 'C', 'Electric', skill_multiplier2, data.level);
			const damage2 = {
				title: '闪避反击：过载钻击',
				value: damagelist2,
			};
			damagelist.push(damage2);

			/** 计算强化特殊技伤害 */
			const skill_multiplier3 = getskilllevelnum(data.id, data.skills, 'E', 'E');
			let damagelist3 = calculate_damage(base_detail, bonus_detail, 'E', 'E', 'Electric', skill_multiplier3, data.level);
			const damage3 = {
				title: '特殊技：爆发钻击',
				value: damagelist3,
			};
			damagelist.push(damage3);

			/** 计算连携技伤害 */
			const skill_multiplier4 = getskilllevelnum(data.id, data.skills, 'R', 'RL');
			const damagelist4 = calculate_damage(base_detail, bonus_detail, 'RL', 'RL', 'Electric', skill_multiplier4, data.level);
			const damage4 = {
				title: '连携技：转转转！',
				value: damagelist4,
			};
			damagelist.push(damage4);

			/** 计算终结技伤害 */
			const skill_multiplier5 = getskilllevelnum(data.id, data.skills, 'R', 'R');
			const damagelist5 = calculate_damage(base_detail, bonus_detail, 'R', 'R', 'Electric', skill_multiplier5, data.level);
			const damage5 = {
				title: '终结技：转转转转转！',
				value: damagelist5,
			};
			damagelist.push(damage5);
			break;
		}
		// 星见雅
		case 1091: {
			/** 处理命座加成 */
			if (data.rank >= 1) {
				const AUP_IgnoreDefence = _.get(bonus_detail, 'AUP_IgnoreDefence', 0)
				bonus_detail['AUP_IgnoreDefence'] = AUP_IgnoreDefence + 0.36
			}
			if (data.rank >= 2) {
				const A_DmgAdd = _.get(bonus_detail, 'A_DmgAdd', 0)
				bonus_detail['A_DmgAdd'] = A_DmgAdd + 0.30
				const C_DmgAdd = _.get(bonus_detail, 'C_DmgAdd', 0)
				bonus_detail['C_DmgAdd'] = C_DmgAdd + 0.30
				const CriticalChanceBase = _.get(bonus_detail, 'CriticalChanceBase', 0)
				bonus_detail['CriticalChanceBase'] = CriticalChanceBase + 0.15
			}
			if (data.rank >= 4) {
				const TP_DmgAdd = _.get(bonus_detail, 'TP_DmgAdd', 0)
				bonus_detail['TP_DmgAdd'] = TP_DmgAdd + 0.3
			}
			if (data.rank >= 6) {
				const AUP_DmgAdd = _.get(bonus_detail, 'AUP_DmgAdd', 0)
				bonus_detail['AUP_DmgAdd'] = AUP_DmgAdd + 0.3
			}

			/** 处理天赋加成 */
			/** 获取天赋等级与加成倍率 */
			const AUP_DmgAdd = _.get(bonus_detail, 'AUP_DmgAdd', 0)
			bonus_detail['AUP_DmgAdd'] = AUP_DmgAdd + 0.6
			const AUP_ResistancePenetration = _.get(bonus_detail, 'AUP_ResistancePenetration', 0)
			bonus_detail['AUP_ResistancePenetration'] = AUP_ResistancePenetration + 0.3 // 紊乱无视冰抗
			const R_DmgAdd = _.get(bonus_detail, 'R_DmgAdd', 0) // 终结技30%冰伤加成
			bonus_detail['R_DmgAdd'] = R_DmgAdd + 0.3

			logger.debug('最终bonus_detail', bonus_detail)
			/** 计算伤害 */
			/** 计算普攻伤害 */
			const A_multiplier = getskilllevelnum(data.id, data.skills, 'A', 'A')
			const A_damage = calculate_damage(base_detail, bonus_detail, 'A', 'A', 'Ice', A_multiplier, data.level)
			damagelist.push({
				title: '普通攻击：风花五段',
				value: A_damage,
			})

			/** 计算闪避反击伤害 */
			const C_multiplier = getskilllevelnum(data.id, data.skills, 'C', 'C')
			const C_damage = calculate_damage(base_detail, bonus_detail, 'C', 'C', 'Ice', C_multiplier, data.level)
			damagelist.push({
				title: '闪避反击：寒雀',
				value: C_damage,
			})

			/** 计算霜灼·破伤害 */
			const TP_multiplier = getskilllevelnum(data.id, data.skills, 'T', 'TP')
			const TP_damage = calculate_damage(base_detail, bonus_detail, 'TP', 'TP', 'Ice', TP_multiplier, data.level)
			damagelist.push({
				title: '霜灼·破',
				value: TP_damage,
			})

			/** 计算蓄力攻击伤害 */
			const AUP1_multiplier = getskilllevelnum(data.id, data.skills, 'A', 'AUP1')
			const AUP1_damage = calculate_damage(base_detail, bonus_detail, 'AUP', 'AUP1', 'Ice', AUP1_multiplier, data.level)
			damagelist.push({
				title: '蓄力攻击：一段蓄',
				value: AUP1_damage,
			})
			const AUP2_multiplier = getskilllevelnum(data.id, data.skills, 'A', 'AUP2')
			const AUP2_damage = calculate_damage(base_detail, bonus_detail, 'AUP', 'AUP2', 'Ice', AUP2_multiplier, data.level)
			if (data.rank >= 6) { // 6命累加蓄力伤害
				AUP2_damage['cd'] += AUP1_damage['cd']
				AUP2_damage['qw'] += AUP1_damage['qw']
			}
			damagelist.push({
				title: '蓄力攻击：二段蓄',
				value: AUP2_damage,
			})
			const AUP3_multiplier = getskilllevelnum(data.id, data.skills, 'A', 'AUP3')
			const AUP3_damage = calculate_damage(base_detail, bonus_detail, 'AUP', 'AUP3', 'Ice', AUP3_multiplier, data.level)
			if (data.rank >= 6) {
				AUP3_damage['cd'] += AUP2_damage['cd']
				AUP3_damage['qw'] += AUP2_damage['qw']
			}
			damagelist.push({
				title: '蓄力攻击：三段蓄',
				value: AUP3_damage,
			})

			/** 计算特殊技伤害 */
			const E_multiplier = getskilllevelnum(data.id, data.skills, 'E', 'EF')
			const E_damage = calculate_damage(base_detail, bonus_detail, 'EUP', 'EF', 'Ice', E_multiplier, data.level)
			damagelist.push({
				title: '强化特殊技：飞雪',
				value: E_damage,
			})

			const EZ_multiplier = getskilllevelnum(data.id, data.skills, 'E', 'EF2')
			const EZ_damage = calculate_damage(base_detail, bonus_detail, 'EUP', 'EF2', 'Ice', EZ_multiplier, data.level)
			damagelist.push({
				title: '强化特殊技：飞雪（二段）',
				value: EZ_damage,
			})

			/** 计算连携技伤害 */
			const RL_multiplier = getskilllevelnum(data.id, data.skills, 'R', 'RL')
			const RL_damage = calculate_damage(base_detail, bonus_detail, 'RL', 'RL', 'Ice', RL_multiplier, data.level)
			damagelist.push({
				title: '连携技：春临',
				value: RL_damage,
			})

			/** 计算终结技伤害 */
			const R_multiplier = getskilllevelnum(data.id, data.skills, 'R', 'R')
			const R_damage = calculate_damage(base_detail, bonus_detail, 'R', 'R', 'Ice', R_multiplier, data.level)
			damagelist.push({
				title: '终结技：名残雪',
				value: R_damage,
			})
			break
		}
	}
	logger.debug(logger.green(data.name_mi18n + '伤害：'), damagelist)
	return damagelist
};

export const getskilllevelnum = (avatarId, skills, skilltype, skillname) => {
	let skill_typeid = 0;
	if (skilltype == 'A') skill_typeid = 0;
	else if (skilltype == 'C') skill_typeid = 2;
	else if (skilltype == 'E') skill_typeid = 1;
	else if (skilltype == 'R') skill_typeid = 3;
	else if (skilltype == 'L') skill_typeid = 6;
	else if (skilltype == 'T') skill_typeid = 5;
	let skilllevel =
		Number(
			skills.find(property => property.skill_type === skill_typeid)?.level || 1
		) - 1;
	return skilldict[avatarId][skillname][skilllevel];
};

export const has_calculation = avatarId => {
	return Object.keys(skilldict).includes(avatarId.toString());
};
