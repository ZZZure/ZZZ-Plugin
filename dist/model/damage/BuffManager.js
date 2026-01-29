export var rarityEnum;
(function (rarityEnum) {
    rarityEnum[rarityEnum["S"] = 0] = "S";
    rarityEnum[rarityEnum["A"] = 1] = "A";
    rarityEnum[rarityEnum["B"] = 2] = "B";
})(rarityEnum || (rarityEnum = {}));
export var elementEnum;
(function (elementEnum) {
    elementEnum[elementEnum["Physical"] = 200] = "Physical";
    elementEnum[elementEnum["Fire"] = 201] = "Fire";
    elementEnum[elementEnum["Ice"] = 202] = "Ice";
    elementEnum[elementEnum["Electric"] = 203] = "Electric";
    elementEnum[elementEnum["Ether"] = 205] = "Ether";
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
    buffTypeEnum[buffTypeEnum["\u5931\u8861\u6613\u4F24"] = 8] = "\u5931\u8861\u6613\u4F24";
    buffTypeEnum[buffTypeEnum["\u66B4\u51FB\u7387"] = 9] = "\u66B4\u51FB\u7387";
    buffTypeEnum[buffTypeEnum["\u66B4\u51FB\u4F24\u5BB3"] = 10] = "\u66B4\u51FB\u4F24\u5BB3";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u7CBE\u901A"] = 11] = "\u5F02\u5E38\u7CBE\u901A";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u589E\u4F24"] = 12] = "\u5F02\u5E38\u589E\u4F24";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u66B4\u51FB\u7387"] = 13] = "\u5F02\u5E38\u66B4\u51FB\u7387";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u66B4\u51FB\u4F24\u5BB3"] = 14] = "\u5F02\u5E38\u66B4\u51FB\u4F24\u5BB3";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u6301\u7EED\u65F6\u95F4"] = 15] = "\u5F02\u5E38\u6301\u7EED\u65F6\u95F4";
    buffTypeEnum[buffTypeEnum["\u8D2F\u7A7F\u529B"] = 16] = "\u8D2F\u7A7F\u529B";
    buffTypeEnum[buffTypeEnum["\u8D2F\u7A7F\u589E\u4F24"] = 17] = "\u8D2F\u7A7F\u589E\u4F24";
    buffTypeEnum[buffTypeEnum["\u751F\u547D\u503C"] = 18] = "\u751F\u547D\u503C";
    buffTypeEnum[buffTypeEnum["\u9632\u5FA1\u529B"] = 19] = "\u9632\u5FA1\u529B";
    buffTypeEnum[buffTypeEnum["\u51B2\u51FB\u529B"] = 20] = "\u51B2\u51FB\u529B";
    buffTypeEnum[buffTypeEnum["\u5F02\u5E38\u638C\u63A7"] = 21] = "\u5F02\u5E38\u638C\u63A7";
})(buffTypeEnum || (buffTypeEnum = {}));
export var professionEnum;
(function (professionEnum) {
    professionEnum[professionEnum["\u5F3A\u653B"] = 1] = "\u5F3A\u653B";
    professionEnum[professionEnum["\u51FB\u7834"] = 2] = "\u51FB\u7834";
    professionEnum[professionEnum["\u5F02\u5E38"] = 3] = "\u5F02\u5E38";
    professionEnum[professionEnum["\u652F\u63F4"] = 4] = "\u652F\u63F4";
    professionEnum[professionEnum["\u9632\u62A4"] = 5] = "\u9632\u62A4";
    professionEnum[professionEnum["\u547D\u7834"] = 6] = "\u547D\u7834";
})(professionEnum || (professionEnum = {}));
export const elementType2element = (elementType) => elementEnum[elementType];
export const runtime = { elementType2element, rarityEnum, elementEnum, anomalyEnum, buffTypeEnum, professionEnum };
let depth = 0, weakMapCheck = new WeakMap();
export class BuffManager {
    avatar;
    buffs = [];
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
        if (!buff.name && (buff.source || this.defaultBuff.source) === '套装' && this.defaultBuff.name && typeof buff.check === 'number')
            buff.name = this.defaultBuff.name + buff.check;
        const oriBuff = buff;
        buff = { status: true, ...this.defaultBuff, ...buff };
        if (buff.range && !Array.isArray(buff.range))
            buff.range = oriBuff.range = [buff.range];
        if (!buff.source) {
            if (buff.name.includes('核心') || buff.name.includes('天赋'))
                buff.source = oriBuff.source = '核心被动';
            else if (buff.name.includes('额外能力'))
                buff.source = oriBuff.source = '额外能力';
            else if (/^\d影/.test(buff.name))
                buff.source = oriBuff.source = '影画';
            else if (buff.name.includes('技'))
                buff.source = oriBuff.source = '技能';
        }
        for (const key of ['name', 'value', 'source']) {
            if (!buff[key])
                return logger.warn(`无效buff：缺少${key}字段`, buff);
        }
        if (buffTypeEnum[buffTypeEnum[buff.type]] !== buff.type)
            return logger.warn(`无效buff：非法type字段`, buff);
        if (buff.source === '音擎') {
            const professionCheck = (avatar) => {
                const weapon_profession = avatar.weapon?.profession;
                if (!weapon_profession)
                    return true;
                return avatar.avatar_profession === weapon_profession;
            };
            const oriCheck = typeof buff.check === 'function' && buff.check;
            buff.check = ({ avatar, buffM, calc, runtime }) => professionCheck(avatar) && (!oriCheck || oriCheck({ avatar, buffM, calc, runtime }));
        }
        else if (buff.source === '影画' && !buff.check) {
            buff.check = oriBuff.check = +buff.name[0];
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
                            if (buff.source === '套装' && (this.setCount[buff.name.replace(/\d$/, '')] < buff.check))
                                return false;
                            else if (buff.source === '影画' && (this.avatar.rank < buff.check))
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
                                    calc: valueOcalc,
                                    runtime
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
                    if (buff.teamTarget) {
                        if (typeof buff.teamTarget === 'function') {
                            const result = buff.teamTarget({ teammates: [], avatar: this.avatar, buffM: this, calc: valueOcalc, runtime });
                            if (Array.isArray(result))
                                return result.includes(this.avatar);
                            return result;
                        }
                        return buff.teamTarget;
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
    operator(key, value, fnc) {
        const isMatch = typeof key === 'object' ?
            (targetBuff) => Object.entries(key).every(([k, v]) => targetBuff[k] === v) :
            (targetBuff) => targetBuff[key] === value;
        this.forEach(buff => isMatch(buff) && (fnc || value)(buff));
    }
    close(key, value) {
        if (typeof key === 'object')
            this.operator(key, buff => buff.status = false);
        else
            this.operator(key, value, buff => buff.status = false);
    }
    open(key, value) {
        if (typeof key === 'object')
            this.operator(key, buff => buff.status = true);
        else
            this.operator(key, value, buff => buff.status = true);
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
//# sourceMappingURL=BuffManager.js.map