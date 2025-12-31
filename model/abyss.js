import { element } from '../lib/convert.js';
import { getSquareAvatar, getSquareBangboo } from '../lib/download.js';
/**
 * @typedef {Object} IChallengeAvatar
 * @property {number} id
 * @property {number} level
 * @property {string} rarity
 * @property {number} element_type
 * @property {number} avatar_profession
 * @property {number} rank
 * @property {string} role_square_url
 * @property {number} sub_element_type
 */

/**
 * @typedef {Object} IChallengeBangboo
 * @property {number} id
 * @property {string} rarity
 * @property {number} level
 * @property {string} bangboo_rectangle_url
 */

/**
 * @typedef {Object} IHadalTime
 * @property {number} year
 * @property {number} month
 * @property {number} day
 * @property {number} hour
 * @property {number} minute
 * @property {number} second
 */

/**
 * @typedef {Object} IBuff
 * @property {string} title
 * @property {string} text
 */

/**
 * @typedef {Object} IChallengeNode
 * @property {number} layer_id
 * @property {string} rating
 * @property {IBuff} buffer
 * @property {number} score
 * @property {IChallengeAvatar[]} avatar_list
 * @property {IChallengeBangboo} buddy
 * @property {number} battle_time
 * @property {string} monster_pic
 * @property {number} max_score
 */

/**
 * @typedef {Object} IFloorChallengeTime
 * @property {number} year
 * @property {number} month
 * @property {number} day
 * @property {number} hour
 * @property {number} minute
 * @property {number} second
 */

/**
 * @typedef {Object} IBrief
 * @property {number} cur_period_zone_layer_count
 * @property {number} score
 * @property {number} rank_percent
 * @property {number} battle_time
 * @property {string} rating
 * @property {IFloorChallengeTime|null} challenge_time
 * @property {number} max_score
 */

/**
 * @typedef {Object} IFifthLayerDetail
 * @property {IChallengeNode[]} layer_challenge_info_list
 */

/**
 * @typedef {Object} IFourthLayerDetail
 * @property {IBuff} buffer
 * @property {IFloorChallengeTime} challenge_time
 * @property {string} rating
 * @property {IChallengeNode[]} layer_challenge_info_list
 */

/**
 * @typedef {Object} IHadalInfoV2
 * @property {number} zone_id
 * @property {IHadalTime} hadal_begin_time
 * @property {IHadalTime} hadal_end_time
 * @property {boolean} pass_fifth_floor
 * @property {IBrief} brief
 * @property {IFifthLayerDetail|null} fitfh_layer_detail
 * @property {IFourthLayerDetail|null} fourth_layer_detail
 * @property {string} begin_time
 * @property {string} end_time
 */

/**
 * @typedef {Object} IHadalData
 * @property {string} hadal_ver
 * @property {IHadalInfoV2} hadal_info_v2
 * @property {string} nick_name
 * @property {string} icon
 */

/**
 * @class ChallengeAvatar.
 */
export class ChallengeAvatar {
  /**
   * @param {IChallengeAvatar} data
   */
  constructor(data) {
    /** @type {number} */
    this.id = data.id;
    /** @type {number} */
    this.level = data.level;
    /** @type {string} */
    this.rarity = data.rarity;
    /** @type {number} */
    this.element_type = data.element_type;
    /** @type {number} */
    this.avatar_profession = data.avatar_profession;
    /** @type {number} */
    this.rank = data.rank;
    /** @type {string} */
    this.role_square_url = data.role_square_url;
    /** @type {number} */
    this.sub_element_type = data.sub_element_type;
  }

  async get_assets() {
    const result = await getSquareAvatar(this.id);
    this.square_icon = result;
  }

  get element() {
    return element.IDToElement(this.element_type);
  }
}

/**
 * @class ChallengeBangboo.
 */
export class ChallengeBangboo {
  /**
   * @param {IChallengeBangboo} data
   */
  constructor(data) {
    /** @type {number} */
    this.id = data.id;
    /** @type {string} */
    this.rarity = data.rarity;
    /** @type {number} */
    this.level = data.level;
    /** @type {string} */
    this.bangboo_rectangle_url = data.bangboo_rectangle_url;
  }

  async get_assets() {
    const result = await getSquareBangboo(this.id);
    this.square_icon = result;
  }
}

/**
 * @class Buff.
 */
export class Buff {
  /**
   * @param {IBuff} data
   */
  constructor(data) {
    this.title = data.title;
    this.text = this.formatText(data.text);
  }

  formatText(text) {
    if (!text) return '';
    let formatted = text.replace(/\\n/g, '\n');
    formatted = formatted.replace(/<color=([^>]+)>/g, '<span style="color: $1">');
    formatted = formatted.replace(/<\/color>/g, '</span>');
    return formatted;
  }
}

/**
 * @class ChallengeNode.
 */
export class ChallengeNode {
  /**
   * @param {IChallengeNode} data
   */
  constructor(data) {
    /** @type {number} */
    this.layer_id = data.layer_id;
    /** @type {string} */
    this.rating = data.rating;
    /** @type {IBuff} */
    this.buff = data.buffer ? new Buff(data.buffer) : null;
    /** @type {number} */
    this.score = data.score || 0;
    /** @type {IChallengeAvatar[]} */
    this.avatar_list = data?.avatar_list?.map(avatar => new ChallengeAvatar(avatar)) || [];
    /** @type {IChallengeBangboo} */
    this.buddy = data?.buddy ? new ChallengeBangboo(data.buddy) : null;
    /** @type {number} */
    this.battle_time = data.battle_time;
    /** @type {string} */
    this.monster_pic = data.monster_pic;
    /** @type {number} */
    this.max_score = data.max_score;
  }

  async get_assets() {
    if (this.avatar_list) {
      await Promise.all(this.avatar_list.map(avatar => avatar.get_assets()));
    }
    if (this.buddy) {
      await this.buddy.get_assets();
    }
  }

  get formattedTime() {
    const seconds = this.battle_time % 60;
    const minutes = Math.floor(this.battle_time / 60);
    return `${minutes ? minutes + '分' : ''}${seconds + '秒'}`;
  }
}

/**
 * @class FloorChallengeTime.
 */
export class FloorChallengeTime {
  /**
   * @param {IFloorChallengeTime} data
   */
  constructor(data) {
    /** @type {number} */
    this.year = data.year;
    /** @type {number} */
    this.month = data.month;
    /** @type {number} */
    this.day = data.day;
    /** @type {number} */
    this.hour = data.hour;
    /** @type {number} */
    this.minute = data.minute;
    /** @type {number} */
    this.second = data.second;
  }

  /** @type {string} */
  get formattedTime() {
    return `${this.year}.${String(this.month).padStart(2, '0')}.${String(
      this.day
    ).padStart(2, '0')} ${String(this.hour).padStart(2, '0')}:${String(
      this.minute
    ).padStart(2, '0')}:${String(this.second).padStart(2, '0')}`;
  }
}

/**
 * @class FifthLayerDetail.
 */
export class FifthLayerDetail {
  /**
   * @param {IFifthLayerDetail} data
   * @param {IBrief} brief
   */
  constructor(data, brief) {
    /** @type {IChallengeNode[]} */
    this.nodes = data.layer_challenge_info_list.map(node => new ChallengeNode(node));
    /** @type {number} */
    this.battle_time = data.layer_challenge_info_list.reduce((acc, cur) => acc + cur.battle_time, 0);
    /** @type {number} */
    this.score = brief.score;
    /** @type {FloorChallengeTime} */
    this.challenge_time = new FloorChallengeTime(brief.challenge_time);
    /** @type {string} */
    this.rating = brief.rating;
  }

  async get_assets() {
    await Promise.all(this.nodes.map(node => node.get_assets()));
  }

  get formattedTime() {
    return this.challenge_time.formattedTime;
  }

  get formattedRating() {
    return this.nodes.map(node => node.rating.replace('+', 'P')).join(' ');
  }
}

export class FourthLayerDetail {
  /**
   * @param {IFourthLayerDetail} data
   */
  constructor(data) {
    /** @type {IBuff} */
    this.buff = new Buff(data.buffer);
    /** @type {IFloorChallengeTime} */
    this.challenge_time = new FloorChallengeTime(data.challenge_time);
    /** @type {string} */
    this.rating = data.rating;
    /** @type {IChallengeNode[]} */
    this.nodes = data.layer_challenge_info_list.map(node => new ChallengeNode(node));
    /** @type {number} */
    this.battle_time = data.layer_challenge_info_list.reduce((acc, cur) => acc + cur.battle_time, 0);
  }

  async get_assets() {
    await Promise.all(this.nodes.map(node => node.get_assets()));
  }

  /** @type {string} */
  get formattedTime() {
    return this.challenge_time.formattedTime;
  }

  get formattedRating() {
    return this.rating.replace('+', 'P');
  }
}

export class Brief {
  /**
   * @param {IBrief} data
   */
  constructor(data) {
    /** @type {number} */
    this.max_layer = data.cur_period_zone_layer_count;
    /** @type {number} */
    this.score = data.score;
    /** @type {number} */
    this.rank_percent = data.rank_percent;
    /** @type {number} */
    this.battle_time = data.battle_time;
    /** @type {string} */
    this.rating = data.rating;
    /** @type {IFloorChallengeTime|null} */
    this.challenge_time = data.challenge_time ? new FloorChallengeTime(data.challenge_time) : null;
    /** @type {number} */
    this.max_score = data.max_score;
  }
}


/**
 * @class ZZZChallenge.
 */
export class ZZZChallenge {
  /**
   * @param {IHadalInfoV2} data
   */
  constructor(data) {
    /** @type {number} */
    this.zone_id = data.zone_id;
    /** @type {string} */
    this._begin_time = data.begin_time;
    /** @type {string} */
    this._end_time = data.end_time;
    /** @type {Brief} */
    this.brief = new Brief(data.brief);
    /** @type {boolean} */
    this.pass_fifth_floor = data.pass_fifth_floor;
    /** @type {FifthLayerDetail|null} */
    this.fifth_layer_detail = data.fitfh_layer_detail ? new FifthLayerDetail(data.fitfh_layer_detail, data.brief) : null;
    /** @type {FourthLayerDetail|null} */
    this.fourth_layer_detail = data.fourth_layer_detail ? new FourthLayerDetail(data.fourth_layer_detail) : null;
    /** @type {number} */
    this.max_layer = data.brief.cur_period_zone_layer_count;
    /** @type {IHadalTime} */
    this.hadal_begin_time = data.hadal_begin_time;
    /** @type {IHadalTime} */
    this.hadal_end_time = data.hadal_end_time;
  }

  async get_assets() {
    const floors = [];
    if (this.fifth_layer_detail) {
      floors.push(this.fifth_layer_detail);
    }
    if (this.fourth_layer_detail) {
      floors.push(this.fourth_layer_detail);
    }
    await Promise.all(floors.map(floor => floor.get_assets()));
  }

  /** @type {string} */
  get begin_time() {
    const time = this.hadal_begin_time;
    return `${String(time.month).padStart(2, '0')}.${String(time.day).padStart(
      2,
      '0'
    )}`;
  }

  /** @type {string} */
  get end_time() {
    const time = this.hadal_end_time;
    return `${String(time.month).padStart(2, '0')}.${String(time.day).padStart(
      2,
      '0'
    )}`;
  }

  formatRating(rating) {
    if (!rating) return '';
    return rating.replace('+', 'P');
  }
}
