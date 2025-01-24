import { getMapData } from '../../utils/file.js';
import { elementEnum, anomalyEnum } from './BuffManager.js';
import { charData } from './avatar.js';
import _ from 'lodash';
const elementType2element = (elementType) => elementEnum[[0, 1, 2, 3, -1, 4][elementType - 200]];
const AnomalyData = getMapData('AnomalyData');
export class Calculator {
    buffM;
    avatar;
    skills = [];
    cache = {};
    props = {};
    defaultSkill = {};
    enemy;
    constructor(buffM) {
        this.buffM = buffM;
        this.avatar = this.buffM.avatar;
        this.enemy = {
            level: this.avatar.level,
            basicDEF: 50,
            resistance: 0.2
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
        skill = _.merge({
            ...this.defaultSkill
        }, skill);
        if (!skill.element)
            skill.element = elementType2element(this.avatar.element_type);
        if (!skill.name || !skill.type)
            return logger.warn('无效skill：', skill);
        this.skills.push(skill);
        return this.skills;
    }
    calc_skill(skill) {
        if (typeof skill === 'string') {
            const MySkill = this.skills.find(s => s.type === skill);
            if (!MySkill)
                return;
            return this.calc_skill(MySkill);
        }
        if (!skill.banCache && this.cache[skill.type])
            return this.cache[skill.type];
        if (skill.check && !skill.check({ avatar: this.avatar, buffM: this.buffM, calc: this }))
            return;
        logger.debug(`${logger.green(skill.type)}${skill.name}伤害计算：`);
        if (skill.dmg) {
            const dmg = skill.dmg(this);
            logger.debug('自定义计算最终伤害：', dmg.result);
            return dmg;
        }
        const props = this.props = skill.props || {};
        /** 缩小筛选范围 */
        const usefulBuffs = this.buffM.filter({
            element: skill.element,
            range: [skill.type],
            redirect: skill.redirect
        }, this);
        const areas = {};
        if (skill.before)
            skill.before({ avatar: this.avatar, calc: this, usefulBuffs, skill, props, areas });
        const isAnomaly = typeof anomalyEnum[skill.type] === 'number';
        if (!areas.BasicArea) {
            let Multiplier = props.倍率;
            if (!Multiplier) {
                if (skill.fixedMultiplier) {
                    Multiplier = skill.fixedMultiplier;
                }
                else if (isAnomaly) {
                    Multiplier = (skill.type === '紊乱' ?
                        this.get_DiscoverMultiplier(skill) :
                        this.get_AnomalyMultiplier(skill, usefulBuffs, skill.name.includes('每') ? 1 : 0)) || 0;
                }
                else {
                    if (skill.skillMultiplier)
                        Multiplier = skill.skillMultiplier[this.get_SkillLevel(skill.type[0]) - 1];
                    else
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
            this.get_ATK(skill, usefulBuffs);
            areas.BasicArea = props.攻击力 * props.倍率;
        }
        logger.debug(`基础伤害区：${areas.BasicArea}`);
        if (isAnomaly) {
            areas.AnomalyProficiencyArea ??= this.get_AnomalyProficiencyArea(skill, usefulBuffs);
            areas.AnomalyBoostArea ??= this.get_AnomalyBoostArea(skill, usefulBuffs);
            areas.LevelArea ??= this.get_LevelArea();
            props.异常暴击率 = this.get_AnomalyCRITRate(skill, usefulBuffs);
            props.异常暴击伤害 = this.get_AnomalyCRITDMG(skill, usefulBuffs);
            areas.CriticalArea ??= 1 + props.异常暴击率 * (props.异常暴击伤害 - 1);
        }
        else {
            props.暴击率 = this.get_CRITRate(skill, usefulBuffs);
            props.暴击伤害 = this.get_CRITDMG(skill, usefulBuffs);
            areas.CriticalArea ??= 1 + props.暴击率 * (props.暴击伤害 - 1);
        }
        logger.debug(`暴击期望：${areas.CriticalArea}`);
        areas.BoostArea ??= this.get_BoostArea(skill, usefulBuffs);
        areas.VulnerabilityArea ??= this.get_VulnerabilityArea(skill, usefulBuffs);
        areas.ResistanceArea ??= this.get_ResistanceArea(skill, usefulBuffs);
        areas.DefenceArea ??= this.get_DefenceArea(skill, usefulBuffs);
        const { BasicArea, CriticalArea, BoostArea, VulnerabilityArea, ResistanceArea, DefenceArea, AnomalyProficiencyArea, LevelArea, AnomalyBoostArea } = areas;
        const { 暴击伤害, 异常暴击伤害 } = props;
        const result = isAnomaly ?
            {
                critDMG: (CriticalArea !== 1) ? BasicArea * 异常暴击伤害 * BoostArea * VulnerabilityArea * ResistanceArea * DefenceArea * AnomalyProficiencyArea * LevelArea * AnomalyBoostArea : 0,
                expectDMG: BasicArea * CriticalArea * BoostArea * VulnerabilityArea * ResistanceArea * DefenceArea * AnomalyProficiencyArea * LevelArea * AnomalyBoostArea
            } : {
                critDMG: BasicArea * 暴击伤害 * BoostArea * VulnerabilityArea * ResistanceArea * DefenceArea,
                expectDMG: BasicArea * CriticalArea * BoostArea * VulnerabilityArea * ResistanceArea * DefenceArea
            };
        const damage = { skill, props, areas, result };
        if (skill.after) {
            damage.add = (d) => {
                if (typeof d === 'string')
                    d = this.calc_skill(d);
                if (!d)
                    return;
                logger.debug('追加伤害：' + d.skill.name, d.result);
                damage.result.expectDMG += d.result.expectDMG;
                damage.result.critDMG += d.result.critDMG;
            };
            damage.fnc = (fnc) => {
                damage.result.critDMG = fnc(damage.result.critDMG);
                damage.result.expectDMG = fnc(damage.result.expectDMG);
            };
            damage.x = (n) => {
                logger.debug('伤害系数：' + n);
                damage.fnc(v => v * n);
            };
            skill.after({ avatar: this.avatar, calc: this, usefulBuffs, skill, damage });
        }
        logger.debug('最终伤害：', result);
        if (!skill.banCache)
            this.cache[skill.type] = damage;
        // console.log(damage)
        return damage;
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
    /**
     * 获取技能等级
     * @param baseType 技能基类 'A', 'E', 'C', 'R', 'T', 'L'
     */
    get_SkillLevel(baseType) {
        const id = ['A', 'E', 'C', 'R', , 'T', 'L'].indexOf(baseType);
        if (id === -1)
            return 1;
        return Number(this.avatar.skills.find(({ skill_type }) => skill_type === id)?.level || 1);
    }
    /**
     * 获取技能倍率
     * @param type 参见技能命名标准
     */
    get_SkillMultiplier(type) {
        const SkillLevel = this.get_SkillLevel(type[0]);
        logger.debug(`${type[0]}等级：${SkillLevel}`);
        const Multiplier = charData[this.avatar.id].skill[type]?.[SkillLevel - 1];
        logger.debug(`技能倍率：${Multiplier}`);
        return Multiplier;
    }
    get_AnomalyData(type) {
        let a = AnomalyData.filter(({ element_type }) => element_type === this.avatar.element_type);
        if (type === '紊乱')
            a = a.filter(({ discover }) => discover);
        else
            a = a.filter(({ name, multiplier }) => name === type && multiplier);
        if (a.length === 1)
            return a[0];
        a = a.filter(({ sub_element_type }) => sub_element_type === this.avatar.sub_element_type);
        return a[0];
    }
    /** 获取属性异常倍率 */
    get_AnomalyMultiplier(skill, usefulBuffs, times = 0) {
        const anomalyData = this.get_AnomalyData(skill.type);
        if (!anomalyData)
            return;
        let Multiplier = anomalyData.multiplier;
        if (anomalyData.duration && anomalyData.interval) {
            const AnomalyDuration = this.get_AnomalyDuration(skill, usefulBuffs, anomalyData.duration);
            times ||= Math.floor((AnomalyDuration * 10) / (anomalyData.interval * 10));
            Multiplier = anomalyData.multiplier * times;
        }
        logger.debug(`倍率：${Multiplier}`);
        return Multiplier;
    }
    /** 获取紊乱倍率 */
    get_DiscoverMultiplier(skill) {
        const anomalyData = this.get_AnomalyData(skill.type);
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
            case 'function': return +value({ avatar: this.avatar, buffM: this.buffM, calc: this }) || 0;
            case 'string': return charData[this.avatar.id].buff?.[value]?.[this.get_SkillLevel(value[0]) - 1] || 0;
            case 'object': {
                if (!Array.isArray(value) || !buff)
                    return 0;
                switch (buff.source) {
                    case 'Weapon': return value[this.avatar.weapon.star - 1] || 0;
                    case 'Talent':
                    case 'Addition': return value[this.get_SkillLevel('T') - 1] || 0;
                }
            }
            default: return 0;
        }
    }
    /**
     * 获取局内属性原始值
     * @param isRatio 是否支持buff.value为数值类型且<1时按初始数值百分比提高处理
     */
    get(type, initial, skill, usefulBuffs = this.buffM.buffs, isRatio = false) {
        return this.props[type] ??= this.buffM._filter(usefulBuffs, {
            element: skill?.element,
            range: [skill?.type],
            redirect: skill?.redirect,
            type
        }, this).reduce((previousValue, buff) => {
            const { value } = buff;
            let add = 0;
            if (isRatio && typeof value === 'number' && value < 1) { // 值小于1时，认为是百分比
                add = value * initial;
            }
            else {
                add = this.calc_value(value, buff);
                if (add < 1 && isRatio && (typeof value === 'string' || Array.isArray(value)))
                    add *= initial;
            }
            logger.debug(`\tBuff：${buff.name}对${buff.range || '全类型'}增加${add}${buff.element || ''}${type}`);
            return previousValue + add;
        }, initial);
    }
    /** 攻击力 */
    get_ATK(skill, usefulBuffs) {
        let ATK = this.get('攻击力', this.initial_properties.ATK, skill, usefulBuffs, true);
        ATK = Math.max(0, Math.min(ATK, 10000));
        logger.debug(`攻击力：${ATK}`);
        return ATK;
    }
    /** 额外倍率 */
    get_ExtraMultiplier(skill, usefulBuffs) {
        const ExtraMultiplier = this.get('倍率', 0, skill, usefulBuffs);
        ExtraMultiplier && logger.debug(`额外倍率：${ExtraMultiplier}`);
        return ExtraMultiplier;
    }
    /** 暴击率 */
    get_CRITRate(skill, usefulBuffs) {
        let CRITRate = this.get('暴击率', this.initial_properties.CRITRate, skill, usefulBuffs);
        CRITRate = Math.max(0, Math.min(CRITRate, 1));
        logger.debug(`暴击率：${CRITRate}`);
        return CRITRate;
    }
    /** 暴击伤害 */
    get_CRITDMG(skill, usefulBuffs) {
        let CRITDMG = this.get('暴击伤害', this.initial_properties.CRITDMG + 1, skill, usefulBuffs);
        CRITDMG = Math.max(0, Math.min(CRITDMG, 5));
        logger.debug(`暴击伤害：${CRITDMG}`);
        return CRITDMG;
    }
    /** 增伤区 */
    get_BoostArea(skill, usefulBuffs) {
        const BoostArea = this.get('增伤', 1, skill, usefulBuffs);
        logger.debug(`增伤区：${BoostArea}`);
        return BoostArea;
    }
    /** 易伤区 */
    get_VulnerabilityArea(skill, usefulBuffs) {
        const VulnerabilityArea = this.get('易伤', 1, skill, usefulBuffs);
        logger.debug(`易伤区：${VulnerabilityArea}`);
        return VulnerabilityArea;
    }
    /** 抗性区 */
    get_ResistanceArea(skill, usefulBuffs) {
        const ResistanceArea = this.get('无视抗性', 1 + this.enemy.resistance, skill, usefulBuffs);
        logger.debug(`抗性区：${ResistanceArea}`);
        return ResistanceArea;
    }
    /** 无视防御 */
    get_IgnoreDEF(skill, usefulBuffs) {
        const IgnoreDEF = this.get('无视防御', 0, skill, usefulBuffs);
        IgnoreDEF && logger.debug(`无视防御：${IgnoreDEF}`);
        return IgnoreDEF;
    }
    /** 穿透值 */
    get_Pen(skill, usefulBuffs) {
        let Pen = this.get('穿透值', this.initial_properties.Pen, skill, usefulBuffs);
        Pen = Math.max(0, Math.min(Pen, 1000));
        Pen && logger.debug(`穿透值：${Pen}`);
        return Pen;
    }
    /** 穿透率 */
    get_PenRatio(skill, usefulBuffs) {
        let PenRatio = this.get('穿透率', this.initial_properties.PenRatio, skill, usefulBuffs);
        PenRatio = Math.max(0, Math.min(PenRatio, 2));
        PenRatio && logger.debug(`穿透率：${PenRatio}`);
        return PenRatio;
    }
    /** 防御区 */
    get_DefenceArea(skill, usefulBuffs) {
        const get_base = (level) => Math.floor(0.1551 * Math.min(60, level) ** 2 + 3.141 * Math.min(60, level) + 47.2039);
        /** 等级基数 */
        const base = get_base(this.avatar.level);
        /** 基础防御 */
        const DEF = this.enemy.basicDEF / 50 * get_base(this.enemy.level);
        const IgnoreDEF = this.get_IgnoreDEF(skill, usefulBuffs);
        const Pen = this.get_Pen(skill, usefulBuffs);
        const PenRatio = this.get_PenRatio(skill, usefulBuffs);
        /** 防御 */
        const defence = DEF * (1 - IgnoreDEF);
        /** 有效防御 */
        const effective_defence = Math.max(0, defence * (1 - PenRatio) - Pen);
        const DefenceArea = base / (effective_defence + base);
        logger.debug(`防御区：${DefenceArea}`);
        return DefenceArea;
    }
    /** 等级区 */
    get_LevelArea(level = this.avatar.level) {
        const LevelArea = +(1 + 1 / 59 * (level - 1)).toFixed(4);
        logger.debug(`等级区：${LevelArea}`);
        return LevelArea;
    }
    /** 异常精通 */
    get_AnomalyProficiency(skill, usefulBuffs) {
        let AnomalyProficiency = this.get('异常精通', this.initial_properties.AnomalyProficiency, skill, usefulBuffs);
        AnomalyProficiency = Math.max(0, Math.min(AnomalyProficiency, 1000));
        logger.debug(`异常精通：${AnomalyProficiency}`);
        return AnomalyProficiency;
    }
    /** 异常精通区 */
    get_AnomalyProficiencyArea(skill, usefulBuffs) {
        const AnomalyProficiency = this.get_AnomalyProficiency(skill, usefulBuffs);
        const AnomalyProficiencyArea = AnomalyProficiency / 100;
        logger.debug(`异常精通区：${AnomalyProficiencyArea}`);
        return AnomalyProficiencyArea;
    }
    /** 异常增伤区 */
    get_AnomalyBoostArea(skill, usefulBuffs) {
        const AnomalyBoostArea = this.get('异常增伤', 1, skill, usefulBuffs);
        AnomalyBoostArea && logger.debug(`异常增伤区：${AnomalyBoostArea}`);
        return AnomalyBoostArea;
    }
    /** 异常暴击率 */
    get_AnomalyCRITRate(skill, usefulBuffs) {
        let AnomalyCRITRate = this.get('异常暴击率', 0, skill, usefulBuffs);
        AnomalyCRITRate = Math.max(0, Math.min(AnomalyCRITRate, 1));
        AnomalyCRITRate && logger.debug(`异常暴击率：${AnomalyCRITRate}`);
        return AnomalyCRITRate;
    }
    /** 异常暴击伤害 */
    get_AnomalyCRITDMG(skill, usefulBuffs) {
        let AnomalyCRITDMG = this.get('异常暴击伤害', 1, skill, usefulBuffs);
        AnomalyCRITDMG = Math.max(0, Math.min(AnomalyCRITDMG, 5));
        AnomalyCRITDMG && logger.debug(`异常暴击伤害：${AnomalyCRITDMG}`);
        return AnomalyCRITDMG;
    }
    /** 异常持续时间 */
    get_AnomalyDuration(skill, usefulBuffs, duration = 0) {
        const AnomalyDuration = +this.get('异常持续时间', duration, skill, usefulBuffs).toFixed(1);
        logger.debug(`异常持续时间：${AnomalyDuration}`);
        return AnomalyDuration;
    }
    /** 生命值 */
    get_HP(skill, usefulBuffs) {
        let HP = this.get('生命值', this.initial_properties.HP, skill, usefulBuffs, true);
        HP = Math.max(0, Math.min(HP, 100000));
        logger.debug(`生命值：${HP}`);
        return HP;
    }
    /** 防御力 */
    get_DEF(skill, usefulBuffs) {
        let DEF = this.get('防御力', this.initial_properties.DEF, skill, usefulBuffs, true);
        DEF = Math.max(0, Math.min(DEF, 1000));
        logger.debug(`防御力：${DEF}`);
        return DEF;
    }
    /** 冲击力 */
    get_Impact(skill, usefulBuffs) {
        let Impact = this.get('冲击力', this.initial_properties.Impact, skill, usefulBuffs, true);
        Impact = Math.max(0, Math.min(Impact, 1000));
        logger.debug(`冲击力：${Impact}`);
        return Impact;
    }
    /** 异常掌控 */
    get_AnomalyMastery(skill, usefulBuffs) {
        let AnomalyMastery = this.get('异常掌控', this.initial_properties.AnomalyMastery, skill, usefulBuffs, true);
        AnomalyMastery = Math.max(0, Math.min(AnomalyMastery, 1000));
        logger.debug(`异常掌控：${AnomalyMastery}`);
        return AnomalyMastery;
    }
}
