import { baseValueData, scoreData } from '../../lib/score.js';
import { idToName } from '../../lib/convert/property.js';
import { getMapData } from '../../utils/file.js';
var rarity;
(function (rarity) {
    rarity[rarity["S"] = 0] = "S";
    rarity[rarity["A"] = 1] = "A";
    rarity[rarity["B"] = 2] = "B";
})(rarity || (rarity = {}));
const mainStats = getMapData('EquipMainStats');
const subStats = Object.keys(baseValueData).map(Number);
export default class Score {
    scoreData;
    equip;
    partition;
    userMainStat;
    constructor(charID, equip) {
        this.scoreData = scoreData[charID];
        this.equip = equip;
        this.partition = this.equip.equipment_type;
        this.userMainStat = this.equip.main_properties[0].property_id;
    }
    get_level_multiplier() {
        return (0.25 + +this.equip.level * 0.05) || 1;
    }
    get_rarity_multiplier() {
        switch (rarity[this.equip.rarity]) {
            case rarity.S:
                return 1;
            case rarity.A:
                return 2 / 3;
            case rarity.B:
                return 1 / 3;
            default:
                return 1;
        }
    }
    get_max_count() {
        const subMaxStats = subStats
            .filter(p => p !== this.userMainStat && this.scoreData[p])
            .sort((a, b) => this.scoreData[b] - this.scoreData[a]).slice(0, 4);
        if (!subMaxStats.length)
            return 0;
        logger.debug(`[${this.partition}号位]理论副词条：` + subMaxStats.map(idToName).reduce((a, p, i) => a + `${p}*${this.scoreData[subMaxStats[i]].toFixed(2)} `, ''));
        let count = this.scoreData[subMaxStats[0]] * 6;
        subMaxStats.slice(1).forEach(p => count += this.scoreData[p] || 0);
        logger.debug(`[${this.partition}号位]理论词条数：${logger.blue(count)}`);
        return count;
    }
    get_actual_count() {
        let count = 0;
        for (const prop of this.equip.properties) {
            const propID = prop.property_id;
            const weight = this.scoreData[propID];
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
        const actual_count = this.get_actual_count();
        if (actual_count === 0 && this.partition <= 3) {
            return 12 * this.get_level_multiplier() * rarity_multiplier;
        }
        const max_count = this.get_max_count();
        if (max_count === 0)
            return 0;
        if (this.partition <= 3) {
            const score = actual_count / max_count * rarity_multiplier * 55;
            logger.debug(`[${this.partition}号位] ${logger.magenta(`${actual_count} / ${max_count} * ${rarity_multiplier} * 55 = ${score}`)}`);
            return score;
        }
        const mainMaxStat = mainStats[this.partition]
            .filter(p => this.scoreData[p])
            .sort((a, b) => this.scoreData[b] - this.scoreData[a])[0];
        const mainScore = (mainMaxStat ? 12 * (this.scoreData[this.userMainStat] || 0) / this.scoreData[mainMaxStat] : 12) * this.get_level_multiplier();
        const subScore = actual_count / max_count * 43;
        const score = (mainScore + subScore) * rarity_multiplier;
        logger.debug(`[${this.partition}号位] ${logger.magenta(`(${mainScore} + ${subScore}) * ${rarity_multiplier} = ${score}`)}`);
        return score;
    }
    static main(charID, equip) {
        try {
            return new Score(charID, equip).get_score();
        }
        catch (err) {
            logger.error('角色驱动盘评分计算错误：', err);
            return 0;
        }
    }
}
