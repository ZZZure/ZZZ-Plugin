import { ZZZAvatarInfo } from './avatar.js';
import { Buddy } from './bangboo.js';

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
   *  avatar_list: ZZZAvatarInfo[];
   *  cur_head_icon_url: string;
   *  buddy_list: Buddy[];
   * }} data
   */
  constructor(data) {
    const { stats, avatar_list, cur_head_icon_url, buddy_list } = data;
    this.stats = stats;
    this.avatar_list = avatar_list.map(item => new ZZZAvatarInfo(item));
    this.cur_head_icon_url = cur_head_icon_url;
    this.buddy_list = buddy_list.map(item => new Buddy(item));
  }

  async get_assets() {
    for (const avatar of this.avatar_list) {
      await avatar.get_assets();
    }
    for (const buddy of this.buddy_list) {
      await buddy.get_assets();
    }
  }
}
