import { element } from '../lib/convert.js';
import { Equip, Weapon } from './equip.js';
import { Property } from './property.js';
import { Skill } from './skill.js';

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
   * @param {number} id
   * @param {number} level
   * @param {string} name_mi18n
   * @param {string} full_name_mi18n
   * @param {number} element_type
   * @param {string} camp_name_mi18n
   * @param {number} avatar_profession
   * @param {string} rarity
   * @param {AvatarIconPaths} icon_paths
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
    icon_paths,
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
    this.icon_paths = icon_paths;
    this.rank = rank;
    this.is_chosen = is_chosen;

    this.element_str = element.IDToElement(element_type);
  }
}

/**
 * @class
 */
export class Rank {
  /**
   * @param {number} id
   * @param {string} name
   * @param {string} desc
   * @param {number} pos
   * @param {boolean} is_unlocked
   */
  constructor(id, name, desc, pos, is_unlocked) {
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
    this.equip = equip;
    this.weapon = weapon;
    this.properties = properties;
    this.skills = skills;
    this.rank = rank;
    this.ranks = ranks;

    this.element_str = element.IDToElement(element_type);
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
