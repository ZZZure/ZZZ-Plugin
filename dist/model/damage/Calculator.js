import { runtime, elementType2element, anomalyEnum } from './BuffManager.js';
import { getMapData } from '../../utils/file.js';
import { property } from '../../lib/convert.js';
import { charData } from './avatar.js';
import _ from 'lodash';
const subBaseValueData = {
    "生命值百分比": [0.03, '3.0%'],
    "生命值": [112, '112'],
    "攻击力百分比": [0.03, '3.0%'],
    "攻击力": [19, '19'],
    "防御力百分比": [0.048, '4.8%'],
    "防御力": [15, '15'],
    "暴击率": [0.024, '2.4%'],
    "暴击伤害": [0.048, '4.8%'],
    "穿透值": [9, '9'],
    "异常精通": [9, '9']
};
const mainBaseValueData = {
    "生命值百分比": [0.3, '30%'],
    "攻击力百分比": [0.3, '30%'],
    "防御力百分比": [0.48, '48%'],
    "暴击率": [0.24, '24%'],
    "暴击伤害": [0.48, '48%'],
    "异常精通": [92, '92'],
    "穿透率": [0.24, '24%'],
    "物理属性伤害加成": [0.3, '30%'],
    "火属性伤害加成": [0.3, '30%'],
    "冰属性伤害加成": [0.3, '30%'],
    "电属性伤害加成": [0.3, '30%'],
    "以太属性伤害加成": [0.3, '30%'],
    "异常掌控": [0.3, '30%'],
    "冲击力": [0.18, '18%'],
    "能量自动回复": [0.6, '60%']
};
const AnomalyData = getMapData('AnomalyData');
export class Calculator {
    buffM;
    avatar;
    skills = [];
    usefulBuffResults = new Map();
    cache = Object.create(null);
    props = {};
    skill;
    defaultSkill = {};
    enemy;
    constructor(buffM) {
        this.buffM = buffM;
        this.avatar = this.buffM.avatar;
        this.enemy = {
            level: this.avatar.level,
            basicDEF: 50,
            resistance: -0.2
        };
    }
    get initial_properties() {
        return this.avatar.initial_properties;
    }
    defEnemy(param, value) {
        if (typeof param === 'string' && value !== undefined) {
            this.enemy[param] = value;
        }
        else if (typeof param === 'object') {
            _.merge(this.enemy, param);
        }
    }
    new(skill) {
        if (Array.isArray(skill)) {
            skill.forEach(s => this.new(s));
            return this.skills;
        }
        const oriSkill = skill;
        skill = { ...this.defaultSkill, ...skill };
        if (!skill.element)
            skill.element = oriSkill.element = elementType2element(this.avatar.element_type);
        for (const key of ['name', 'type']) {
            if (!skill[key])
                return logger.warn(`无效skill：缺少${key}字段`, skill);
        }
        if (skill.check && +skill.check) {
            const num = skill.check;
            skill.check = oriSkill.check = ({ avatar }) => avatar.rank >= num;
        }
        skill.isAnomalyDMG ??= oriSkill.isAnomalyDMG = typeof anomalyEnum[skill.type.slice(0, 2)] === 'number';
        skill.isSheerDMG ??= oriSkill.isSheerDMG = this.avatar.avatar_profession === runtime.professionEnum.命破 && elementType2element(this.avatar.element_type) === skill.element && !skill.isAnomalyDMG;
        this.skills.push(skill);
        return this.skills;
    }
    find_skill(key, value) {
        return this.skills.find(skill => skill[key] === value);
    }
    calc_skill(skill) {
        if (typeof skill === 'string') {
            const MySkill = this.find_skill('type', skill);
            if (!MySkill)
                return;
            return this.calc_skill(MySkill);
        }
        this.skill = skill;
        if (!skill.banCache && this.cache[skill.type])
            return this.cache[skill.type];
        if (skill.check && !skill.check({ avatar: this.avatar, buffM: this.buffM, calc: this, runtime }))
            return;
        logger.debug(`${logger.green(skill.type)}${skill.name}伤害计算：`);
        if (skill.dmg) {
            const dmg = skill.dmg(this);
            if (!dmg.skill || dmg.skill.name !== skill.name) {
                dmg.skill = skill;
            }
            logger.debug('自定义计算最终伤害：', dmg.result);
            return dmg;
        }
        const props = this.props = skill.props || {};
        const usefulBuffs = this.buffM.filter({
            element: skill.element,
            range: [skill.type],
            redirect: skill.redirect
        }, this);
        const areas = {};
        if (skill.before)
            skill.before({ avatar: this.avatar, calc: this, usefulBuffs, skill, props, areas, runtime });
        logger.debug(`有效buff*${usefulBuffs.length}/${this.buffM.buffs.length}`);
        const { isAnomalyDMG = false, isSheerDMG = false } = skill;
        if (!areas.BasicArea) {
            let Multiplier = props.倍率;
            if (!Multiplier) {
                if (skill.multiplier) {
                    switch (typeof skill.multiplier) {
                        case 'number':
                            Multiplier = skill.multiplier;
                            break;
                        case 'string':
                            Multiplier = this.get_SkillMultiplier(skill.multiplier);
                            break;
                        case 'object':
                            Multiplier = skill.multiplier[this.get_SkillLevel(skill.type[0]) - 1];
                            break;
                        case 'function':
                            Multiplier = skill.multiplier({ avatar: this.avatar, buffM: this.buffM, calc: this, runtime });
                            break;
                        default:
                            Multiplier = this.get_SkillMultiplier(skill.type);
                            logger.warn('无效的技能倍率：', skill);
                    }
                }
                else if (isAnomalyDMG) {
                    Multiplier = (skill.type.startsWith('紊乱') ?
                        this.get_DiscoverMultiplier(skill) :
                        this.get_AnomalyMultiplier(skill, usefulBuffs, skill.name.includes('每') ? 1 : 0)) || 0;
                }
                else {
                    Multiplier = this.get_SkillMultiplier(skill.type);
                }
                const ExtraMultiplier = this.get_ExtraMultiplier(skill, usefulBuffs);
                Multiplier += ExtraMultiplier;
                if (!Multiplier)
                    return logger.warn('技能倍率缺失：', skill);
                if (ExtraMultiplier)
                    logger.debug(`最终倍率：${Multiplier}`);
            }
            props.倍率 = Multiplier;
            if (isSheerDMG) {
                areas.BasicArea = this.get_SheerForce(skill, usefulBuffs) * Multiplier;
            }
            else {
                areas.BasicArea = this.get_ATK(skill, usefulBuffs) * Multiplier;
            }
        }
        logger.debug(`基础伤害区：${areas.BasicArea}`);
        let CRITRate = 0, CRITDMG = 0;
        if (!areas.CriticalArea) {
            if (isAnomalyDMG) {
                if (!skill.type.startsWith('紊乱')) {
                    CRITRate = this.get_AnomalyCRITRate(skill, usefulBuffs);
                    CRITDMG = this.get_AnomalyCRITDMG(skill, usefulBuffs);
                }
            }
            else {
                CRITRate = this.get_CRITRate(skill, usefulBuffs);
                CRITDMG = this.get_CRITDMG(skill, usefulBuffs);
            }
            areas.CriticalArea = 1 + CRITRate * CRITDMG;
        }
        areas.CriticalArea !== 1 && logger.debug(`暴击期望：${areas.CriticalArea}`);
        areas.BoostArea ??= this.get_BoostArea(skill, usefulBuffs);
        areas.VulnerabilityArea ??= this.get_VulnerabilityArea(skill, usefulBuffs);
        areas.ResistanceArea ??= this.get_ResistanceArea(skill, usefulBuffs);
        areas.DefenceArea ??= isSheerDMG ? 1 : this.get_DefenceArea(skill, usefulBuffs);
        areas.StunVulnerabilityArea ??= this.get_StunVulnerabilityArea(skill, usefulBuffs);
        if (isAnomalyDMG) {
            areas.AnomalyProficiencyArea ??= this.get_AnomalyProficiencyArea(skill, usefulBuffs);
            areas.AnomalyBoostArea ??= this.get_AnomalyBoostArea(skill, usefulBuffs);
            areas.LevelArea ??= this.get_LevelArea();
        }
        if (isSheerDMG) {
            areas.SheerBoostArea ??= this.get_SheerBoostArea(skill, usefulBuffs);
        }
        const { BasicArea, CriticalArea, BoostArea, VulnerabilityArea, ResistanceArea, DefenceArea, AnomalyProficiencyArea, LevelArea, AnomalyBoostArea, StunVulnerabilityArea, SheerBoostArea = 1 } = areas;
        const commonArea = BasicArea * BoostArea * VulnerabilityArea * ResistanceArea * DefenceArea * StunVulnerabilityArea;
        const result = isAnomalyDMG ?
            {
                critDMG: (CriticalArea !== 1) ? commonArea * (CRITDMG + 1) * AnomalyProficiencyArea * LevelArea * AnomalyBoostArea : 0,
                expectDMG: commonArea * CriticalArea * AnomalyProficiencyArea * LevelArea * AnomalyBoostArea
            } : {
            critDMG: commonArea * (CRITDMG + 1) * SheerBoostArea,
            expectDMG: commonArea * CriticalArea * SheerBoostArea
        };
        const damageHandler = {
            fnc: (fnc) => {
                damage.result.critDMG = fnc(damage.result.critDMG);
                damage.result.expectDMG = fnc(damage.result.expectDMG);
            },
            x: (n) => {
                logger.debug('伤害系数：' + n);
                damage.fnc(v => v * n);
            },
            add: (d) => {
                if (typeof d === 'string')
                    d = this.calc_skill(d);
                if (!d)
                    return;
                logger.debug('增加伤害：' + d.skill.name, d.result);
                damage.result.expectDMG += d.result.expectDMG;
                damage.result.critDMG += d.result.critDMG || d.result.expectDMG;
            },
            del: (d) => {
                if (typeof d === 'string')
                    d = this.calc_skill(d);
                if (!d)
                    return;
                logger.debug('减少伤害：' + d.skill.name, d.result);
                damage.result.expectDMG -= d.result.expectDMG;
                damage.result.critDMG -= d.result.critDMG || d.result.expectDMG;
            }
        };
        const damage = new Proxy({
            skill,
            usefulBuffs: _.sortBy(Array.from(this.usefulBuffResults.values()), ['type', 'value']).reverse(),
            props,
            areas,
            result
        }, {
            get: (target, prop) => {
                if (prop in damageHandler) {
                    return damageHandler[prop];
                }
                return target[prop];
            }
        });
        this.usefulBuffResults.clear();
        if (skill.after) {
            skill.after({ avatar: this.avatar, calc: this, usefulBuffs, skill, damage, runtime });
        }
        logger.debug('最终伤害：', result);
        if (!skill.banCache)
            this.cache[skill.type] = damage;
        return damage;
    }
    calc_showInPanel_buffs() {
        return this.buffM.buffs
            .filter(buff => buff.showInPanel)
            .map(buff => {
            try {
                const value = this.calc_value(buff.value, buff);
                const { _base_properties, _initial_properties } = this.avatar;
                this.avatar._base_properties = this.avatar._initial_properties = new Proxy({}, {
                    get: (target, prop) => {
                        return Number.MAX_SAFE_INTEGER;
                    }
                });
                let max = 0;
                try {
                    this.props = {};
                    max = this.calc_value(buff.value, buff);
                }
                catch { }
                this.avatar._base_properties = _base_properties;
                this.avatar._initial_properties = _initial_properties;
                if (max === Infinity || !max || max > 9999) {
                    max = 0;
                }
                return { ...buff, value, max };
            }
            catch (e) {
                logger.error('buff计算错误：', buff, e);
                return;
            }
        })
            .filter(v => v && v.value);
    }
    calc() {
        return this.skills.map(skill => {
            try {
                return this.calc_skill(skill);
            }
            catch (e) {
                logger.error('伤害计算错误：', e);
                return;
            }
        }).filter(v => v && v.result?.expectDMG && !v.skill?.isHide);
    }
    calc_sub_differences(skill, types) {
        if (!types || !types.length) {
            types = Object.entries(this.avatar.scoreWeight)
                .reduce((acc, [id, weight]) => {
                if (weight > 0) {
                    const type = property.idToName(id);
                    if (type && subBaseValueData[type]) {
                        acc.push({ type, weight });
                    }
                }
                return acc;
            }, [])
                .sort((a, b) => b.weight - a.weight)
                .slice(0, 6)
                .map(({ type }) => type);
        }
        const base = {};
        types.forEach(t => base[t] = t.includes('百分比') ? this.avatar.base_properties[property.nameZHToNameEN(t.replace('百分比', ''))] * subBaseValueData[t][0] : subBaseValueData[t][0]);
        logger.debug(logger.red('副词条差异计算变化值：'), base);
        const buffs = types.map(t => ({
            name: t,
            shortName: property.nameToShortName3(t),
            type: t.replace('百分比', ''),
            value: base[t],
            valueBase: subBaseValueData[t][1]
        }));
        buffs.push({
            name: '空白对照',
            shortName: '对照组',
            type: '',
            value: 0,
            valueBase: '0'
        });
        return this.calc_differences(buffs, skill);
    }
    calc_main_differences(skill, types) {
        if (!types || !types.length) {
            types = Object.entries(this.avatar.scoreWeight)
                .reduce((acc, [id, weight]) => {
                if (weight > 0) {
                    const type = property.idToName(id);
                    if (type && mainBaseValueData[type]) {
                        acc.push({ type, weight });
                    }
                }
                return acc;
            }, [])
                .sort((a, b) => b.weight - a.weight)
                .slice(0, 6)
                .map(({ type }) => type);
        }
        const base = {};
        types.forEach(t => base[t] = (t.includes('百分比') || ['异常掌控', '冲击力', '能量自动回复'].includes(t)) ? this.avatar.base_properties[property.nameZHToNameEN(t.replace('百分比', ''))] * mainBaseValueData[t][0] : mainBaseValueData[t][0]);
        logger.debug(logger.red('主词条差异计算变化值：'), base);
        const buffs = types.map(t => {
            const data = {
                name: t,
                shortName: property.nameToShortName3(t),
                type: (t.includes('属性伤害加成') ? '增伤' : t.replace('百分比', '')),
                value: base[t],
                element: (t.includes('属性伤害加成') ? property.nameZHToNameEN(t).replace('DMGBonus', '') : ''),
                valueBase: mainBaseValueData[t][1]
            };
            if (!data.element)
                delete data.element;
            return data;
        });
        buffs.push({
            name: '空白对照',
            shortName: '对照组',
            type: '',
            value: 0,
            valueBase: '0'
        });
        const equips = this.avatar.equip?.reduce((acc, e) => {
            if (e.equipment_type < 4)
                return acc;
            const name = e.main_properties[0]?.property_name;
            if (name)
                acc.push(name);
            return acc;
        }, ['空白对照']) || [];
        const main_differences = this.calc_differences(buffs, skill);
        return main_differences.filter(v => {
            const name1 = v[0].del.name.replace('百分比', '');
            const name2 = name1.replace('属性', '');
            return equips.some(e => e === name1 || e === name2);
        });
    }
    calc_differences(buffs, skill) {
        if (!skill) {
            skill = this.find_skill('isMain', true)
                || this.calc().sort((a, b) => b.result.expectDMG - a.result.expectDMG)[0]?.skill;
        }
        else if (typeof skill === 'string') {
            const MySkill = this.find_skill('type', skill);
            if (!MySkill)
                return [];
            return this.calc_differences(buffs, MySkill);
        }
        const oriDamage = this.calc_skill(skill);
        this.cache = Object.create(null);
        const result = [];
        for (const i_del in buffs) {
            result[i_del] = [];
            const buff_del = buffs[i_del];
            const { name: name_del = buff_del.type, value: value_del } = buff_del;
            logger.debug(logger.blue(`差异计算：${name_del}`));
            this.buffM.buffs.push({
                ...buff_del,
                name: logger.green(`差异计算：${name_del}`),
                value: ({ calc }) => -calc.calc_value(value_del)
            });
            for (const i_add in buffs) {
                const buff_add = buffs[i_add];
                buff_add.name ??= buff_add.type;
                const data = result[i_del][i_add] = {
                    add: buff_add,
                    del: buff_del,
                    damage: oriDamage,
                    difference: 0
                };
                const { name: name_add = buff_add.type } = buff_add;
                if (name_del === name_add)
                    continue;
                logger.debug(logger.yellow(`差异计算：${name_del}->${name_add}`));
                this.buffM.buffs.push({
                    ...buff_add,
                    name: logger.green(`差异计算：${name_del}->${name_add}`)
                });
                const newDamage = this.calc_skill(skill);
                this.buffM.buffs.pop();
                this.cache = Object.create(null);
                data.damage = newDamage;
                data.difference = newDamage.result.expectDMG - oriDamage.result.expectDMG;
                logger.debug(logger.magenta(`差异计算：${name_del}->${name_add} 伤害变化：${data.difference}`));
            }
            this.buffM.buffs.pop();
        }
        return result;
    }
    default(param, value) {
        if (typeof param === 'object') {
            this.defaultSkill = param;
        }
        else {
            if (value === undefined)
                delete this.defaultSkill[param];
            else
                this.defaultSkill[param] = value;
        }
    }
    get_SkillLevel(baseType) {
        const id = ['A', 'E', 'C', 'R', , 'T', 'L'].indexOf(baseType);
        if (id === -1)
            return 1;
        return Number(this.avatar.skills.find(({ skill_type }) => skill_type === id)?.level || 1);
    }
    get_SkillMultiplier(type) {
        const SkillLevel = this.get_SkillLevel(type[0]);
        logger.debug(`${type[0]}等级：${SkillLevel}`);
        const Multiplier = charData[this.avatar.id].skill[type]?.[SkillLevel - 1];
        logger.debug(`技能倍率：${Multiplier}`);
        return Multiplier;
    }
    get_AnomalyData(anomaly) {
        if (!anomaly) {
            return AnomalyData.find(({ element_type, sub_element_type, multiplier }) => multiplier &&
                element_type === this.avatar.element_type &&
                sub_element_type === this.avatar.sub_element_type);
        }
        let a = AnomalyData.filter(({ element_type }) => element_type === this.avatar.element_type);
        if (anomaly === '紊乱')
            a = a.filter(({ discover }) => discover);
        else
            a = a.filter(({ name, multiplier }) => name === anomaly && multiplier);
        if (a.length === 1)
            return a[0];
        a = a.filter(({ sub_element_type }) => sub_element_type === this.avatar.sub_element_type);
        return a[0];
    }
    get_AnomalyMultiplier(skill, usefulBuffs, times = 0) {
        const anomalyData = this.get_AnomalyData(skill?.type.slice(0, 2));
        if (!anomalyData)
            return;
        if (!times && anomalyData.duration && anomalyData.interval) {
            const AnomalyDuration = this.get_AnomalyDuration(skill, usefulBuffs, anomalyData.duration);
            times = Math.floor((AnomalyDuration * 10) / (anomalyData.interval * 10));
        }
        const Multiplier = anomalyData.multiplier * (times || 1);
        logger.debug(`倍率：${Multiplier}`);
        return Multiplier;
    }
    get_DiscoverMultiplier(skill) {
        const anomalyData = this.get_AnomalyData(skill?.type.slice(0, 2));
        if (!anomalyData)
            return;
        const AnomalyDuration = this.get_AnomalyDuration({
            ...skill,
            name: anomalyData.name,
            type: anomalyData.name
        }, this.buffM.buffs, anomalyData.duration);
        const times = Math.floor((AnomalyDuration * 10) / (anomalyData.interval * 10));
        const discover = anomalyData.discover;
        const Multiplier = discover.fixed_multiplier + times * discover.multiplier;
        logger.debug(`${anomalyData.name}紊乱倍率：${Multiplier}`);
        return Multiplier;
    }
    calc_value(value, buff) {
        switch (typeof value) {
            case 'number': return value;
            case 'function': {
                if (buff)
                    buff.status = false;
                const v = +value({ avatar: this.avatar, buffM: this.buffM, calc: this, runtime }) || 0;
                if (buff)
                    buff.status = true;
                return v;
            }
            case 'string': return charData[this.avatar.id].buff?.[value]?.[this.get_SkillLevel(value[0]) - 1] || 0;
            case 'object': {
                if (!Array.isArray(value) || !buff)
                    return 0;
                switch (buff.source) {
                    case '音擎': return this.avatar.weapon ? value[this.avatar.weapon.star - 1] || 0 : 0;
                    case '核心被动':
                    case '额外能力': return value[this.get_SkillLevel('T') - 1] || 0;
                }
            }
            default: return 0;
        }
    }
    get(type, initial, skill = this.skill, usefulBuffs = this.buffM.buffs, isRatio = false) {
        const nonStackableBuffRecord = new Map();
        return this.props[type] ??= this.buffM._filter(usefulBuffs, {
            element: skill?.element,
            range: [skill?.type],
            redirect: skill?.redirect,
            type
        }, this).reduce((previousValue, buff) => {
            const { value } = buff;
            let add = this.calc_value(value, buff);
            if (isRatio && Math.abs(add) < 1 && (typeof value === 'number' || typeof value === 'string' || Array.isArray(value)))
                add *= initial;
            if (buff.stackable === false) {
                const recorded = nonStackableBuffRecord.get(buff.name);
                if (recorded) {
                    const recordedValue = this.usefulBuffResults.get(recorded).value;
                    if (Math.abs(recordedValue) >= Math.abs(add)) {
                        logger.debug(`\tBuff：${buff.name}已存在，且数值相同/更高，不计入结果`);
                        return previousValue;
                    }
                    logger.debug(`\tBuff：${buff.name}已存在，且数值更低，替换为更高数值`);
                    previousValue -= recordedValue;
                    this.usefulBuffResults.delete(recorded);
                }
                nonStackableBuffRecord.set(buff.name, buff);
            }
            if (!this.usefulBuffResults.has(buff))
                this.usefulBuffResults.set(buff, { ...buff, value: add });
            logger.debug(`\tBuff：${buff.name}对${(buff.include ? (buff.range ? [buff.range, buff.include] : buff.include) : buff.range) || '全类型'}增加${add}${buff.element || ''}${type}`);
            return previousValue + add;
        }, initial);
    }
    get_ATK(skill, usefulBuffs) {
        let ATK = this.get('攻击力', this.initial_properties.ATK, skill, usefulBuffs, true);
        ATK = this.min_max(0, 10000, ATK);
        logger.debug(`攻击力：${ATK}`);
        return ATK;
    }
    get_ExtraMultiplier(skill, usefulBuffs) {
        const ExtraMultiplier = this.get('倍率', 0, skill, usefulBuffs);
        ExtraMultiplier && logger.debug(`额外倍率：${ExtraMultiplier}`);
        return ExtraMultiplier;
    }
    get_CRITRate(skill, usefulBuffs) {
        let CRITRate = this.get('暴击率', this.initial_properties.CRITRate, skill, usefulBuffs);
        CRITRate = this.min_max(0, 1, CRITRate);
        logger.debug(`暴击率：${CRITRate}`);
        return CRITRate;
    }
    get_CRITDMG(skill, usefulBuffs) {
        let CRITDMG = this.get('暴击伤害', this.initial_properties.CRITDMG, skill, usefulBuffs);
        CRITDMG = this.min_max(0, 5, CRITDMG);
        logger.debug(`暴击伤害：${CRITDMG}`);
        return CRITDMG;
    }
    get_BoostArea(skill, usefulBuffs) {
        let BoostArea = this.get('增伤', 1, skill, usefulBuffs);
        BoostArea = this.min_max(0, 6, BoostArea);
        logger.debug(`增伤区：${BoostArea}`);
        return BoostArea;
    }
    get_VulnerabilityArea(skill, usefulBuffs) {
        let VulnerabilityArea = this.get('易伤', 1, skill, usefulBuffs);
        VulnerabilityArea = this.min_max(0.2, 2, VulnerabilityArea);
        logger.debug(`易伤区：${VulnerabilityArea}`);
        return VulnerabilityArea;
    }
    get_StunVulnerabilityArea(skill, usefulBuffs) {
        let StunVulnerabilityArea = this.get('失衡易伤', 1, skill, usefulBuffs);
        StunVulnerabilityArea = this.min_max(0.2, 5, StunVulnerabilityArea);
        StunVulnerabilityArea !== 1 && logger.debug(`失衡易伤区：${StunVulnerabilityArea}`);
        return StunVulnerabilityArea;
    }
    get_ResistanceArea(skill, usefulBuffs) {
        let ResistanceArea = this.get('无视抗性', 1 - this.enemy.resistance, skill, usefulBuffs);
        ResistanceArea = this.min_max(0, 2, ResistanceArea);
        logger.debug(`抗性区：${ResistanceArea}`);
        return ResistanceArea;
    }
    get_IgnoreDEF(skill, usefulBuffs) {
        const IgnoreDEF = this.get('无视防御', 0, skill, usefulBuffs);
        IgnoreDEF && logger.debug(`无视防御：${IgnoreDEF}`);
        return IgnoreDEF;
    }
    get_Pen(skill, usefulBuffs) {
        let Pen = this.get('穿透值', this.initial_properties.Pen, skill, usefulBuffs);
        Pen = Math.min(Pen, 1000);
        Pen && logger.debug(`穿透值：${Pen}`);
        return Pen;
    }
    get_PenRatio(skill, usefulBuffs) {
        let PenRatio = this.get('穿透率', this.initial_properties.PenRatio, skill, usefulBuffs);
        PenRatio = Math.min(PenRatio, 2);
        PenRatio && logger.debug(`穿透率：${PenRatio}`);
        return PenRatio;
    }
    get_DefenceArea(skill, usefulBuffs) {
        const get_base = (level) => Math.floor(0.1551 * Math.min(60, level) ** 2 + 3.141 * Math.min(60, level) + 47.2039);
        const base = get_base(this.avatar.level);
        const DEF = this.enemy.basicDEF / 50 * get_base(this.enemy.level);
        const IgnoreDEF = this.get_IgnoreDEF(skill, usefulBuffs);
        const Pen = this.get_Pen(skill, usefulBuffs);
        const PenRatio = this.get_PenRatio(skill, usefulBuffs);
        const defence = DEF * (1 - IgnoreDEF);
        const effective_defence = Math.max(0, defence * (1 - PenRatio) - Pen);
        const DefenceArea = this.min_max(0, 1, base / (effective_defence + base));
        logger.debug(`防御区：${DefenceArea}`);
        return DefenceArea;
    }
    get_LevelArea(level = this.avatar.level) {
        const LevelArea = +(1 + 1 / 59 * (level - 1)).toFixed(4);
        logger.debug(`等级区：${LevelArea}`);
        return LevelArea;
    }
    get_AnomalyProficiency(skill, usefulBuffs) {
        const AnomalyProficiency = this.get('异常精通', this.initial_properties.AnomalyProficiency, skill, usefulBuffs);
        logger.debug(`异常精通：${AnomalyProficiency}`);
        return AnomalyProficiency;
    }
    get_AnomalyMastery(skill, usefulBuffs) {
        let AnomalyMastery = this.get('异常掌控', this.initial_properties.AnomalyMastery, skill, usefulBuffs, true);
        AnomalyMastery = this.min_max(0, 1000, AnomalyMastery);
        logger.debug(`异常掌控：${AnomalyMastery}`);
        return AnomalyMastery;
    }
    get_AnomalyProficiencyArea(skill, usefulBuffs) {
        const AnomalyProficiency = this.get_AnomalyProficiency(skill, usefulBuffs);
        const AnomalyProficiencyArea = this.min_max(0, 10, AnomalyProficiency / 100);
        logger.debug(`异常精通区：${AnomalyProficiencyArea}`);
        return AnomalyProficiencyArea;
    }
    get_AnomalyBoostArea(skill, usefulBuffs) {
        let AnomalyBoostArea = this.get('异常增伤', 1, skill, usefulBuffs);
        AnomalyBoostArea = this.min_max(0, 3, AnomalyBoostArea);
        AnomalyBoostArea !== 1 && logger.debug(`异常增伤区：${AnomalyBoostArea}`);
        return AnomalyBoostArea;
    }
    get_AnomalyCRITRate(skill, usefulBuffs) {
        let AnomalyCRITRate = this.get('异常暴击率', 0, skill, usefulBuffs);
        AnomalyCRITRate = this.min_max(0, 1, AnomalyCRITRate);
        AnomalyCRITRate && logger.debug(`异常暴击率：${AnomalyCRITRate}`);
        return AnomalyCRITRate;
    }
    get_AnomalyCRITDMG(skill, usefulBuffs) {
        let AnomalyCRITDMG = this.get('异常暴击伤害', 0, skill, usefulBuffs);
        AnomalyCRITDMG = this.min_max(0, 5, AnomalyCRITDMG);
        AnomalyCRITDMG && logger.debug(`异常暴击伤害：${AnomalyCRITDMG}`);
        return AnomalyCRITDMG;
    }
    get_AnomalyDuration(skill, usefulBuffs, duration = 0) {
        const AnomalyDuration = +this.get('异常持续时间', duration, skill, usefulBuffs).toFixed(1);
        logger.debug(`异常持续时间：${AnomalyDuration}`);
        return AnomalyDuration;
    }
    get_HP(skill, usefulBuffs) {
        let HP = this.get('生命值', this.initial_properties.HP, skill, usefulBuffs, true);
        HP = this.min_max(0, 100000, HP);
        logger.debug(`生命值：${HP}`);
        return HP;
    }
    get_DEF(skill, usefulBuffs) {
        let DEF = this.get('防御力', this.initial_properties.DEF, skill, usefulBuffs, true);
        DEF = this.min_max(0, 1000, DEF);
        logger.debug(`防御力：${DEF}`);
        return DEF;
    }
    get_Impact(skill, usefulBuffs) {
        let Impact = this.get('冲击力', this.initial_properties.Impact, skill, usefulBuffs, true);
        Impact = this.min_max(0, 1000, Impact);
        logger.debug(`冲击力：${Impact}`);
        return Impact;
    }
    get_SheerForce(skill, usefulBuffs) {
        let SheerForce = Math.trunc(this.get_ATK(skill, usefulBuffs) * 0.3);
        SheerForce = this.get('贯穿力', SheerForce, skill, usefulBuffs, true);
        SheerForce = this.min_max(0, 10000, SheerForce);
        logger.debug(`贯穿力：${SheerForce}`);
        return SheerForce;
    }
    get_SheerBoostArea(skill, usefulBuffs) {
        let SheerBoostArea = this.get('贯穿增伤', 1, skill, usefulBuffs);
        SheerBoostArea = this.min_max(0.2, 9, SheerBoostArea);
        SheerBoostArea !== 1 && logger.debug(`贯穿增伤区：${SheerBoostArea}`);
        return SheerBoostArea;
    }
    min_max(min, max, value) {
        return Math.min(Math.max(value, min), max);
    }
}
//# sourceMappingURL=Calculator.js.map