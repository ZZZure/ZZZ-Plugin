/**
 * @class
 */
export class SingleGachaLog {
  /**
   * @param {string} uid
   * @param {string} gacha_id
   * @param {string} gacha_type
   * @param {string} item_id
   * @param {string} count
   * @param {string} time
   * @param {string} name
   * @param {string} lang
   * @param {string} item_type
   * @param {string} rank_type
   * @param {string} id
   */
  constructor(
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
    id
  ) {
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
  }

  /**
   *
   * @param {SingleGachaLog} item
   */
  equals(item) {
    return (
      this.uid === item.uid &&
      this.gacha_id === item.gacha_id &&
      this.gacha_type === this.gacha_type
    );
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
    this.list = list.map(
      item =>
        new SingleGachaLog(
          item.uid,
          item.gacha_id,
          item.gacha_type,
          item.item_id,
          item.count,
          item.time,
          item.name,
          item.lang,
          item.item_type,
          item.rank_type,
          item.id
        )
    );
    this.region = region;
    this.region_time_zone = region_time_zone;
  }
}
