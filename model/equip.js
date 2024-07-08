/**
 * @class
 */
export class EquipProperty {
  /**
   * @param {string} property_name
   * @param {number} property_id
   * @param {string} base
   */
  constructor(property_name, property_id, base) {
    this.property_name = property_name;
    this.property_id = property_id;
    this.base = base;
  }
}

/**
 * @class
 */
export class EquipMainProperty {
  /**
   * @param {string} property_name
   * @param {number} property_id
   * @param {string} base
   */
  constructor(property_name, property_id, base) {
    this.property_name = property_name;
    this.property_id = property_id;
    this.base = base;
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
   * @param {number} id
   * @param {number} level
   * @param {string} name
   * @param {string} icon
   * @param {string} rarity
   * @param {EquipProperty[]} properties
   * @param {EquipMainProperty[]} main_properties
   * @param {EquipSuit} equip_suit
   * @param {number} equipment_type
   */
  constructor(
    id,
    level,
    name,
    icon,
    rarity,
    properties,
    main_properties,
    equip_suit,
    equipment_type
  ) {
    this.id = id;
    this.level = level;
    this.name = name;
    this.icon = icon;
    this.rarity = rarity;
    this.properties = properties;
    this.main_properties = main_properties;
    this.equip_suit = equip_suit;
    this.equipment_type = equipment_type;
  }
}

/**
 * @class
 */
export class Weapon {
  /**
   * @param {number} id
   * @param {number} level
   * @param {string} name
   * @param {number} star
   * @param {string} icon
   * @param {string} rarity
   * @param {EquipProperty[]} properties
   * @param {EquipMainProperty[]} main_properties
   * @param {string} talent_title
   * @param {string} talent_content
   * @param {number} profession
   */
  constructor(
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
    profession
  ) {
    this.id = id;
    this.level = level;
    this.name = name;
    this.star = star;
    this.icon = icon;
    this.rarity = rarity;
    this.properties = properties;
    this.main_properties = main_properties;
    this.talent_title = talent_title;
    this.talent_content = talent_content;
    this.profession = profession;
  }
}
