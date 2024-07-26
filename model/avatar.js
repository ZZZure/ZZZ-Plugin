import { element, property } from '../lib/convert.js';
import { getRoleImage, getSquareAvatar } from '../lib/download.js';
import { imageResourcesPath } from '../lib/path.js';
import { Equip, Weapon } from './equip.js';
import { Property } from './property.js';
import { Skill } from './skill.js';
import { relice_ability } from './damage/relice.js';
import { weapon_ability } from './damage/weapon.js';
import { avatar_ability } from './damage/avatar.js';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';

/**
 * @class
 */
export class Avatar {
  /**
   * @param {number} id
   * @param {number} level
   * @param {string} name_mi18n
   * @param {string} full_name_mi18n
   * @param {number} element_type
   * @param {string} camp_name_mi18n
   * @param {number} avatar_profession
   * @param {string} rarity
   * @param {string} group_icon_path
   * @param {string} hollow_icon_path
   * @param {number} rank
   * @param {boolean} is_chosen
   */
  constructor(
    id,
    level,
    name_mi18n,
    full_name_mi18n,
    element_type,
    camp_name_mi18n,
    avatar_profession,
    rarity,
    group_icon_path,
    hollow_icon_path,
    rank,
    is_chosen
  ) {
    this.id = id;
    this.level = level;
    this.name_mi18n = name_mi18n;
    this.full_name_mi18n = full_name_mi18n;
    this.element_type = element_type;
    this.camp_name_mi18n = camp_name_mi18n;
    this.avatar_profession = avatar_profession;
    this.rarity = rarity;
    this.group_icon_path = group_icon_path;
    this.hollow_icon_path = hollow_icon_path;
    this.rank = rank;
    this.is_chosen = is_chosen;

    this.element_str = element.IDToElement(element_type);
  }
}

/**
 * @class
 */
export class AvatarIconPaths {
  /**
   * @param {string} group_icon_path
   * @param {string} hollow_icon_path
   */
  constructor(group_icon_path, hollow_icon_path) {
    this.group_icon_path = group_icon_path;
    this.hollow_icon_path = hollow_icon_path;
  }
}

/**
 * @class
 */
export class ZZZAvatarBasic {
  /**
   * @param {{
   *  id: number;
   *  level: number;
   *  name_mi18n: string;
   *  full_name_mi18n: string;
   *  element_type: number;
   *  camp_name_mi18n: string;
   *  avatar_profession: number;
   *  rarity: string;
   *  icon_paths: AvatarIconPaths;
   *  rank: number;
   *  is_chosen: boolean;
   * }} data
   */
  constructor(data) {
    const {
      id,
      level,
      name_mi18n,
      full_name_mi18n,
      element_type,
      camp_name_mi18n,
      avatar_profession,
      rarity,
      icon_paths,
      rank,
      is_chosen,
    } = data;
    this.id = id;
    this.level = level;
    this.name_mi18n = name_mi18n;
    this.full_name_mi18n = full_name_mi18n;
    this.element_type = element_type;
    this.camp_name_mi18n = camp_name_mi18n;
    this.avatar_profession = avatar_profession;
    this.rarity = rarity;
    this.icon_paths = icon_paths;
    this.rank = rank;
    this.is_chosen = is_chosen;

    this.element_str = element.IDToElement(element_type);
  }

  async get_assets() {
    const result = await getSquareAvatar(this.id);
    this.square_icon = result;
  }
}

/**
 * @class
 */
export class Rank {
  // 类型标注
  /** @type {number} */
  id;
  /** @type {string} */
  name;
  /** @type {string} */
  desc;
  /** @type {number} */
  pos;
  /** @type {boolean} */
  is_unlocked;

  /**
   * @param {{
   *  id: number;
   *  name: string;
   *  desc: string;
   *  pos: number;
   *  is_unlocked: boolean;
   * }} data
   */
  constructor(data) {
    const { id, name, desc, pos, is_unlocked } = data;
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.pos = pos;
    this.is_unlocked = is_unlocked;
  }
}

/**
 * @class
 */
export class ZZZAvatarInfo {
  /**
   * @param {{
   *  id: number;
   *  level: number;
   *  name_mi18n: string;
   *  full_name_mi18n: string;
   *  element_type: number;
   *  camp_name_mi18n: string;
   *  avatar_profession: number;
   *  rarity: string;
   *  group_icon_path: string;
   *  hollow_icon_path: string;
   *  equip: Equip[];
   *  weapon: Weapon;
   *  properties: Property[];
   *  skills: Skill[];
   *  rank: number;
   *  ranks: Rank[];
   *  isNew?: boolean;
   * }} data
   */
  constructor(data) {
    const {
      id,
      level,
      name_mi18n,
      full_name_mi18n,
      element_type,
      camp_name_mi18n,
      avatar_profession,
      rarity,
      group_icon_path,
      hollow_icon_path,
      equip,
      weapon,
      properties,
      skills,
      rank,
      ranks,
      isNew,
    } = data;
    logger.debug('ZZZAvatarInfo', data);
    /** @type {number} */
    this.id = id;
    /** @type {number} */
    this.level = level;
    /** @type {string} */
    this.name_mi18n = name_mi18n;
    /** @type {string} */
    this.full_name_mi18n = full_name_mi18n;
    /** @type {number} */
    this.element_type = element_type;
    /** @type {string} */
    this.camp_name_mi18n = camp_name_mi18n;
    /** @type {number} */
    this.avatar_profession = avatar_profession;
    /** @type {string} */
    this.rarity = rarity;
    /** @type {string} */
    this.group_icon_path = group_icon_path;
    /** @type {string} */
    this.hollow_icon_path = hollow_icon_path;
    /** @type {Equip[]} */
    this.equip =
      (equip &&
        (Array.isArray(equip)
          ? equip.map(equip => new Equip(equip))
          : new Equip(equip))) ||
      [];
    /** @type {Weapon} */
    this.weapon = weapon ? new Weapon(weapon) : null;
    /** @type {Property[]} */
    this.properties =
      properties && properties.map(property => new Property(property));
    /** @type {Skill[]} */
    this.skills = skills && skills.map(skill => new Skill(skill));
    /** @type {number} */
    this.rank = rank;
    /** @type {Rank[]} */
    this.ranks = ranks && ranks.map(rank => new Rank(rank));
    /** @type {number} */
    this.ranks_num = this.ranks.filter(rank => rank.is_unlocked).length;
    /** @type {string} */
    this.element_str = element.IDToElement(element_type);
    /** @type {boolean} */
    this.isNew = isNew;
  }

  getProperty(name) {
    return this.properties.find(property => property.property_name === name);
  }

  /** @type {{
   * hpmax: Property;
   * attack: Property;
   * def: Property;
   * breakstun: Property;
   * crit: Property;
   * critdam: Property;
   * elementabnormalpower: Property;
   * elementmystery: Property;
   * penratio: Property;
   * sprecover: Property;
   * }} */
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
      penratio: this.getProperty('穿透率'),
      sprecover: this.getProperty('能量自动回复'),
    };
    logger.debug('basic_properties', data);
    return data;
  }

  /** @type {{
   *  base_detail: {
   *   hp: number;
   *   attack: number;
   *   defence: number;
   *   ImpactRatio: number;
   *   CriticalChanceBase: number;
   *   CriticalDamageBase: number;
   *   ElementAbnormalPower: number;
   *   ElementMystery: number;
   *   PenRatioBase: number;
   *   SpGetRatio: number;
   *  }
   * bonus_detail: Record<string, number>;
   * set_detail: Record<string, number>;
   * }} */
  get damage_basic_properties() {
    const base_detail = {
      hp: Number(this.basic_properties.hpmax.final),
      attack: Number(this.basic_properties.attack.final),
      defence: Number(this.basic_properties.def.final),
      ImpactRatio: Number(this.basic_properties.breakstun.final),
      CriticalChanceBase:
        Number(this.basic_properties.crit.final.replace('%', '')) / 100,
      CriticalDamageBase:
        Number(this.basic_properties.critdam.final.replace('%', '')) / 100,
      ElementAbnormalPower: Number(
        this.basic_properties.elementabnormalpower.final
      ),
      ElementMystery: Number(this.basic_properties.elementmystery.final),
      PenRatioBase:
        Number(this.basic_properties.penratio.final.replace('%', '')) / 100,
      SpGetRatio: Number(this.basic_properties.sprecover.final),
    };
    /** 计算伤害加成与穿透值
     *	穿透值23203
     *	伤害加成31503-31703
     */
    const bonus_detail = {};
    /** 计算套装数量 */
    const set_detail = {};
    for (const equip_detail of this.equip) {
      bonus_detail['PenDelta'] =
        _.get(bonus_detail, 'PenDelta', 0) + equip_detail.get_property(23203);
      if (equip_detail.equipment_type == 5) {
        const propname = property.idToName(
          equip_detail.main_properties[0].property_id
        );
        if (propname.includes('属性伤害提高')) {
          const propenname = property.idToSignName(
            equip_detail.main_properties[0].property_id
          );
          bonus_detail[propenname] =
            _.get(bonus_detail, propenname, 0) +
            Number(equip_detail.main_properties[0].base.replace('%', '')) / 100;
        }
      }
      const suit_id = String(equip_detail.equip_suit.suit_id);
      set_detail[suit_id] = _.get(set_detail, suit_id, 0) + 1;
    }
    logger.debug('base_detail', base_detail);
    logger.debug('bonus_detail', bonus_detail);
    logger.debug('set_detail', set_detail);
    const retuan_detail = {
      base_detail: base_detail,
      bonus_detail: bonus_detail,
      set_detail: set_detail,
    };
    return retuan_detail;
  }

  /** @type {{
   * title: string;
   * value: {name: string, value: number}[]
   * }[]} */
  get damages() {
    /** 处理基础数据 */
    let base_detail = this.damage_basic_properties.base_detail;
    let bonus_detail = this.damage_basic_properties.bonus_detail;
    let set_detail = this.damage_basic_properties.set_detail;

    /** 处理驱动盘套装加成 */
    let set_detailkeys = Object.keys(set_detail);
    for (const set_id of set_detailkeys) {
      const set_num = set_detail[set_id];
      if (set_num >= 2)
        bonus_detail = relice_ability(
          set_id,
          set_num,
          base_detail,
          bonus_detail
        );
    }
    logger.debug('bonus_detail', bonus_detail);

    /** 处理音频加成 */
    bonus_detail = weapon_ability(this.weapon, base_detail, bonus_detail);
    logger.debug('bonus_detail', bonus_detail);

    /** 处理角色加成 */
    const damagelist = avatar_ability(this, base_detail, bonus_detail);
    return damagelist;
  }

  async get_basic_assets() {
    const result = await getSquareAvatar(this.id);
    /** @type {string} */
    this.square_icon = result;
  }

  async get_detail_assets() {
    const custom_panel_images = path.join(
      imageResourcesPath,
      `panel/${this.name_mi18n}`
    );
    let role_icon = '';
    if (fs.existsSync(custom_panel_images)) {
      const panel_images = fs
        .readdirSync(custom_panel_images)
        .map(file => path.join(custom_panel_images, file));
      if (panel_images.length > 0) {
        role_icon =
          panel_images[Math.floor(Math.random() * panel_images.length)];
      }
    }
    if (!role_icon) {
      role_icon = await getRoleImage(this.id);
    }
    /** @type {string} */
    this.role_icon = role_icon;
    await this?.weapon?.get_assets?.();
    for (const equip of this.equip) {
      await equip.get_assets();
    }
  }

  async get_assets() {
    await this.get_basic_assets();
  }
}

/**
 * @class
 */
export class ZZZUser {
  /**
   * @param {{
   *  game_biz: string;
   *  region: string;
   *  game_uid: string;
   *  nickname: string;
   *  level: number;
   *  is_chosen: boolean;
   *  region_name: string;
   *  is_official: boolean;
   * }} data
   */
  constructor(data) {
    const {
      game_biz,
      region,
      game_uid,
      nickname,
      level,
      is_chosen,
      region_name,
      is_official,
    } = data;
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
