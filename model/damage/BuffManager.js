import { weaponIDToProfession } from '../../lib/convert/weapon.js';
import _ from 'lodash';
export var elementEnum;
(function (elementEnum) {
    // 物理、火、冰、电、以太
    elementEnum[elementEnum["Physical"] = 0] = "Physical";
    elementEnum[elementEnum["Fire"] = 1] = "Fire";
    elementEnum[elementEnum["Ice"] = 2] = "Ice";
    elementEnum[elementEnum["Electric"] = 3] = "Electric";
    elementEnum[elementEnum["Ether"] = 4] = "Ether";
})(elementEnum || (elementEnum = {}));
export var anomalyEnum;
(function (anomalyEnum) {
    anomalyEnum[anomalyEnum["\u5F3A\u51FB"] = 0] = "\u5F3A\u51FB";
    anomalyEnum[anomalyEnum["\u707C\u70E7"] = 1] = "\u707C\u70E7";
    anomalyEnum[anomalyEnum["\u788E\u51B0"] = 2] = "\u788E\u51B0";
    anomalyEnum[anomalyEnum["\u611F\u7535"] = 3] = "\u611F\u7535";
    anomalyEnum[anomalyEnum["\u4FB5\u8680"] = 4] = "\u4FB5\u8680";
    anomalyEnum[anomalyEnum["\u7D0A\u4E71"] = 5] = "\u7D0A\u4E71";
})(anomalyEnum || (anomalyEnum = {}));
export var buffTypeEnum;
(function (buffTypeEnum) {
    // 通用乘区
    buffTypeEnum[buffTypeEnum["\u653B\u51FB\u529B"] = 0] = "\u653B\u51FB\u529B";
    buffTypeEnum[buffTypeEnum["\u589E\u4F24"] = 1] = "\u589E\u4F24";
    buffTypeEnum[buffTypeEnum["\u6613\u4F24"] = 2] = "\u6613\u4F24";
    buffTypeEnum[buffTypeEnum["\u65E0\u89C6\u6297\u6027"] = 3] = "\u65E0\u89C6\u6297\u6027";
    buffTypeEnum[buffTypeEnum["\u65E0\u89C6\u9632\u5FA1"] = 4] = "\u65E0\u89C6\u9632\u5FA1";
    buffTypeEnum[buffTypeEnum["\u7A7F\u900F\u503C"] = 5] = "\u7A7F\u900F\u503C";
    buffTypeEnum[buffTypeEnum["\u7A7F\u900F\u7387"] = 6] = "\u7A7F\u900F\u7387";
    // 直伤乘区
    buffTypeEnum[buffTypeEnum["\u66B4\u51FB\u7387"] = 7] = "\u66B4\u51FB\u7387";
    buffTypeEnum[buffTypeEnum["\u66B4\u51FB\u4F24\u5BB3"] = 8] = "\u66B4\u51FB\u4F24\u5BB3";
    // 异常乘区
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u7CBE\u901A"] = 9] = "\u5F02\u5E38\u7CBE\u901A";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u589E\u4F24"] = 10] = "\u5F02\u5E38\u589E\u4F24";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u66B4\u51FB\u7387"] = 11] = "\u5F02\u5E38\u66B4\u51FB\u7387";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u66B4\u51FB\u4F24\u5BB3"] = 12] = "\u5F02\u5E38\u66B4\u51FB\u4F24\u5BB3";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u6301\u7EED\u65F6\u95F4"] = 13] = "\u5F02\u5E38\u6301\u7EED\u65F6\u95F4";
    // 其他属性，一般不直接影响伤害，但可能用于buff是否生效判断/转模
    buffTypeEnum[buffTypeEnum["\u751F\u547D\u503C"] = 14] = "\u751F\u547D\u503C";
    buffTypeEnum[buffTypeEnum["\u9632\u5FA1\u529B"] = 15] = "\u9632\u5FA1\u529B";
    buffTypeEnum[buffTypeEnum["\u51B2\u51FB\u529B"] = 16] = "\u51B2\u51FB\u529B";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u638C\u63A7"] = 17] = "\u5F02\u5E38\u638C\u63A7";
})(buffTypeEnum || (buffTypeEnum = {}));
let depth = 0, weakMapCheck = new WeakMap();
/**
 * Buff管理器
 * 用于管理角色局内Buff
 */
export class BuffManager {
    avatar;
    buffs = [];
    /** 套装计数 */
    setCount = {};
    defaultBuff = {};
    constructor(avatar) {
        this.avatar = avatar;
    }
    new(buff) {
        if (Array.isArray(buff)) {
            buff.forEach(b => this.new(b));
            return this.buffs;
        }
        // 简化参数
        if (!buff.name && (buff.source || this.defaultBuff.source) === 'Set' && this.defaultBuff.name && typeof buff.check === 'number')
            buff.name = this.defaultBuff.name + buff.check;
        buff = _.merge({
            status: true,
            isForever: false,
            ...this.defaultBuff
        }, buff);
        if (!buff.source) {
            if (buff.name.includes('核心') || buff.name.includes('天赋'))
                buff.source = 'Talent';
            else if (buff.name.includes('额外能力'))
                buff.source = 'Addition';
            else if (buff.name.includes('影'))
                buff.source = 'Rank';
            else if (buff.name.includes('技'))
                buff.source = 'Skill';
        }
        if (!buff.name || !buff.value || !buff.source || !buffTypeEnum[buffTypeEnum[buff.type]])
            return logger.warn('无效buff：', buff);
        // 武器buff职业检查
        if (buff.source === 'Weapon') {
            if (typeof buff.check === 'function') {
                const oriCheck = buff.check;
                buff.check = ({ avatar, buffM, calc }) => avatar.avatar_profession === weaponIDToProfession(avatar.weapon.id) && oriCheck({ avatar, buffM, calc });
            }
            else {
                buff.check = ({ avatar }) => avatar.avatar_profession === weaponIDToProfession(avatar.weapon.id);
            }
        }
        else if (buff.source === 'Rank') {
            buff.check ??= +buff.name.match(/\d/)?.[0];
        }
        this.buffs.push(buff);
        return this.buffs;
    }
    _filter(buffs, param, valueOcalc) {
        depth++;
        try {
            if (typeof param === 'string') {
                buffs = buffs.filter(buff => buff[param] === valueOcalc);
            }
            else if (typeof param === 'object') {
                buffs = buffs.filter(buff => {
                    if (buff.status === false)
                        return false;
                    for (const key in param) {
                        if (key === 'range') {
                            const buffRange = buff.range;
                            if (!buffRange || !param.range)
                                continue; // 对任意类型生效
                            param.range = param.range.filter(r => typeof r === 'string');
                            if (!param.range.length)
                                continue;
                            // buff作用范围向后覆盖
                            else if (!param.range.every(ST => buffRange.some(BT => ST.startsWith(BT))))
                                return false;
                            else
                                continue;
                        }
                        else if (key === 'element') {
                            if (!buff.element || !param.element)
                                continue; // 对任意属性生效
                            if (Array.isArray(buff.element)) {
                                if (buff.element.includes(param.element))
                                    continue;
                                return false;
                            }
                        }
                        // @ts-ignore
                        if (buff[key] !== param[key])
                            return false;
                    }
                    if (buff.check) {
                        if (typeof buff.check === 'number') {
                            if (buff.source === 'Set' && (this.setCount[buff.name.replace(/\d$/, '')] < buff.check))
                                return false;
                            else if (buff.source === 'Rank' && (this.avatar.rank < buff.check))
                                return false;
                        }
                        else if (valueOcalc) {
                            if (weakMapCheck.has(buff)) {
                                // console.log(`depth：${depth} ${buff.name}：${weakMapCheck.get(buff)}`)
                                if (!weakMapCheck.get(buff))
                                    return false;
                            }
                            else {
                                weakMapCheck.set(buff, false);
                                if (!buff.check({
                                    avatar: this.avatar,
                                    buffM: this,
                                    calc: valueOcalc
                                }))
                                    return false;
                                weakMapCheck.set(buff, true);
                            }
                        }
                        else {
                            logger.debug('未传入calc：' + buff.name);
                            return false;
                        }
                    }
                    return true;
                });
            }
            else {
                buffs = buffs.filter(param);
            }
        }
        catch (e) {
            logger.error(e);
        }
        if (--depth === 0) {
            // console.log('重置weakMapCheck')
            weakMapCheck = new WeakMap();
        }
        return buffs;
    }
    /**
     * 遍历buff列表
     */
    forEach(fnc) {
        return this.buffs.forEach(fnc);
    }
    filter(param, valueOcalc) {
        // @ts-ignore
        return this._filter(this.buffs, param, valueOcalc);
    }
    operator(type, value, fnc) {
        this.forEach(buff => {
            if (buff[type] === value) {
                fnc(buff);
            }
        });
    }
    /**
     * 关闭符合条件的所有buff
     */
    close(type, value) {
        this.operator(type, value, buff => buff.status = false);
    }
    /**
     * 开启符合条件的所有buff
     */
    open(type, value) {
        this.operator(type, value, buff => buff.status = true);
    }
    default(param, value) {
        if (typeof param === 'object') {
            this.defaultBuff = param;
        }
        else {
            if (value === undefined)
                delete this.defaultBuff[param];
            else
                this.defaultBuff[param] = value;
        }
    }
}
