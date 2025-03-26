import { element } from '../lib/convert.js';
import {
  getRoleImage,
  getSmallSquareAvatar,
  getSquareAvatar,
} from '../lib/download.js';
import { imageResourcesPath } from '../lib/path.js';
import { Equip, Weapon } from './equip.js';
import { Property } from './property.js';
import { Skill } from './skill.js';
import { avatar_ability } from './damage/avatar.js';
import { hasScoreData, scoreData } from '../lib/score.js';

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
   *  sub_element_type: number;
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
      sub_element_type,
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
    /** @type {number} 角色ID */
    this.id = id;
    /** @type {number} 角色等级 */
    this.level = level;
    /** @type {string} 角色名称 */
    this.name_mi18n = name_mi18n;
    /** @type {string} 角色全名 */
    this.full_name_mi18n = full_name_mi18n;
    /** @type {number} 元素种类 */
    this.element_type = element_type;
    /** @type {number} 子元素种类 */
    this.sub_element_type = sub_element_type;
    /** @type {string} */
    this.camp_name_mi18n = camp_name_mi18n;
    /** @type {number} 职业 */
    this.avatar_profession = avatar_profession;
    /** @type {string} 稀有度 */
    this.rarity = rarity;
    /** @type {string} */
    this.group_icon_path = group_icon_path;
    /** @type {string} */
    this.hollow_icon_path = hollow_icon_path;
    /** @type {Equip[]} 驱动盘 */
    this.equip =
      (equip &&
        (Array.isArray(equip)
          ? equip.map(equip => new Equip(equip))
          : new Equip(equip))) ||
      [];
    /** @type {Weapon} 武器 */
    this.weapon = weapon ? new Weapon(weapon) : null;
    /** @type {Property[]} 属性 */
    this.properties =
      properties && properties.map(property => new Property(property));
    /** @type {Skill[]} 技能 */
    this.skills = skills && skills.map(skill => new Skill(skill));
    /** @type {number} 影 */
    this.rank = rank;
    /** @type {Rank[]} */
    this.ranks = ranks && ranks.map(rank => new Rank(rank));
    /** @type {number} */
    this.ranks_num = this.ranks.filter(rank => rank.is_unlocked).length;
    /** @type {string} */
    this.element_str = element.IDToElement(element_type);
    /** @type {boolean} */
    this.isNew = isNew;
    /** @type {number}  等级级别（取十位数字）*/
    this.level_rank = Math.floor(this.level / 10);
    for (const equip of this.equip) {
      equip.get_score(this.id);
    }
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
    return data;
  }

  /** 基础属性 */
  get base_properties() {
    if (this._base_properties) return this._base_properties
    const basic_properties = this.basic_properties
    /**
     * @param {keyof ZZZAvatarInfo['basic_properties']} name
     */
    const get = (name) => {
      const data = basic_properties[name]
      return Number(data.base || data.final)
    }
    return this._base_properties = {
      HP: get('hpmax'),
      ATK: get('attack'),
      DEF: get('def'),
      Impact: get('breakstun'),
      AnomalyMastery: get('elementabnormalpower'),
      AnomalyProficiency: get('elementmystery'),
      EnergyRegen: get('sprecover')
    }
  }

  /** 初始属性 */
  get initial_properties() {
    if (this._initial_properties) return this._initial_properties
    const basic_properties = this.basic_properties
    /**
     * @param {keyof ZZZAvatarInfo['basic_properties']} name
     */
    const get = (name) => {
      const data = basic_properties[name].final
      return Number(data.includes('%') ? data.replace('%', '') / 100 : data)
    }
    return this._initial_properties = {
      HP: get('hpmax'),
      ATK: get('attack'),
      DEF: get('def'),
      Impact: get('breakstun'),
      CRITRate: get('crit'),
      CRITDMG: get('critdam'),
      /** 异常掌控 */
      AnomalyMastery: get('elementabnormalpower'),
      /** 异常精通 */
      AnomalyProficiency: get('elementmystery'),
      Pen: this.equip.reduce((prev, curr) => prev + curr.get_property(23203), 0),
      PenRatio: get('penratio'),
      EnergyRegen: get('sprecover')
    }
  }

  /** @type {import("./damage/Calculator.ts").damage} */
  get damages() {
    return avatar_ability(this);
  }

  /** @type {number|boolean} */
  get equip_score() {
    if (hasScoreData(this.id)) {
      let score = 0;
      for (const equip of this.equip) {
        score += equip.score;
      }
      return score;
    }
    return false;
  }

  /** @type {'C'|'B'|'A'|'S'|'SS'|'SSS'|'ACE'|false} */
  get equip_comment() {
    if (this.equip_score < 80) {
      return 'C';
    }
    if (this.equip_score < 120) {
      return 'B';
    }
    if (this.equip_score < 160) {
      return 'A';
    }
    if (this.equip_score < 180) {
      return 'S';
    }
    if (this.equip_score < 200) {
      return 'SS';
    }
    if (this.equip_score < 220) {
      return 'SSS';
    }
    if (this.equip_score >= 220) {
      return 'ACE';
    }
    return false;
  }

  /** @type {number} 练度分数 */
  get proficiency_score() {
    let base_score = 3;
    if (this.rarity === 'S') {
      base_score = 5;
    } else if (this.rarity === 'A') {
      base_score = 4;
    }
    let score = 0;
    if (this.equip_score !== false) {
      score += this.equip_score * 2;
    }
    for (const skill of this.skills) {
      score += skill.level * base_score;
    }
    score += this.level * 2;
    score += this.rank * base_score * 2;
    if (this.weapon) {
      let weapon_base_score = 3;
      if (this.weapon.rarity === 'S') {
        weapon_base_score = 5;
      } else if (this.weapon.rarity === 'A') {
        weapon_base_score = 4;
      }
      score += this.weapon.level * 2;
      score += this.weapon.star * 2 * weapon_base_score;
    }
    return score;
  }

  /** @type {Equip[]} equip_final */
  get equip_final() {
    const result = [];
    this.equip.forEach(equip => {
      if (equip.equipment_type) {
        result[equip.equipment_type - 1] = equip;
      }
    });
    return result;
  }

  /** 面板属性label效果 */
  get_label(propID) {
    const base = scoreData[this.id][propID];
    if (!base) return '';
    return base === 1 ? 'yellow' :
      base >= 0.75 ? 'blue' :
        base >= 0.5 ? 'white' : '';
  }

  /**
   * 获取基础资源
   * @returns {Promise<void>}
   */
  async get_basic_assets() {
    const result = await getSquareAvatar(this.id);
    /** @type {string} */
    this.square_icon = result;
  }

  /**
   * 获取基础小资源
   * @returns {Promise<void>}
   */
  async get_small_basic_assets() {
    const result = await getSmallSquareAvatar(this.id);
    /** @type {string} */
    this.small_square_icon = result;
    await this?.weapon?.get_assets?.();
  }

  /**
   * 获取详细资源
   * @returns {Promise<void>}
   */
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
    await this.get_detail_assets();
    await this.get_small_basic_assets();
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
