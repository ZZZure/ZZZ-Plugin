import { element } from '../lib/convert.js';
import { getRoleImage, getSquareAvatar } from '../lib/download.js';
import { imageResourcesPath } from '../lib/path.js';
import { Equip, Weapon } from './equip.js';
import { Property } from './property.js';
import { Skill } from './skill.js';
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
    // 类型标注
    /** @type {number} */
    this.id;
    /** @type {number} */
    this.level;
    /** @type {string} */
    this.name_mi18n;
    /** @type {string} */
    this.full_name_mi18n;
    /** @type {number} */
    this.element_type;
    /** @type {string} */
    this.camp_name_mi18n;
    /** @type {number} */
    this.avatar_profession;
    /** @type {string} */
    this.rarity;
    /** @type {string} */
    this.group_icon_path;
    /** @type {string} */
    this.hollow_icon_path;
    /** @type {Equip[]} */
    this.equip;
    /** @type {Weapon} */
    this.weapon;
    /** @type {Property[]} */
    this.properties;
    /** @type {Skill[]} */
    this.skills;
    /** @type {number} */
    this.rank;
    /** @type {Rank[]} */
    this.ranks;
    /** @type {boolean} */
    this.isNew;

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
    this.equip =
      equip &&
      (Array.isArray(equip)
        ? equip.map(equip => new Equip(equip))
        : new Equip(equip));
    this.weapon = weapon ? new Weapon(weapon) : null;
    this.properties =
      properties && properties.map(property => new Property(property));
    this.skills = skills && skills.map(skill => new Skill(skill));
    this.rank = rank;
    this.ranks = ranks && ranks.map(rank => new Rank(rank));

    this.ranks_num = this.ranks.filter(rank => rank.is_unlocked).length;

    this.element_str = element.IDToElement(element_type);
    this.isNew = isNew;
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
      penratio: this.getProperty('穿透率'),
      sprecover: this.getProperty('能量自动回复'),
    };
    logger.debug('basic_properties', data);
    return data;
  }

  async get_basic_assets() {
    const result = await getSquareAvatar(this.id);
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
