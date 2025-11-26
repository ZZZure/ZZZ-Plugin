import { getMapData } from '../../utils/file.js';
var Rarity;
(function (Rarity) {
    Rarity[Rarity["S"] = 4] = "S";
    Rarity[Rarity["A"] = 3] = "A";
    Rarity[Rarity["B"] = 2] = "B";
})(Rarity || (Rarity = {}));
const WeaponId2Data = getMapData('WeaponId2Data');
const PartnerId2Data = getMapData('PartnerId2Data');
const SuitData = getMapData('SuitData');
const id2zh = {
    111: '生命值',
    121: '攻击力',
    122: '冲击力',
    131: '防御力',
    201: '暴击率',
    211: '暴击伤害',
    231: '穿透率',
    232: '穿透值',
    305: '能量自动回复',
    312: '异常精通',
    314: '异常掌控',
    315: '物理伤害加成',
    316: '火属性伤害加成',
    317: '冰属性伤害加成',
    318: '电属性伤害加成',
    319: '以太伤害加成'
};
const zh2id = Object.fromEntries(Object.entries(id2zh).map(([key, value]) => [value, +key]));
const id2en = {
    111: 'HpMax',
    121: 'Attack',
    122: 'BreakStun',
    131: 'Defence',
    201: 'Crit',
    211: 'CritDamage',
    231: 'PenRate',
    232: 'PenDelta',
    305: 'SpRecover',
    312: 'ElementMystery',
    314: 'ElementAbnormalPower',
    315: 'PhysDmgBonus',
    316: 'FireDmgBonus',
    317: 'IceDmgBonus',
    318: 'ThunderDmgBonus',
    319: 'EtherDmgBonus'
};
const en2id = Object.fromEntries(Object.entries(id2en).map(([key, value]) => [value, +key]));
const percentPropId = [11102, 12102, 12202, 13102, 20103, 21103, 23103, 30502, 31402, 31503, 31603, 31703, 31803, 31903];
function get_base(propId, value) {
    if (percentPropId.includes(propId)) {
        const v = value / 100;
        return v.toFixed(v % 1 === 0 ? 0 : 1) + '%';
    }
    return Math.trunc(value).toString();
}
export class Equip {
    enkaEquip;
    Equipment;
    id;
    data;
    info;
    equip;
    constructor(enkaEquip) {
        this.enkaEquip = enkaEquip;
        this.Equipment = this.enkaEquip.Equipment;
        this.id = this.Equipment.Id;
        this.data = SuitData[`${this.id.toString().slice(0, 3)}00`];
        if (!this.data) {
            throw new Error(`驱动盘数据缺失: ${this.id}`);
        }
        this.info = this.init();
        this.equip = this.info;
    }
    static main(EquippedList) {
        const equips = [];
        for (const equip of EquippedList) {
            if (equip.Equipment?.Id) {
                const e = new Equip(equip);
                equips.push(e.main());
            }
        }
        const cache = {};
        for (const equip of equips) {
            const suit_id = equip.equip_suit.suit_id;
            cache[suit_id] ??= equips.reduce((acc, cur) => {
                if (cur.equip_suit.suit_id === suit_id) {
                    return acc + 1;
                }
                return acc;
            }, 0);
            equip.equip_suit.own = cache[suit_id];
        }
        return equips;
    }
    main() {
        this.equip.properties = this.properties(this.Equipment.RandomPropertyList, false);
        this.equip.main_properties = this.properties(this.Equipment.MainPropertyList, true);
        this.equip.equip_suit = this.equip_suit();
        return this.equip;
    }
    init() {
        return {
            id: this.id,
            level: this.Equipment.Level,
            name: `${this.data.name}[${this.enkaEquip.Slot}]`,
            icon: '',
            rarity: Rarity[+String(this.id)[3]] || 'S',
            equipment_type: this.enkaEquip.Slot,
            invalid_property_cnt: 0,
            all_hit: false
        };
    }
    properties(enkaProperties, isMain) {
        const properties = [];
        for (const p of enkaProperties) {
            const property = {};
            const propId = p.PropertyId;
            property.property_name = id2zh[propId.toString().slice(0, 3)];
            property.property_id = propId;
            const value = p.PropertyValue * (isMain ? (1 + this.info.level * ({
                S: 0.2,
                A: 0.25,
                B: 0.3
            })[this.info.rarity]) : p.PropertyLevel);
            property.base = get_base(propId, value);
            property.level = p.PropertyLevel;
            property.valid = false;
            property.system_id = 0;
            property.add = p.PropertyLevel - 1;
            properties.push(property);
        }
        return properties;
    }
    equip_suit() {
        return {
            suit_id: +`${this.id.toString().slice(0, 3)}00`,
            name: this.data.name,
            own: 0,
            desc1: this.data.desc1,
            desc2: this.data.desc2
        };
    }
}
export class Weapon {
    enkaWeapon;
    id;
    data;
    info;
    weapon;
    constructor(enkaWeapon) {
        this.enkaWeapon = enkaWeapon;
        this.id = this.enkaWeapon.Id;
        this.data = WeaponId2Data[this.id];
        if (!this.data) {
            throw new Error(`音擎数据缺失: ${this.id}`);
        }
        this.info = this.init();
        this.weapon = this.info;
    }
    static main(enkaWeapon) {
        if (!enkaWeapon)
            return null;
        const weapon = new Weapon(enkaWeapon);
        return weapon.main();
    }
    main() {
        this.weapon.properties = this.properties(false);
        this.weapon.main_properties = this.properties(true);
        return this.weapon;
    }
    init() {
        return {
            id: this.id,
            level: this.enkaWeapon.Level,
            name: this.data.Name,
            star: this.enkaWeapon.UpgradeLevel,
            icon: '',
            rarity: this.data.Rarity,
            talent_title: this.data.Talents[1].Name,
            talent_content: this.data.Talents[1].Desc,
            profession: this.data.Profession
        };
    }
    properties(isMain) {
        const property = {};
        const p = this.data[isMain ? 'BaseProperty' : 'RandProperty'];
        const propId = p.Id;
        property.property_name = id2zh[propId.toString().slice(0, 3)];
        if (isMain && property.property_name === '攻击力') {
            property.property_name = '基础攻击力';
        }
        property.property_id = propId;
        let value;
        const baseValue = p.Value;
        if (isMain) {
            value = baseValue * (1 +
                (this.data.Level[this.info.level].Rate +
                    this.data.Stars[this.enkaWeapon.BreakLevel].StarRate) / 10000);
        }
        else {
            value = baseValue * (1 + this.data.Stars[this.enkaWeapon.BreakLevel].RandRate / 10000);
        }
        property.base = get_base(propId, value);
        property.level = 0;
        property.valid = false;
        property.system_id = 0;
        property.add = 0;
        return [property];
    }
}
let isToFixed = true;
export class Property {
    info;
    equips;
    weapon;
    enkaAvatar;
    data;
    keepPercent = [201, 211, 231, 315, 316, 317, 318, 319];
    constructor(info, equips, weapon, enkaAvatar) {
        this.info = info;
        this.equips = equips;
        this.weapon = weapon;
        this.enkaAvatar = enkaAvatar;
        this.data = PartnerId2Data[this.info.id];
    }
    static main(info, equips, weapon, enkaAvatar) {
        return new Property(info, equips, weapon, enkaAvatar).main();
    }
    main() {
        const initial = this.initial();
        const properties = initial.map(prop => {
            const propId = prop.property_id;
            const isPercent = this.keepPercent.includes(propId);
            if (!isToFixed) {
                return {
                    property_name: prop.property_name,
                    property_id: prop.property_id,
                    base: isPercent ? `${prop.base}%` : `${prop.base}`,
                    add: isPercent ? `${prop.add}%` : `${prop.add}`,
                    final: isPercent ? `${prop.final}%` : `${prop.final}`,
                };
            }
            const isTofixed2 = propId === 305;
            return {
                property_name: prop.property_name,
                property_id: prop.property_id,
                base: isPercent ? `${prop.base.toFixed(1)}%` : `${isTofixed2 ? prop.base.toFixed(2) : prop.base}`,
                add: isPercent ? `${prop.add.toFixed(1)}%` : `${isTofixed2 ? prop.add.toFixed(2) : prop.add}`,
                final: isPercent ? `${prop.final.toFixed(1)}%` : `${isTofixed2 ? prop.final.toFixed(2) : prop.final}`,
            };
        });
        const elementType2PropId = {
            200: 315,
            201: 316,
            202: 317,
            203: 318,
            205: 319
        };
        const elementIds = Object.values(elementType2PropId);
        const propId = elementType2PropId[this.info.element_type];
        if (propId) {
            return properties.filter(prop => !elementIds.includes(prop.property_id) || prop.property_id === propId);
        }
        return properties;
    }
    base() {
        const base = {};
        const ids = Object.keys(id2en).map(Number);
        ids.forEach((id) => {
            const prop = id2en[id];
            if (Object.prototype.hasOwnProperty.call(this.data, prop)) {
                base[id] = +this.data[prop] || 0;
            }
            else {
                base[id] = 0;
            }
        });
        [111, 121, 131].forEach((id) => {
            const prop = id2en[id];
            if (this.info.level) {
                const growth = ({
                    111: this.data.HpGrowth,
                    121: this.data.AttackGrowth,
                    131: this.data.DefenceGrowth
                })[id] || 0;
                base[id] += (this.info.level - 1) * growth / 10000;
            }
            const PromotionLevel = this.enkaAvatar.PromotionLevel || 0;
            base[id] += this.data.Level[PromotionLevel][prop] || 0;
        });
        const CoreSkillEnhancement = this.enkaAvatar.CoreSkillEnhancement || 0;
        if (CoreSkillEnhancement) {
            const extra = this.data.ExtraLevel[CoreSkillEnhancement].Extra;
            const extraIds = Object.keys(extra).map(Number);
            extraIds.forEach((id) => base[id.toString().slice(0, 3)] += extra[id].Value || 0);
        }
        if (this.weapon) {
            for (const property of this.weapon.main_properties) {
                base[property.property_id.toString().slice(0, 3)] += +property.base;
            }
        }
        ids.forEach(id => base[id] = Math.trunc(base[id]));
        [201, 211, 231, 305].forEach(id => base[id] /= 100);
        return base;
    }
    en2id(data) {
        const idData = {};
        const ens = Object.keys(data);
        ens.forEach((en) => {
            const id = en2id[en];
            idData[id] = data[en] || 0;
        });
        return idData;
    }
    en2zh(data) {
        const idData = this.en2id(data);
        return this.id2zh(idData);
    }
    id2zh(idData) {
        const zhData = {};
        const ids = Object.keys(idData).map(Number);
        ids.forEach(id => {
            const zh = id2zh[id];
            if (zhData[zh]) {
                if (!idData[id])
                    return;
                zhData[zh] += idData[id];
            }
            else {
                zhData[zh] = idData[id] || 0;
            }
        });
        return zhData;
    }
    initial(base = this.id2zh(this.base())) {
        const properties = Object.entries(base)
            .reduce((acc, [key, value]) => {
            const property_id = zh2id[key];
            acc[property_id] = {
                property_name: key,
                property_id,
                base: value,
                add: 0,
                final: 0
            };
            return acc;
        }, {});
        const all_properties = [];
        if (this.weapon?.properties.length) {
            all_properties.push(...this.weapon.properties);
        }
        for (const equip of this.equips) {
            equip.properties.length && all_properties.push(...equip.properties);
            equip.main_properties.length && all_properties.push(...equip.main_properties);
        }
        const suitIds = Array.from(new Set(this.equips.filter(equip => equip.equip_suit.own >= 2).map(v => v.equip_suit.suit_id)));
        for (const suitId of suitIds) {
            const suitData = SuitData[suitId];
            if (!suitData || !suitData.properties) {
                logger.warn(`驱动盘套装数据缺失: ${suitId}，跳过套装效果计算`);
                continue;
            }
            if (!suitData.properties.length)
                continue;
            all_properties.push(...suitData.properties);
        }
        for (const property of all_properties) {
            const propId = +property.property_id.toString().slice(0, 3);
            if (property.base.includes('%')) {
                if (this.keepPercent.includes(propId)) {
                    properties[propId].add += +property.base.replace('%', '');
                }
                else {
                    properties[propId].add += properties[propId].base * +property.base.replace('%', '') / 100;
                }
            }
            else {
                properties[propId].add += +property.base;
            }
        }
        const sp = special[this.info.id];
        if (sp && sp.initial_before_format) {
            sp.initial_before_format(properties, this);
        }
        if (isToFixed) {
            for (const propId in properties) {
                const property = properties[propId];
                if (this.keepPercent.includes(+propId)) {
                    property.add = +property.add.toFixed(1);
                    property.final = +(property.base + property.add).toFixed(1);
                }
                else if (propId === '305') {
                    property.add = +(Math.trunc(property.add * 100) / 100).toFixed(2);
                    property.final = +(property.base + property.add).toFixed(2);
                }
                else if (propId === '111') {
                    property.add = Math.ceil(property.add);
                    property.final = property.base + property.add;
                }
                else {
                    property.add = Math.trunc(property.add);
                    property.final = property.base + property.add;
                }
            }
        }
        else {
            for (const propId in properties) {
                const property = properties[propId];
                property.final = property.base + property.add;
            }
        }
        if (this.info.avatar_profession === 6) {
            delete properties[231], delete properties[232];
            delete properties[305];
            const sheerForce = Math.trunc(properties[111].final * 1 / 10) +
                Math.trunc(properties[121].final * 3 / 10);
            properties[19] = {
                property_name: '贯穿力',
                property_id: 19,
                base: 0,
                add: sheerForce,
                final: sheerForce
            };
            properties[20] = {
                property_name: '闪能自动累积',
                property_id: 20,
                base: 2,
                add: 0,
                final: 2
            };
        }
        if (sp && sp.initial_after_format) {
            sp.initial_after_format(properties, this);
        }
        return Object.values(properties);
    }
}
export class Skill {
    static main(skills, rank) {
        const result = skills.map(skill => ({
            level: skill.Level,
            skill_type: skill.Index,
            items: []
        }));
        const rankLevel = rank >= 3 ? (rank >= 5 ? 4 : 2) : 0;
        if (rankLevel) {
            result.forEach(skill => {
                if (skill.skill_type === 5)
                    return;
                skill.level += rankLevel;
            });
        }
        return result;
    }
}
export function parseInfo(enkaAvatar) {
    const info = {};
    info.id = enkaAvatar.Id;
    const data = PartnerId2Data[info.id];
    if (!data)
        return;
    info.name_mi18n = data.name;
    info.level = enkaAvatar.Level;
    info.full_name_mi18n = data.full_name;
    info.element_type = +data.ElementType;
    info.camp_name_mi18n = data.Camp;
    info.avatar_profession = +data.WeaponType;
    info.rarity = data.Rarity;
    info.rank = enkaAvatar.TalentLevel;
    info.us_full_name = data.en_name;
    info.sub_element_type = ({
        1091: 1,
        1371: 2,
    })[info.id] || 0;
    info.group_icon_path = '';
    info.hollow_icon_path = '';
    info.role_vertical_painting_url = '';
    info.vertical_painting_color = '';
    info.role_square_url = '';
    return info;
}
export function Enka2Mys(enkaAvatars, __isToFixed__ = true) {
    isToFixed = __isToFixed__;
    const avatars = Array.isArray(enkaAvatars) ? enkaAvatars : [enkaAvatars];
    const results = [];
    for (const enkaAvatar of avatars) {
        try {
            const info = parseInfo(enkaAvatar);
            if (!info) {
                throw `角色数据缺失: ${enkaAvatar.Id}`;
            }
            const avatar = info;
            avatar.ranks = [];
            avatar.equip = Equip.main(enkaAvatar.EquippedList);
            avatar.weapon = Weapon.main(enkaAvatar.Weapon);
            avatar.properties = Property.main(info, avatar.equip, avatar.weapon, enkaAvatar);
            avatar.skills = Skill.main(enkaAvatar.SkillLevelList, enkaAvatar.TalentLevel);
            results.push(avatar);
        }
        catch (error) {
            logger.warn(`Enka数据失败 ID: ${enkaAvatar.Id}\n`, error);
            continue;
        }
    }
    return Array.isArray(enkaAvatars) ? results : results[0];
}
const special = {
    1121: {
        id: 1121,
        name: '本',
        initial_before_format: (properties, { enkaAvatar }) => {
            const core = [0.4, 0.46, 0.52, 0.6, 0.66, 0.72, 0.8];
            const { CoreSkillEnhancement } = enkaAvatar;
            const value = (core[CoreSkillEnhancement] || 0) * Math.trunc(properties[131].base + properties[131].add);
            properties[121].add += Math.trunc(value);
        }
    },
    1441: {
        id: 1441,
        name: '狛野真斗',
        initial_after_format: (properties) => {
            properties[20] = {
                property_name: '闪能自动累积',
                property_id: 20,
                base: 0,
                add: 0,
                final: 0
            };
        }
    },
};
