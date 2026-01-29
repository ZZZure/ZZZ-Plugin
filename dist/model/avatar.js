import { char, element } from '../lib/convert.js';
import { getRoleImage, getSmallSquareAvatar, getSquareAvatar, } from '../lib/download.js';
import { idToShortName2 } from '../lib/convert/property.js';
import { imageResourcesPath } from '../lib/path.js';
import { avatar_calc } from './damage/avatar.js';
import { baseValueData } from '../lib/score.js';
import { Equip, Weapon } from './equip.js';
import { Property } from './property.js';
import Score from './score/Score.js';
import { Skill } from './skill.js';
import path from 'path';
import _ from 'lodash';
import fs from 'fs';
export class Avatar {
    id;
    level;
    name_mi18n;
    full_name_mi18n;
    element_type;
    sub_element_type;
    camp_name_mi18n;
    avatar_profession;
    rarity;
    group_icon_path;
    hollow_icon_path;
    rank;
    is_chosen;
    element_str;
    sub_element_str;
    constructor(id, level, name_mi18n, full_name_mi18n, element_type, sub_element_type, camp_name_mi18n, avatar_profession, rarity, group_icon_path, hollow_icon_path, rank, is_chosen) {
        this.id = id;
        this.level = level;
        this.name_mi18n = name_mi18n;
        this.full_name_mi18n = full_name_mi18n;
        this.element_type = element_type;
        this.sub_element_type = sub_element_type;
        this.camp_name_mi18n = camp_name_mi18n;
        this.avatar_profession = avatar_profession;
        this.rarity = rarity;
        this.group_icon_path = group_icon_path;
        this.hollow_icon_path = hollow_icon_path;
        this.rank = rank;
        this.is_chosen = is_chosen;
        this.element_str = element.idToName(element_type);
        this.sub_element_str = element.idToName(element_type, sub_element_type);
    }
}
export class AvatarIconPaths {
    group_icon_path;
    hollow_icon_path;
    constructor(group_icon_path, hollow_icon_path) {
        this.group_icon_path = group_icon_path;
        this.hollow_icon_path = hollow_icon_path;
    }
}
export class ZZZAvatarBasic {
    id;
    level;
    name_mi18n;
    full_name_mi18n;
    element_type;
    sub_element_type;
    camp_name_mi18n;
    avatar_profession;
    rarity;
    rank;
    is_chosen;
    element_str;
    sub_element_str;
    square_icon;
    constructor(data) {
        const { id, level, name_mi18n, full_name_mi18n, element_type, sub_element_type = 0, camp_name_mi18n, avatar_profession, rarity, rank, is_chosen, } = data;
        this.id = id;
        this.level = level;
        this.name_mi18n = name_mi18n;
        this.full_name_mi18n = full_name_mi18n;
        this.element_type = element_type;
        this.sub_element_type = sub_element_type;
        this.camp_name_mi18n = camp_name_mi18n;
        this.avatar_profession = avatar_profession;
        this.rarity = rarity;
        this.rank = rank;
        this.is_chosen = is_chosen;
        this.element_str = element.idToName(element_type);
        this.sub_element_str = element.idToName(element_type, sub_element_type);
    }
    async get_assets() {
        const result = await getSquareAvatar(this.id);
        this.square_icon = result || '';
    }
}
export class Rank {
    id;
    name;
    desc;
    pos;
    is_unlocked;
    constructor(data) {
        const { id, name, desc, pos, is_unlocked } = data;
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.pos = pos;
        this.is_unlocked = is_unlocked;
    }
}
export class ZZZAvatarInfo {
    id;
    level;
    name_mi18n;
    full_name_mi18n;
    element_type;
    sub_element_type;
    camp_name_mi18n;
    avatar_profession;
    rarity;
    group_icon_path;
    hollow_icon_path;
    equip;
    weapon;
    properties;
    skills;
    rank;
    ranks;
    ranks_num;
    element_str;
    sub_element_str;
    role_vertical_painting_url;
    skin_id;
    level_rank;
    weightRule;
    scoreWeight;
    _base_properties;
    _initial_properties;
    _damages;
    square_icon;
    small_square_icon;
    role_icon;
    constructor(data) {
        const { id, level, name_mi18n, full_name_mi18n, element_type, sub_element_type, camp_name_mi18n, avatar_profession, rarity, group_icon_path, hollow_icon_path, equip, weapon, properties, skills, rank, ranks, role_vertical_painting_url, } = data;
        this.id = id;
        this.level = level;
        this.name_mi18n = name_mi18n;
        this.full_name_mi18n = full_name_mi18n;
        this.element_type = element_type;
        this.sub_element_type = sub_element_type;
        this.camp_name_mi18n = camp_name_mi18n;
        this.avatar_profession = avatar_profession;
        this.rarity = rarity;
        this.group_icon_path = group_icon_path;
        this.hollow_icon_path = hollow_icon_path;
        this.equip =
            (equip &&
                (Array.isArray(equip)
                    ? equip.map(equip => new Equip(equip))
                    : [new Equip(equip)])) ||
                [];
        this.weapon = weapon ? new Weapon(weapon) : null;
        this.properties =
            properties && properties.map(property => new Property(property));
        this.skills = skills && skills.map(skill => new Skill(skill));
        this.rank = rank;
        this.ranks = ranks && ranks.map(rank => new Rank(rank));
        this.ranks_num = rank;
        this.element_str = element.idToName(element_type);
        this.sub_element_str = element.idToName(element_type, sub_element_type);
        this.role_vertical_painting_url = role_vertical_painting_url;
        this.skin_id = this.role_vertical_painting_url?.match?.(/role_vertical_painting_\d+_(\d+).png$/)?.[1] || '';
        this.level_rank = Math.floor(this.level / 10);
        const weight = Score.getFinalWeight(this);
        this.weightRule = weight[0];
        this.scoreWeight = weight[1];
        for (const equip of this.equip) {
            equip.get_score(this.scoreWeight);
        }
    }
    getProperty(name) {
        return this.properties.find(property => property.property_name === name);
    }
    get basic_properties() {
        const data = {
            hpmax: this.getProperty('生命值'),
            attack: this.getProperty('攻击力'),
            def: this.getProperty('防御力'),
            breakstun: this.getProperty('冲击力'),
            crit: this.getProperty('暴击率'),
            critdam: this.getProperty('暴击伤害'),
            elementabnormalpower: this.getProperty('异常掌控'),
            elementmystery: this.getProperty('异常精通'),
            sheerforce: this.getProperty('贯穿力'),
            penratio: this.getProperty('穿透率'),
            sprecover: this.getProperty('能量自动回复'),
            adrenalineaccumulate: this.getProperty('闪能自动累积'),
            dmgbonus: this.properties.find(property => property.property_id == element.idToPropertyId(this.element_type)),
        };
        return data;
    }
    get base_properties() {
        if (this._base_properties)
            return this._base_properties;
        const basic_properties = this.basic_properties;
        const get = (name) => {
            const data = basic_properties[name];
            return Number(data?.base || data?.final || 0);
        };
        return this._base_properties = {
            HP: get('hpmax'),
            ATK: get('attack'),
            DEF: get('def'),
            Impact: get('breakstun'),
            AnomalyMastery: get('elementabnormalpower'),
            AnomalyProficiency: get('elementmystery'),
            EnergyRegen: get('sprecover')
        };
    }
    get initial_properties() {
        if (this._initial_properties)
            return this._initial_properties;
        const basic_properties = this.basic_properties;
        const get = (name) => {
            if (!basic_properties[name])
                return 0;
            const data = basic_properties[name].final;
            return Number(data.includes('%') ? +data.replace('%', '') / 100 : data);
        };
        return this._initial_properties = {
            HP: get('hpmax'),
            ATK: get('attack'),
            DEF: get('def'),
            Impact: get('breakstun'),
            CRITRate: get('crit'),
            CRITDMG: get('critdam'),
            AnomalyMastery: get('elementabnormalpower'),
            AnomalyProficiency: get('elementmystery'),
            Pen: this.equip?.reduce((prev, curr) => prev + curr.get_property(23203), 0) || 0,
            PenRatio: get('penratio'),
            EnergyRegen: get('sprecover')
        };
    }
    get damages() {
        if (this._damages)
            return this._damages;
        return this._damages = avatar_calc(this)?.calc();
    }
    get showInPanelBuffs() {
        return avatar_calc(this)?.calc_showInPanel_buffs();
    }
    get equip_score() {
        if (!this.equip?.length)
            return 0;
        if (this.scoreWeight) {
            let score = 0;
            for (const equip of this.equip) {
                score += equip.score;
            }
            return score;
        }
        return 0;
    }
    get equip_comment() {
        const score = this.equip_score;
        if (score < 80) {
            return 'C';
        }
        if (score < 120) {
            return 'B';
        }
        if (score < 160) {
            return 'A';
        }
        if (score < 180) {
            return 'S';
        }
        if (score < 200) {
            return 'SS';
        }
        if (score < 220) {
            return 'SSS';
        }
        if (score < 280) {
            return 'ACE';
        }
        if (score >= 280) {
            return 'MAX';
        }
        return 'C';
    }
    get proficiency_score() {
        let base_score = 3;
        if (this.rarity === 'S') {
            base_score = 5;
        }
        else if (this.rarity === 'A') {
            base_score = 4;
        }
        let score = this.equip_score * 2;
        for (const skill of this.skills) {
            score += skill.level * base_score;
        }
        score += this.level * 2;
        score += this.rank * base_score * 2;
        if (this.weapon) {
            let weapon_base_score = 3;
            if (this.weapon.rarity === 'S') {
                weapon_base_score = 5;
            }
            else if (this.weapon.rarity === 'A') {
                weapon_base_score = 4;
            }
            score += this.weapon.level * 2;
            score += this.weapon.star * 2 * weapon_base_score;
        }
        return score;
    }
    get equip_final() {
        const result = [];
        this.equip?.forEach(equip => {
            if (equip.equipment_type) {
                result[equip.equipment_type - 1] = equip;
            }
        });
        return result;
    }
    get propertyStats() {
        const stats = {};
        for (const equip of this.equip || []) {
            for (const property of equip.properties) {
                const propID = property.property_id;
                stats[propID] ??= {
                    id: propID,
                    name: idToShortName2(propID),
                    weight: this.scoreWeight[propID] || 0,
                    value: '0',
                    count: 0
                };
                stats[propID].count += property.count + 1;
            }
        }
        const statsArr = Object.values(stats);
        statsArr.forEach(stat => {
            if (baseValueData[stat.id]) {
                stat.value = (baseValueData[stat.id] * stat.count).toFixed(1);
                if ([11102, 12102, 13102, 20103, 21103].includes(stat.id)) {
                    stat.value = `${stat.value}%`;
                }
            }
        });
        return _.orderBy(statsArr, ['count', 'weight'], ['desc', 'desc']);
    }
    get_label(propID) {
        const base = this.scoreWeight?.[propID];
        if (!base)
            return '';
        return base === 1 ? 'yellow' :
            base >= 0.75 ? 'blue' :
                base >= 0.5 ? 'white' : '';
    }
    async get_basic_assets() {
        const result = await getSquareAvatar(this.id);
        this.square_icon = result;
    }
    async get_small_basic_assets() {
        const result = await getSmallSquareAvatar(this.id);
        this.small_square_icon = result;
        await this?.weapon?.get_assets?.();
    }
    async get_detail_assets() {
        const paths = Array.from(new Set([
            this.name_mi18n,
            this.full_name_mi18n,
            char.idToName(this.id, false),
            char.idToName(this.id, true)
        ].filter(Boolean))).map((p) => path.join(imageResourcesPath, 'panel', p));
        let role_icon = '';
        const custom_panel_images = paths.find(p => fs.existsSync(p));
        if (custom_panel_images) {
            const panel_images = fs
                .readdirSync(custom_panel_images)
                .map(file => path.join(custom_panel_images, file));
            if (panel_images.length > 0) {
                role_icon =
                    panel_images[Math.floor(Math.random() * panel_images.length)];
            }
        }
        if (!role_icon) {
            role_icon = await getRoleImage(this.id, this.skin_id) || '';
        }
        this.role_icon = role_icon;
        await this?.weapon?.get_assets?.();
        for (const equip of this.equip || []) {
            await equip.get_assets();
        }
    }
    async get_assets() {
        await this.get_basic_assets();
        await this.get_detail_assets();
        await this.get_small_basic_assets();
    }
}
export class ZZZUser {
    game_biz;
    region;
    game_uid;
    nickname;
    level;
    is_chosen;
    region_name;
    is_official;
    constructor(data) {
        const { game_biz, region, game_uid, nickname, level, is_chosen, region_name, is_official, } = data;
        this.game_biz = game_biz;
        this.region = region;
        this.game_uid = game_uid;
        this.nickname = nickname;
        this.level = level;
        this.is_chosen = is_chosen;
        this.region_name = region_name;
        this.is_official = is_official;
    }
}
//# sourceMappingURL=avatar.js.map