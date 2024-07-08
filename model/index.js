/**
 * @class
 */
export class Buddy {
  /**
   * @param {number} id
   * @param {string} name
   * @param {string} rarity
   * @param {number} level
   * @param {number} star
   */
  constructor(id, name, rarity, level, star) {
    this.id = id;
    this.name = name;
    this.rarity = rarity;
    this.level = level;
    this.star = star;
  }
}

/**
 * @class
 */
export class Stats {
  /**
   * @param {number} active_days
   * @param {number} avatar_num
   * @param {string} world_level_name
   * @param {number} cur_period_zone_layer_count
   * @param {number} buddy_num
   */
  constructor(
    active_days,
    avatar_num,
    world_level_name,
    cur_period_zone_layer_count,
    buddy_num
  ) {
    this.active_days = active_days;
    this.avatar_num = avatar_num;
    this.world_level_name = world_level_name;
    this.cur_period_zone_layer_count = cur_period_zone_layer_count;
    this.buddy_num = buddy_num;
  }
}

/**
 * @class
 */
export class ZZZIndexResp {
  /**
   * @param {{
   *  stats: Stats;
   *  avatar_list: Avatar[];
   *  cur_head_icon_url: string;
   *  buddy_list: Buddy[];
   * }} data
   */
  constructor(data) {
    const { stats, avatar_list, cur_head_icon_url, buddy_list } = data;
    this.stats = stats;
    this.avatar_list = avatar_list;
    this.cur_head_icon_url = cur_head_icon_url;
    this.buddy_list = buddy_list;
  }
}
