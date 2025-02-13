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
    // 伤害异常
    anomalyEnum[anomalyEnum["\u5F3A\u51FB"] = 0] = "\u5F3A\u51FB";
    anomalyEnum[anomalyEnum["\u707C\u70E7"] = 1] = "\u707C\u70E7";
    anomalyEnum[anomalyEnum["\u788E\u51B0"] = 2] = "\u788E\u51B0";
    anomalyEnum[anomalyEnum["\u611F\u7535"] = 3] = "\u611F\u7535";
    anomalyEnum[anomalyEnum["\u4FB5\u8680"] = 4] = "\u4FB5\u8680";
    anomalyEnum[anomalyEnum["\u7D0A\u4E71"] = 5] = "\u7D0A\u4E71";
    // 状态异常（异常持续时间buff应作用于对应的状态异常）
    anomalyEnum[anomalyEnum["\u754F\u7F29"] = 6] = "\u754F\u7F29";
    anomalyEnum[anomalyEnum["\u971C\u5BD2"] = 7] = "\u971C\u5BD2";
})(anomalyEnum || (anomalyEnum = {}));
export var buffTypeEnum;
(function (buffTypeEnum) {
    // 通用乘区
    buffTypeEnum[buffTypeEnum["\u653B\u51FB\u529B"] = 0] = "\u653B\u51FB\u529B";
    buffTypeEnum[buffTypeEnum["\u500D\u7387"] = 1] = "\u500D\u7387";
    buffTypeEnum[buffTypeEnum["\u589E\u4F24"] = 2] = "\u589E\u4F24";
    buffTypeEnum[buffTypeEnum["\u6613\u4F24"] = 3] = "\u6613\u4F24";
    buffTypeEnum[buffTypeEnum["\u65E0\u89C6\u6297\u6027"] = 4] = "\u65E0\u89C6\u6297\u6027";
    buffTypeEnum[buffTypeEnum["\u65E0\u89C6\u9632\u5FA1"] = 5] = "\u65E0\u89C6\u9632\u5FA1";
    buffTypeEnum[buffTypeEnum["\u7A7F\u900F\u503C"] = 6] = "\u7A7F\u900F\u503C";
    buffTypeEnum[buffTypeEnum["\u7A7F\u900F\u7387"] = 7] = "\u7A7F\u900F\u7387";
    // 直伤乘区
    buffTypeEnum[buffTypeEnum["\u66B4\u51FB\u7387"] = 8] = "\u66B4\u51FB\u7387";
    buffTypeEnum[buffTypeEnum["\u66B4\u51FB\u4F24\u5BB3"] = 9] = "\u66B4\u51FB\u4F24\u5BB3";
    // 异常乘区
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u7CBE\u901A"] = 10] = "\u5F02\u5E38\u7CBE\u901A";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u589E\u4F24"] = 11] = "\u5F02\u5E38\u589E\u4F24";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u66B4\u51FB\u7387"] = 12] = "\u5F02\u5E38\u66B4\u51FB\u7387";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u66B4\u51FB\u4F24\u5BB3"] = 13] = "\u5F02\u5E38\u66B4\u51FB\u4F24\u5BB3";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u6301\u7EED\u65F6\u95F4"] = 14] = "\u5F02\u5E38\u6301\u7EED\u65F6\u95F4";
    // 其他属性，一般不直接影响伤害，但可能用于buff是否生效判断/转模
    buffTypeEnum[buffTypeEnum["\u751F\u547D\u503C"] = 15] = "\u751F\u547D\u503C";
    buffTypeEnum[buffTypeEnum["\u9632\u5FA1\u529B"] = 16] = "\u9632\u5FA1\u529B";
    buffTypeEnum[buffTypeEnum["\u51B2\u51FB\u529B"] = 17] = "\u51B2\u51FB\u529B";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u638C\u63A7"] = 18] = "\u5F02\u5E38\u638C\u63A7";
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
            const professionCheck = (avatar) => {
                const weapon_profession = avatar.weapon?.profession;
                if (!weapon_profession)
                    return true;
                return avatar.avatar_profession === weapon_profession;
            };
            const oriCheck = typeof buff.check === 'function' && buff.check;
            buff.check = ({ avatar, buffM, calc }) => professionCheck(avatar) && (!oriCheck || oriCheck({ avatar, buffM, calc }));
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
                    const judge = (() => {
                        // 未传入calc时不判断range、include、exclude
                        if (typeof valueOcalc !== 'object' || Array.isArray(valueOcalc))
                            return true;
                        // buff指定排除该技能
                        if (buff.exclude && buff.exclude.includes(valueOcalc.skill.type))
                            return false;
                        // 11 10 01
                        if (buff.range || buff.include) {
                            // 11 01 存在include且满足时则直接返回true
                            if (buff.include && buff.include.includes(valueOcalc.skill.type))
                                return true;
                            // 01 没有range则代表只有include，直接返回false
                            if (!buff.range)
                                return false;
                            // 11 10 直接返回range的结果即可
                            const buffRange = buff.range;
                            const skillRange = param.range?.filter(r => typeof r === 'string');
                            if (!skillRange?.length)
                                return true; // 对任意类型生效
                            // buff作用范围向后覆盖
                            // 存在重定向时，range须全匹配，redirect向后覆盖
                            else if (param.redirect) {
                                if (skillRange.some(ST => buffRange.some(BT => BT === ST)))
                                    return true;
                                if (buffRange.some(BT => param.redirect.startsWith(BT)))
                                    return true;
                                return false;
                            }
                            // 不存在重定向时，range向后覆盖
                            return skillRange.some(ST => buffRange.some(BT => ST.startsWith(BT)));
                        }
                        // 00
                        return true;
                    })();
                    if (!judge)
                        return false;
                    for (const key in param) {
                        if (key === 'redirect' || key === 'range')
                            continue;
                        if (key === 'element') {
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
    filter(param, valueOcalc) {
        // @ts-ignore
        return this._filter(this.buffs, param, valueOcalc);
    }
    /** 遍历buff列表 */
    forEach(fnc) {
        return this.buffs.forEach(fnc);
    }
    /** 查找指定buff */
    find(type, value) {
        return this.buffs.find(buff => buff[type] === value);
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
