import { getSuitImage, getWeaponImage } from '../lib/download.js';
import { getEquipPropertyEnhanceCount } from '../lib/score.js';
import { property } from '../lib/convert.js';
import Score from './score/Score.js';
export class EquipProperty {
    property_name;
    property_id;
    base;
    base_score;
    classname;
    count;
    constructor(data) {
        const { property_name, property_id, base } = data;
        this.property_name = property_name;
        this.property_id = property_id;
        this.base = base;
        this.base_score = 0;
        this.classname = property.idToClassName(property_id);
        this.count = getEquipPropertyEnhanceCount(property_id, base);
    }
}
export class EquipMainProperty {
    property_name;
    property_id;
    base;
    classname;
    constructor(data) {
        const { property_name, property_id, base } = data;
        this.property_name = property_name;
        this.property_id = property_id;
        this.base = base;
        this.classname = property.idToClassName(property_id);
    }
    get short_name() {
        if (this.property_name.includes('属性伤害加成')) {
            return this.property_name.replace('属性伤害加成', '伤加成');
        }
        if (this.property_name === '能量自动回复') {
            return '能量回复';
        }
        return this.property_name;
    }
}
export class EquipSuit {
    suit_id;
    name;
    own;
    desc1;
    desc2;
    constructor(suit_id, name, own, desc1, desc2) {
        this.suit_id = suit_id;
        this.name = name;
        this.own = own;
        this.desc1 = desc1;
        this.desc2 = desc2;
    }
}
export class Equip {
    id;
    level;
    name;
    icon;
    rarity;
    properties;
    main_properties;
    equip_suit;
    equipment_type;
    suit_icon;
    score;
    constructor(data) {
        const { id, level, name, icon, rarity, properties, main_properties, equip_suit, equipment_type, } = data;
        this.id = id;
        this.level = level;
        this.name = name;
        this.icon = icon;
        this.rarity = rarity;
        this.properties = properties.map(item => new EquipProperty(item));
        this.main_properties = main_properties.map(item => new EquipMainProperty(item));
        this.equip_suit = equip_suit;
        this.equipment_type = equipment_type;
    }
    get_property(id) {
        const result = this.properties.find(item => item.property_id === id)?.base || '0';
        return Number(result);
    }
    async get_assets() {
        const result = await getSuitImage(this.id);
        this.suit_icon = result;
    }
    get_score(weight) {
        if (!weight)
            return this.score;
        this.properties.forEach(item => item.base_score = weight[item.property_id] || 0);
        this.score = Score.main(this, weight);
        return this.score;
    }
    get comment() {
        if (this.score <= 12) {
            return 'C';
        }
        if (this.score < 20) {
            return 'B';
        }
        if (this.score < 28) {
            return 'A';
        }
        if (this.score < 32) {
            return 'S';
        }
        if (this.score < 36) {
            return 'SS';
        }
        if (this.score < 40) {
            return 'SSS';
        }
        if (this.score < 48) {
            return 'ACE';
        }
        if (this.score >= 48) {
            return 'MAX';
        }
        return false;
    }
}
export class Weapon {
    id;
    level;
    name;
    star;
    icon;
    rarity;
    properties;
    main_properties;
    talent_title;
    talent_content;
    profession;
    level_rank;
    square_icon;
    constructor(data) {
        const { id, level, name, star, icon, rarity, properties, main_properties, talent_title, talent_content, profession, } = data;
        this.id = id;
        this.level = level;
        this.name = name;
        this.star = star;
        this.icon = icon;
        this.rarity = rarity;
        this.properties = properties.map(item => new EquipProperty(item));
        this.main_properties = main_properties.map(item => new EquipMainProperty(item));
        this.talent_title = talent_title;
        this.talent_content = talent_content;
        this.profession = profession;
        this.level_rank = Math.floor(level / 10);
    }
    async get_assets() {
        const result = await getWeaponImage(this.id);
        this.square_icon = result;
    }
}
//# sourceMappingURL=equip.js.map