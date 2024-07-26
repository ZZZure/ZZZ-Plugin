import { property } from '../lib/convert.js';
import { getSuitImage, getWeaponImage } from '../lib/download.js';

/**
 * @class
 */
export class EquipProperty {
  // 类型标注
  /** @type {string} */
  property_name;
  /** @type {number} */
  property_id;
  /** @type {string} */
  base;
  /** @type {string} */
  classname;

  /**
   * @param {{
   *  property_name: string;
   *  property_id: number;
   *  base: string
   * }} data
   */
  constructor(data) {
    const { property_name, property_id, base } = data;
    this.property_name = property_name;
    this.property_id = property_id;
    this.base = base;

    this.classname = property.idToClassName(property_id);
  }
}

/**
 * @class
 */
export class EquipMainProperty {
  // 类型标注
  /** @type {string} */
  property_name;
  /** @type {number} */
  property_id;
  /** @type {string} */
  base;
  /** @type {string} */
  classname;

  /**
   * @param {{
   *  property_name: string;
   *  property_id: number;
   *  base: string;
   * }} data
   */
  constructor(data) {
    const { property_name, property_id, base } = data;
    this.property_name = property_name;
    this.property_id = property_id;
    this.base = base;

    this.classname = property.idToClassName(property_id);
  }
}

/**
 * @class
 */
export class EquipSuit {
  /**
   * @param {number} suit_id
   * @param {string} name
   * @param {number} own
   * @param {string} desc1
   * @param {string} desc2
   */
  constructor(suit_id, name, own, desc1, desc2) {
    this.suit_id = suit_id;
    this.name = name;
    this.own = own;
    this.desc1 = desc1;
    this.desc2 = desc2;
  }
}

/**
 * @class
 */
export class Equip {
  /**
   *  @param {{
   *  id: number;
   *  level: number;
   *  name: string;
   *  icon: string;
   *  rarity: string;
   *  properties: EquipProperty[];
   *  main_properties: EquipMainProperty[];
   *  equip_suit: EquipSuit;
   *  equipment_type: number;
   * }} data
   */
  constructor(data) {
    // 类型标注
    /** @type {number} */
    this.id;
    /** @type {number} */
    this.level;
    /** @type {string} */
    this.name;
    /** @type {string} */
    this.icon;
    /** @type {string} */
    this.rarity;
    /** @type {EquipProperty[]} */
    this.properties;
    /** @type {EquipMainProperty[]} */
    this.main_properties;
    /** @type {EquipSuit} */
    this.equip_suit;
    /** @type {number} */
    this.equipment_type;

    const {
      id,
      level,
      name,
      icon,
      rarity,
      properties,
      main_properties,
      equip_suit,
      equipment_type,
    } = data;
    this.id = id;
    this.level = level;
    this.name = name;
    this.icon = icon;
    this.rarity = rarity;
    this.properties = properties.map(item => new EquipProperty(item));
    this.main_properties = main_properties.map(
      item => new EquipMainProperty(item)
    );
    this.equip_suit = equip_suit;
    this.equipment_type = equipment_type;
  }

  /**
   * @param {number} id
   * @returns {EquipProperty}
   */
  get_property(id) {
    const result =
      this.properties.find(item => item.property_id === id)?.base || '0';
    return Number(result);
  }

  async get_assets() {
    const result = await getSuitImage(this.id);
    this.suit_icon = result;
  }
}

/**
 * @class
 */
export class Weapon {
  // 类型标注
  /** @type {number} */
  id;
  /** @type {number} */
  level;
  /** @type {string} */
  name;
  /** @type {number} */
  star;
  /** @type {string} */
  icon;
  /** @type {string} */
  rarity;
  /** @type {EquipProperty[]} */
  properties;
  /** @type {EquipMainProperty[]} */
  main_properties;
  /** @type {string} */
  talent_title;
  /** @type {string} */
  talent_content;
  /** @type {number} */
  profession;

  /**
   * @param {{
   *  id: number;
   *  level: number;
   *  name: string;
   *  star: number;
   *  icon: string;
   *  rarity: string;
   *  properties: EquipProperty[];
   *  main_properties: EquipMainProperty[];
   *  talent_title: string;
   *  talent_content: string;
   *  profession: number;
   * }} data
   */
  constructor(data) {
    const {
      id,
      level,
      name,
      star,
      icon,
      rarity,
      properties,
      main_properties,
      talent_title,
      talent_content,
      profession,
    } = data;
    this.id = id;
    this.level = level;
    this.name = name;
    this.star = star;
    this.icon = icon;
    this.rarity = rarity;
    this.properties = properties.map(item => new EquipProperty(item));
    this.main_properties = main_properties.map(
      item => new EquipMainProperty(item)
    );
    this.talent_title = talent_title;
    this.talent_content = talent_content;
    this.profession = profession;
  }

  async get_assets() {
    const result = await getWeaponImage(this.id);
    this.square_icon = result;
  }
}
