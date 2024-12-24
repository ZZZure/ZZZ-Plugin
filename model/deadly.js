import request from '../utils/request.js';
import { Buffer } from 'node:buffer';
/**
 * @typedef {Object} DeadlyTime
 * @property {number} hour
 * @property {number} minute
 * @property {number} second
 * @property {number} year
 * @property {number} month
 * @property {number} day
 */

/**
 * @typedef {Object} Bos
 * @property {string} race_icon
 * @property {string} icon
 * @property {string} name
 * @property {string} bg_icon
 */

/**
 * @typedef {Object} DeadBuffer
 * @property {string} desc
 * @property {string} icon
 * @property {string} name
 */

/**
 * @typedef {Object} Buddy
 * @property {number} id
 * @property {string} rarity
 * @property {number} level
 * @property {string} bangboo_rectangle_url
 */

/**
 * @typedef {Object} AvatarList
 * @property {string} rarity
 * @property {number} element_type
 * @property {number} avatar_profession
 * @property {number} id
 * @property {number} level
 * @property {number} rank
 * @property {string} role_square_url
 * @property {number} sub_element_type
 */

/**
 * @typedef {Object} DeadlyList
 * @property {number} star
 * @property {number} score
 * @property {Bos[]} boss
 * @property {DeadBuffer[]} buffer
 * @property {Buddy} buddy
 * @property {number} total_star
 * @property {DeadlyTime} challenge_time
 * @property {AvatarList[]} avatar_list
 */

/**
 * @typedef {Object} Deadly
 * @property {DeadlyTime} start_time
 * @property {DeadlyTime} end_time
 * @property {string} nick_name
 * @property {string} avatar_icon
 * @property {boolean} has_data
 * @property {number} zone_id
 * @property {number} total_star
 * @property {number} rank_percent
 * @property {number} total_score
 * @property {DeadlyList[]} list
 */

/**
 * @class Deadly.
 */
export class Deadly {
  /**
   * @param {Deadly} data
   */
  constructor(data) {
    this.start_time = new DeadlyTime(data.start_time);
    this.end_time = new DeadlyTime(data.end_time);
    this.nick_name = data.nick_name;
    this.avatar_icon = data.avatar_icon;
    this.has_data = data.has_data;
    this.zone_id = data.zone_id;
    this.total_star = data.total_star;
    this.rank_percent = data.rank_percent;
    this.total_score = data.total_score;
    this.list = data.list.map(item => new DeadlyList(item));
  }
  async get_assets() {
    const avatar_icon_b64 = await request
      .get(this.avatar_icon, {}, { responseType: 'arraybuffer' })
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      );
    this.avatar_icon = avatar_icon_b64;
    await Promise.all(this.list.map(item => item.get_assets()));
  }
}

/**
 * @class DeadlyList.
 */
export class DeadlyList {
  /**
   * @param {DeadlyList} data
   */
  constructor(data) {
    this.star = data.star;
    this.score = data.score;
    this.boss = data.boss.map(b => new Bos(b));
    this.buffer = data.buffer.map(b => new DeadBuffer(b));
    this.buddy = new Buddy(data.buddy);
    this.total_star = data.total_star;
    this.challenge_time = new DeadlyTime(data.challenge_time);
    this.avatar_list = data.avatar_list.map(item => new AvatarList(item));
  }

  async get_assets() {
    await Promise.all([
      this.buddy.get_assets(),
      ...this.avatar_list.map(avatar => avatar.get_assets()),
      ...this.boss.map(boss => boss.get_assets()),
      ...this.buffer.map(buffer => buffer.get_assets()),
    ]);
  }
}

/**
 * @class AvatarList.
 */
export class AvatarList {
  /**
   * @param {AvatarList} data
   */
  constructor(data) {
    this.rarity = data.rarity;
    this.element_type = data.element_type;
    this.avatar_profession = data.avatar_profession;
    this.id = data.id;
    this.level = data.level;
    this.rank = data.rank;
    this.role_square_url = data.role_square_url;
    this.sub_element_type = data.sub_element_type;
  }

  async get_assets() {
    const role_square_b64 = await request
      .get(this.role_square_url, {}, { responseType: 'arraybuffer' })
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      );
    this.role_square_url = role_square_b64;
  }
}

/**
 * @class Buddy.
 */
export class Buddy {
  /**
   * @param {Buddy} data
   */
  constructor(data) {
    this.id = data.id;
    this.rarity = data.rarity;
    this.level = data.level;
    this.bangboo_rectangle_url = data.bangboo_rectangle_url;
  }

  async get_assets() {
    const bangboo_rectangle_b64 = await request
      .get(this.bangboo_rectangle_url, {}, { responseType: 'arraybuffer' })
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      );
    this.bangboo_rectangle_url = bangboo_rectangle_b64;
  }
}

/**
 * @class DeadBuffer.
 */
export class DeadBuffer {
  /**
   * @param {DeadBuffer} data
   */
  constructor(data) {
    this.desc = data.desc;
    this.icon = data.icon;
    this.name = data.name;
  }

  async get_assets() {
    const icon_b64 = await request
      .get(this.icon, {}, { responseType: 'arraybuffer' })
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      );
    this.icon = icon_b64;
  }
}

/**
 * @class Bos.
 */
export class Bos {
  /**
   * @param {Bos} data
   */
  constructor(data) {
    this.race_icon = data.race_icon;
    this.icon = data.icon;
    this.name = data.name;
    this.bg_icon = data.bg_icon;
  }

  async get_assets() {
    const race_icon_b64 = request
      .get(this.race_icon, {}, { responseType: 'arraybuffer' })
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      );
    const icon_b64 = request
      .get(this.icon, {}, { responseType: 'arraybuffer' })
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      );
    const bg_icon_b64 = request
      .get(this.bg_icon, {}, { responseType: 'arraybuffer' })
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      );
    const all = await Promise.all([race_icon_b64, icon_b64, bg_icon_b64]);
    this.race_icon = all[0];
    this.icon = all[1];
    this.bg_icon = all[2];
  }
}

/**
 * @class DeadlyTime.
 */
export class DeadlyTime {
  /**
   * @param {DeadlyTime} data
   */
  constructor(data) {
    this.hour = data.hour;
    this.minute = data.minute;
    this.second = data.second;
    this.year = data.year;
    this.month = data.month;
    this.day = data.day;
  }
}
