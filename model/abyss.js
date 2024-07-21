import { element } from '../lib/convert.js';
import { getSquareAvatar, getSquareBangboo } from '../lib/download.js';
/**
 * @typedef {Object} IChallengeAvatar
 * @property {number} id
 * @property {number} level
 * @property {string} rarity
 * @property {number} element_type
 */

/**
 * @typedef {Object} IChallengeBangboo
 * @property {number} id
 * @property {string} rarity
 * @property {number} level
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
 * @typedef {Object} IMonsterInfo
 * @property {number} id
 * @property {string} name
 * @property {number} weak_element_type
 */

/**
 * @typedef {Object} IBuff
 * @property {string} title
 * @property {string} text
 */

/**
 * @typedef {Object} IChallengeNode
 * @property {IChallengeAvatar[]} avatars
 * @property {IChallengeBangboo} buddy
 * @property {number[]} element_type_list
 * @property {IMonsterInfo} monster_info
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
 * @typedef {Object} IFloorDetail
 * @property {number} layer_index
 * @property {string} rating
 * @property {number} layer_id
 * @property {IBuff[]} buffs
 * @property {IChallengeNode} node_1
 * @property {IChallengeNode} node_2
 * @property {number} challenge_time
 * @property {string} zone_name
 * @property {IFloorChallengeTime} floor_challenge_time
 */

/**
 * @typedef {Object} IRating
 * @property {number} times
 * @property {string} rating
 */

/**
 * @typedef {Object} IZZZChallenge
 * @property {number} schedule_id
 * @property {number} begin_time
 * @property {number} end_time
 * @property {IRating[]} rating_list
 * @property {boolean} has_data
 * @property {IFloorDetail[]} all_floor_detail
 * @property {number} fast_layer_time
 * @property {number} max_layer
 * @property {IHadalTime} hadal_begin_time
 * @property {IHadalTime} hadal_end_time
 */

/**
 * @class ChallengeAvatar.
 */
export class ChallengeAvatar {
  /**
   * @param {IChallengeAvatar} data
   */
  constructor(data) {
    this.id = data.id;
    this.level = data.level;
    this.rarity = data.rarity;
    this.element_type = data.element_type;
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
    this.id = data.id;
    this.rarity = data.rarity;
    this.level = data.level;
  }

  async get_assets() {
    const result = await getSquareBangboo(this.id);
    this.square_icon = result;
  }
}

/**
 * @class MonsterInfo.
 */
export class MonsterInfo {
  /**
   * @param {IMonsterInfo} data
   */
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.weak_element_type = data.weak_element_type;
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
    this.text = data.text;
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
    /** @type {IChallengeAvatar[]} */
    this.avatars = data?.avatars?.map(avatar => new ChallengeAvatar(avatar));
    /** @type {IChallengeBangboo} */
    this.buddy = data?.buddy && new ChallengeBangboo(data.buddy);
    /** @type {number[]} */
    this.element_type_list = data.element_type_list;
    /** @type {MonsterInfo} */
    this.monster_info =
      data?.monster_info && new MonsterInfo(data.monster_info);
  }

  async get_assets() {
    if (this.avatars) {
      await Promise.all(this.avatars.map(avatar => avatar.get_assets()));
    }
    if (this.buddy) {
      await this.buddy.get_assets();
    }
  }

  get elements() {
    return this.element_type_list.map(type => {
      return element.IDToElement(type);
    });
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
    return `${this.year}/${this.month}/${this.day} ${this.hour}:${this.minute}:${this.second}`;
  }
}

/**
 * @class FloorDetail.
 */
export class FloorDetail {
  /**
   * @param {IFloorDetail} data
   */
  constructor(data) {
    /** @type {number} */
    this.layer_index = data.layer_index;
    /** @type {string} */
    this.rating = data.rating;
    /** @type {number} */
    this.layer_id = data.layer_id;
    /** @type {IBuff[]} */
    this.buffs = data.buffs.map(buff => new Buff(buff));
    /** @type {IChallengeNode} */
    this.node_1 = data?.node_1 && new ChallengeNode(data.node_1);
    /** @type {IChallengeNode} */
    this.node_2 = data?.node_2 && new ChallengeNode(data.node_2);
    /** @type {number} */
    this.challenge_time = data.challenge_time;
    /** @type {string} */
    this.zone_name = data.zone_name;
    /** @type {IFloorChallengeTime} */
    this.floor_challenge_time = new FloorChallengeTime(
      data.floor_challenge_time
    );
  }

  async get_assets() {
    if (this.node_1) {
      await this.node_1.get_assets();
    }
    if (this.node_2) {
      await this.node_2.get_assets();
    }
  }

  /** @type {string} */
  get formattedTime() {
    return (
      this.floor_challenge_time.year +
      '年' +
      this.floor_challenge_time.month +
      '月' +
      this.floor_challenge_time.day +
      '日 ' +
      this.floor_challenge_time.hour.toString().padStart(2, '0') +
      ':' +
      this.floor_challenge_time.minute.toString().padStart(2, '0') +
      ':' +
      this.floor_challenge_time.second.toString().padStart(2, '0')
    );
  }
}

/**
 * @class Rating.
 */
export class Rating {
  /**
   * @param {IRating} data
   */
  constructor(data) {
    this.times = data.times;
    this.rating = data.rating;
  }
}

/**
 * @class ZZZChallenge.
 */
export class ZZZChallenge {
  /**
   * @param {IZZZChallenge} data
   */
  constructor(data) {
    // 类型标注
    /** @type {number} */
    this.schedule_id = data.schedule_id;
    /** @type {number} */
    this._begin_time = data.begin_time;
    /** @type {number} */
    this._end_time = data.end_time;
    /** @type {IRating[]} */
    this.rating_list = data.rating_list.map(rating => new Rating(rating));
    /** @type {boolean} */
    this.has_data = data.has_data;
    /** @type {IFloorDetail[]} */
    this.all_floor_detail = data.all_floor_detail.map(
      floorDetail => new FloorDetail(floorDetail)
    );
    /** @type {number} */
    this.fast_layer_time = data.fast_layer_time;
    /** @type {number} */
    this.max_layer = data.max_layer;
    /** @type {IHadalTime} */
    this.hadal_begin_time = data.hadal_begin_time;
    /** @type {IHadalTime} */
    this.hadal_end_time = data.hadal_end_time;

    /** @type {{
     *  S: number;
     *  A: number;
     *  B: number;
     * }} */
    this.rate_count = {
      S: this.rating_list.find(rating => rating.rating === 'S')?.times || 0,
      A: this.rating_list.find(rating => rating.rating === 'A')?.times || 0,
      B: this.rating_list.find(rating => rating.rating === 'B')?.times || 0,
    };
  }

  async get_assets() {
    await Promise.all(this.all_floor_detail.map(floor => floor.get_assets()));
  }

  get fast_layer_time_str() {
    // 将秒数转换为 xx小时xx分钟xx秒 的格式，例如：234 -> 3分钟54秒
    const seconds = this.fast_layer_time % 60;
    const minutes = Math.floor(this.fast_layer_time / 60) % 60;
    const hours = Math.floor(this.fast_layer_time / 3600);
    return `${hours ? hours + '小时' : ''}${minutes ? minutes + '分钟' : ''}${
      seconds ? seconds + '秒' : ''
    }`;
  }

  /** @type {string} */
  get begin_time() {
    return new Date(Number(this._begin_time) * 1000).toLocaleDateString(
      'en-US',
      {
        month: '2-digit',
        day: '2-digit',
      }
    );
  }

  /** @type {string} */
  get end_time() {
    return new Date(Number(this._end_time) * 1000).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
    });
  }
}
