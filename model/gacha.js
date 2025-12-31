import {
  getSquareAvatar,
  getSquareBangboo,
  getWeaponImage,
} from '../lib/download.js';

/**
 * @class
 */
export class SingleGachaLog {
  // 类型标注
  /** @type {string} */
  uid;
  /** @type {string} */
  gacha_id;
  /** @type {string} */
  gacha_type;
  /** @type {string} */
  item_id;
  /** @type {string} */
  count;
  /** @type {string} */
  time;
  /** @type {string} */
  name;
  /** @type {string} */
  lang;
  /** @type {string} */
  item_type;
  /** @type {string} */
  rank_type;
  /** @type {string} */
  id;
  /**
   * @param {{
   *  uid: string;
   *  gacha_id: string;
   *  gacha_type: string;
   *  item_id: string;
   *  count: string;
   *  time: string;
   *  name: string;
   *  lang: string;
   *  item_type: string;
   *  rank_type: string;
   *  id: string;
   * }} data
   */
  constructor(data) {
    const {
      uid,
      gacha_id,
      gacha_type,
      item_id,
      count,
      time,
      name,
      lang,
      item_type,
      rank_type,
      id,
    } = data;
    this.uid = uid;
    this.gacha_id = gacha_id;
    this.gacha_type = gacha_type;
    this.item_id = item_id;
    this.count = count;
    this.time = time;
    this.name = name;
    this.lang = lang;
    this.item_type = item_type;
    this.rank_type = rank_type;
    this.id = id;

    this.square_icon = '';
  }

  /**
   *
   * @param {SingleGachaLog} item
   */
  equals(item) {
    return (
      this.uid === item.uid &&
      this.id === item.id &&
      this.gacha_type === this.gacha_type
    );
  }

  async get_assets() {
    if (this.item_type === '音擎') {
      const result = await getWeaponImage(this.item_id);
      // logger.debug('音擎result', result);
      this.square_icon = result;
    } else if (this.item_type === '邦布') {
      const result = await getSquareBangboo(this.item_id);
      this.square_icon = result;
    } else {
      const result = await getSquareAvatar(this.item_id);
      this.square_icon = result;
    }
  }
}

/**
 * @class
 */
export class ZZZGachaLogResp {
  /**
   * @param {{
   *  page: string;
   *  size: string;
   *  list: SingleGachaLog[];
   *  region: string;
   *  region_time_zone: number;
   * }} data
   */
  constructor(data) {
    const { page, size, list, region, region_time_zone } = data;
    this.page = page;
    this.size = size;
    this.list = list.map(item => new SingleGachaLog(item));
    this.region = region;
    this.region_time_zone = region_time_zone;
  }
}
