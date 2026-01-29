import { baseValueData, formatScoreWeight } from '../../lib/score.js';
import { rarityEnum, professionEnum } from '../damage/BuffManager.js';
import { idToName } from '../../lib/convert/property.js';
import { getMapData } from '../../utils/file.js';
import { scoreFnc } from '../damage/avatar.js';
import { char } from '../../lib/convert.js';
const equipScore = getMapData('EquipScore');
for (const charName in equipScore) {
    const charID = +charName || char.aliasToId(charName);
    if (!charID) {
        logger.warn(`驱动盘评分：未找到角色${charName}的角色ID`);
        delete equipScore[charName];
        continue;
    }
    equipScore[charID] = equipScore[charName];
    delete equipScore[charName];
}
const mainStats = getMapData('EquipMainStats');
const subStats = Object.keys(baseValueData).map(Number);
export default class Score {
    equip;
    weight;
    partition;
    userMainStat;
    constructor(equip, weight) {
        this.equip = equip;
        this.weight = weight;
        this.partition = this.equip.equipment_type;
        this.userMainStat = this.equip.main_properties[0].property_id;
    }
    get_level_multiplier() {
        return (0.25 + +this.equip.level * 0.05) || 1;
    }
    get_rarity_multiplier() {
        switch (rarityEnum[this.equip.rarity]) {
            case rarityEnum.S:
                return 1;
            case rarityEnum.A:
                return 2 / 3;
            case rarityEnum.B:
                return 1 / 3;
            default:
                return 1;
        }
    }
    get_max_count() {
        const subMaxStats = subStats
            .filter(p => p !== this.userMainStat && this.weight[p])
            .sort((a, b) => this.weight[b] - this.weight[a]).slice(0, 4);
        if (!subMaxStats.length)
            return 0;
        logger.debug(`[${this.partition}号位]理论副词条：` + subMaxStats.map(idToName).reduce((a, p, i) => a + `${p}*${this.weight[subMaxStats[i]].toFixed(2)} `, ''));
        let count = this.weight[subMaxStats[0]] * 6;
        subMaxStats.slice(1).forEach(p => count += this.weight[p] || 0);
        logger.debug(`[${this.partition}号位]理论词条数：${logger.blue(count)}`);
        return count;
    }
    get_actual_count() {
        let count = 0;
        for (const prop of this.equip.properties) {
            const propID = prop.property_id;
            const weight = this.weight[propID];
            if (weight) {
                logger.debug(`[${this.partition}号位]实际副词条：${idToName(propID)} ${logger.green(prop.count + 1)}*${weight}`);
                count += weight * (prop.count + 1);
            }
        }
        logger.debug(`[${this.partition}号位]实际词条数：${logger.blue(count)}`);
        return count;
    }
    get_score() {
        const rarity_multiplier = this.get_rarity_multiplier();
        const level_multiplier = this.get_level_multiplier();
        const actual_count = this.get_actual_count();
        const max_count = this.get_max_count();
        if (max_count === 0)
            return 0;
        if (this.partition <= 3) {
            const min_score = 12 * level_multiplier * rarity_multiplier;
            if (actual_count === 0) {
                return min_score;
            }
            const score = actual_count / max_count * level_multiplier * rarity_multiplier * 55;
            logger.debug(`[${this.partition}号位] ${logger.magenta(`${actual_count} / ${max_count} * ${level_multiplier} * ${rarity_multiplier} * 55 = ${score}`)}`);
            return Math.max(score, min_score);
        }
        const mainMaxStat = mainStats[this.partition]
            .filter(p => this.weight[p])
            .sort((a, b) => this.weight[b] - this.weight[a])[0];
        const mainScore = mainMaxStat ? 12 * (this.weight[this.userMainStat] || 0) / this.weight[mainMaxStat] : 12;
        const subScore = actual_count / max_count * 43;
        const score = (mainScore + subScore) * level_multiplier * rarity_multiplier;
        logger.debug(`[${this.partition}号位] ${logger.magenta(`(${mainScore} + ${subScore}) * ${level_multiplier} * ${rarity_multiplier} = ${score}`)}`);
        return score;
    }
    static main(equip, weight) {
        try {
            return new Score(equip, weight).get_score();
        }
        catch (err) {
            logger.error('角色驱动盘评分计算错误：', err);
            return 0;
        }
    }
    static getFinalWeight(avatar) {
        let def_weight = equipScore[avatar.id];
        if (!def_weight && !scoreFnc[avatar.id]) {
            switch (avatar.avatar_profession) {
                case professionEnum.强攻:
                    def_weight = ['主C·双爆'];
                    break;
                case professionEnum.击破:
                    def_weight = ['冲击·双爆', '冲击·攻击'];
                    break;
                case professionEnum.异常:
                    def_weight = ['主C·异常', '辅助·异常'];
                    break;
                case professionEnum.支援:
                case professionEnum.防护:
                    def_weight = ['辅助·双爆', '辅助·异常'];
                    break;
                case professionEnum.命破:
                    def_weight = ['命破·双爆'];
                    break;
            }
        }
        const delRules = (rules) => {
            if (rules.length === 1) {
                rule_name = rules[0];
                final_weight = predefinedWeights[rules[0]]?.value;
            }
            else {
                for (const name of rules) {
                    if (predefinedWeights[name]?.rule(avatar)) {
                        rule_name = name;
                        final_weight = predefinedWeights[name].value;
                        break;
                    }
                }
                if (!final_weight) {
                    for (const name of rules) {
                        if (predefinedWeights[name]) {
                            rule_name = name;
                            final_weight = predefinedWeights[name].value;
                            break;
                        }
                    }
                }
            }
            final_weight = { ...final_weight };
        };
        let rule_name = '默认', final_weight;
        if (Array.isArray(def_weight)) {
            delRules(def_weight);
        }
        else if (def_weight.rules) {
            const { rules, ...rest } = def_weight;
            delRules(rules);
            if (Object.keys(rest).length) {
                rule_name += '·改';
                Object.assign(final_weight, rest);
            }
        }
        else {
            final_weight = def_weight;
        }
        final_weight = formatScoreWeight(final_weight, avatar.id);
        const calc_weight = scoreFnc[avatar.id] && scoreFnc[avatar.id](avatar);
        if (calc_weight) {
            rule_name = calc_weight[0];
            final_weight = { ...final_weight, ...formatScoreWeight(calc_weight[1], avatar.id) };
        }
        for (const [small, big, name] of [[11103, 11102, 'HP'], [12103, 12102, 'ATK'], [13103, 13102, 'DEF']]) {
            if (final_weight[big]) {
                final_weight[small] ??= +(baseValueData[small] * 100 / (baseValueData[big] * avatar.base_properties[name]) * final_weight[big]).toFixed(2);
            }
        }
        return [rule_name, final_weight];
    }
}
const predefinedWeights = {
    主C·双爆: {
        rule: (avatar) => {
            const { ATK, CRITRate, CRITDMG, AnomalyMastery, AnomalyProficiency } = avatar.initial_properties;
            return ATK > 2400 && CRITRate * 2 + CRITDMG >= 2.2 && AnomalyMastery < 150 && AnomalyProficiency < 200;
        },
        value: {
            "生命值百分比": 0,
            "攻击力百分比": 0.75,
            "防御力百分比": 0,
            "冲击力": 0,
            "暴击率": 1,
            "暴击伤害": 1,
            "穿透率": 1,
            "穿透值": 0.25,
            "能量自动回复": 0,
            "异常精通": 0,
            "异常掌控": 0,
            "属性伤害加成": 1
        }
    },
    主C·异常: {
        rule: (avatar) => {
            const { ATK, CRITRate, CRITDMG, AnomalyMastery, AnomalyProficiency } = avatar.initial_properties;
            if (CRITRate * 2 + CRITDMG >= 2)
                return false;
            if (ATK < 2400)
                return false;
            if (AnomalyMastery >= 180 && AnomalyProficiency >= 200)
                return true;
            if (AnomalyMastery >= 120 && AnomalyProficiency >= 300)
                return true;
            if (AnomalyMastery >= 150 && AnomalyProficiency >= 250)
                return true;
            return false;
        },
        value: {
            "生命值百分比": 0,
            "攻击力百分比": 0.75,
            "防御力百分比": 0,
            "冲击力": 0,
            "暴击率": 0,
            "暴击伤害": 0,
            "穿透率": 1,
            "穿透值": 0.25,
            "能量自动回复": 0,
            "异常精通": 1,
            "异常掌控": 1,
            "属性伤害加成": 1
        }
    },
    命破·双爆: {
        rule: (avatar) => {
            return true;
        },
        value: {
            "生命值百分比": 0.5,
            "攻击力百分比": 0.25,
            "防御力百分比": 0,
            "冲击力": 0,
            "暴击率": 1,
            "暴击伤害": 1,
            "穿透率": 0,
            "穿透值": 0,
            "能量自动回复": 0,
            "异常精通": 0,
            "异常掌控": 0,
            "属性伤害加成": 1
        }
    },
    辅助·双爆: {
        rule: (avatar) => {
            const { CRITRate, CRITDMG, AnomalyProficiency } = avatar.initial_properties;
            return CRITRate * 2 + CRITDMG >= 1.5 && AnomalyProficiency < 200;
        },
        value: {
            "生命值百分比": 0,
            "攻击力百分比": 0.75,
            "防御力百分比": 0,
            "冲击力": 0,
            "暴击率": 1,
            "暴击伤害": 1,
            "穿透率": 0.75,
            "穿透值": 0.25,
            "能量自动回复": 1,
            "异常精通": 0,
            "异常掌控": 0,
            "属性伤害加成": 1
        }
    },
    辅助·攻击: {
        rule: (avatar) => {
            const { CRITRate, CRITDMG } = avatar.initial_properties;
            return CRITRate * 2 + CRITDMG >= 1.5;
        },
        value: {
            "生命值百分比": 0,
            "攻击力百分比": 1,
            "防御力百分比": 0,
            "冲击力": 0,
            "暴击率": 1,
            "暴击伤害": 0.75,
            "穿透率": 0.75,
            "穿透值": 0.25,
            "能量自动回复": 1,
            "异常精通": 0,
            "异常掌控": 0,
            "属性伤害加成": 1
        }
    },
    辅助·异常: {
        rule: (avatar) => {
            const { CRITRate, CRITDMG, AnomalyProficiency } = avatar.initial_properties;
            return CRITRate * 2 + CRITDMG < 2 && AnomalyProficiency >= 200;
        },
        value: {
            "生命值百分比": 0,
            "攻击力百分比": 0.75,
            "防御力百分比": 0,
            "冲击力": 0,
            "暴击率": 0,
            "暴击伤害": 0,
            "穿透率": 0.75,
            "穿透值": 0.25,
            "能量自动回复": 1,
            "异常精通": 1,
            "异常掌控": 1,
            "属性伤害加成": 1
        }
    },
    冲击·双爆: {
        rule: (avatar) => {
            const { CRITRate, CRITDMG } = avatar.initial_properties;
            return CRITRate * 2 + CRITDMG >= 1.5;
        },
        value: {
            "生命值百分比": 0,
            "攻击力百分比": 0.75,
            "防御力百分比": 0,
            "冲击力": 1,
            "暴击率": 1,
            "暴击伤害": 1,
            "穿透率": 0.75,
            "穿透值": 0.25,
            "能量自动回复": 0,
            "异常精通": 0,
            "异常掌控": 0,
            "属性伤害加成": 1
        }
    },
    冲击·攻击: {
        rule: (avatar) => {
            const { ATK, CRITRate, CRITDMG } = avatar.initial_properties;
            return ATK > 2000 && CRITRate * 2 + CRITDMG >= 1;
        },
        value: {
            "生命值百分比": 0,
            "攻击力百分比": 1,
            "防御力百分比": 0,
            "冲击力": 1,
            "暴击率": 1,
            "暴击伤害": 0.75,
            "穿透率": 0.75,
            "穿透值": 0.25,
            "能量自动回复": 0,
            "异常精通": 0,
            "异常掌控": 0,
            "属性伤害加成": 1
        }
    },
};
//# sourceMappingURL=Score.js.map