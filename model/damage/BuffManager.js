import _ from 'lodash';
export var elementEnum;
(function (elementEnum) {
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
    anomalyEnum[anomalyEnum["\u754F\u7F29"] = 6] = "\u754F\u7F29";
    anomalyEnum[anomalyEnum["\u971C\u5BD2"] = 7] = "\u971C\u5BD2";
})(anomalyEnum || (anomalyEnum = {}));
export var buffTypeEnum;
(function (buffTypeEnum) {
    buffTypeEnum[buffTypeEnum["\u653B\u51FB\u529B"] = 0] = "\u653B\u51FB\u529B";
    buffTypeEnum[buffTypeEnum["\u500D\u7387"] = 1] = "\u500D\u7387";
    buffTypeEnum[buffTypeEnum["\u589E\u4F24"] = 2] = "\u589E\u4F24";
    buffTypeEnum[buffTypeEnum["\u6613\u4F24"] = 3] = "\u6613\u4F24";
    buffTypeEnum[buffTypeEnum["\u65E0\u89C6\u6297\u6027"] = 4] = "\u65E0\u89C6\u6297\u6027";
    buffTypeEnum[buffTypeEnum["\u65E0\u89C6\u9632\u5FA1"] = 5] = "\u65E0\u89C6\u9632\u5FA1";
    buffTypeEnum[buffTypeEnum["\u7A7F\u900F\u503C"] = 6] = "\u7A7F\u900F\u503C";
    buffTypeEnum[buffTypeEnum["\u7A7F\u900F\u7387"] = 7] = "\u7A7F\u900F\u7387";
    buffTypeEnum[buffTypeEnum["\u66B4\u51FB\u7387"] = 8] = "\u66B4\u51FB\u7387";
    buffTypeEnum[buffTypeEnum["\u66B4\u51FB\u4F24\u5BB3"] = 9] = "\u66B4\u51FB\u4F24\u5BB3";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u7CBE\u901A"] = 10] = "\u5F02\u5E38\u7CBE\u901A";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u589E\u4F24"] = 11] = "\u5F02\u5E38\u589E\u4F24";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u66B4\u51FB\u7387"] = 12] = "\u5F02\u5E38\u66B4\u51FB\u7387";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u66B4\u51FB\u4F24\u5BB3"] = 13] = "\u5F02\u5E38\u66B4\u51FB\u4F24\u5BB3";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u6301\u7EED\u65F6\u95F4"] = 14] = "\u5F02\u5E38\u6301\u7EED\u65F6\u95F4";
    buffTypeEnum[buffTypeEnum["\u751F\u547D\u503C"] = 15] = "\u751F\u547D\u503C";
    buffTypeEnum[buffTypeEnum["\u9632\u5FA1\u529B"] = 16] = "\u9632\u5FA1\u529B";
    buffTypeEnum[buffTypeEnum["\u51B2\u51FB\u529B"] = 17] = "\u51B2\u51FB\u529B";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u638C\u63A7"] = 18] = "\u5F02\u5E38\u638C\u63A7";
})(buffTypeEnum || (buffTypeEnum = {}));
let depth = 0, weakMapCheck = new WeakMap();
export class BuffManager {
    avatar;
    buffs = [];
    setCount = Object.create(null);
    defaultBuff = Object.create(null);
    constructor(avatar) {
        this.avatar = avatar;
    }
    new(buff) {
        if (Array.isArray(buff)) {
            buff.forEach(b => this.new(b));
            return this.buffs;
        }
        if (!buff.name && (buff.source || this.defaultBuff.source) === 'Set' && this.defaultBuff.name && typeof buff.check === 'number')
            buff.name = this.defaultBuff.name + buff.check;
        const oriBuff = buff;
        buff = _.merge({
            status: true,
            isForever: false,
            is: Object.create(null),
            ...this.defaultBuff
        }, buff);
        if (buff.isForever)
            buff.is.forever = true;
        if (buff.range && !Array.isArray(buff.range))
            buff.range = oriBuff.range = [buff.range];
        if (!buff.source) {
            if (buff.name.includes('核心') || buff.name.includes('天赋'))
                buff.source = oriBuff.source = 'Talent';
            else if (buff.name.includes('额外能力'))
                buff.source = oriBuff.source = 'Addition';
            else if (buff.name.includes('影'))
                buff.source = oriBuff.source = 'Rank';
            else if (buff.name.includes('技'))
                buff.source = oriBuff.source = 'Skill';
        }
        if (!buff.name || !buff.value || !buff.source || !buffTypeEnum[buffTypeEnum[buff.type]])
            return logger.warn('无效buff：', buff);
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
            buff.check ??= oriBuff.check = +buff.name.match(/\d/)?.[0];
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
                        if (typeof valueOcalc !== 'object' || Array.isArray(valueOcalc))
                            return true;
                        if (buff.exclude && buff.exclude.includes(valueOcalc.skill.type))
                            return false;
                        if (buff.range || buff.include) {
                            if (buff.include && buff.include.includes(valueOcalc.skill.type))
                                return true;
                            if (!buff.range)
                                return false;
                            const buffRange = buff.range;
                            const skillRange = param.range?.filter(r => typeof r === 'string');
                            if (!skillRange?.length)
                                return true;
                            else if (param.redirect) {
                                if (skillRange.some(ST => buffRange.some(BT => BT === ST)))
                                    return true;
                                const redirect = Array.isArray(param.redirect) ? param.redirect : [param.redirect];
                                if (buffRange.some(BT => redirect.some(RT => RT.startsWith(BT))))
                                    return true;
                                return false;
                            }
                            return skillRange.some(ST => buffRange.some(BT => ST.startsWith(BT)));
                        }
                        return true;
                    })();
                    if (!judge)
                        return false;
                    for (const key in param) {
                        if (key === 'redirect' || key === 'range')
                            continue;
                        if (key === 'element') {
                            if (!buff.element || !param.element)
                                continue;
                            if (Array.isArray(buff.element)) {
                                if (buff.element.includes(param.element))
                                    continue;
                                return false;
                            }
                        }
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
            weakMapCheck = new WeakMap();
        }
        return buffs;
    }
    filter(param, valueOcalc) {
        return this._filter(this.buffs, param, valueOcalc);
    }
    forEach(fnc) {
        return this.buffs.forEach(fnc);
    }
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
    close(type, value) {
        this.operator(type, value, buff => buff.status = false);
    }
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
