import { getSquareBangboo } from '../lib/download.js';

/**
 * @class
 */
export class Buddy {
  /**
   * @param {{
   *  id: number;
   *  name: string;
   *  rarity: string;
   *  level: number;
   *  star: number;
   * }} data
   */
  constructor(data) {
    const { id, name, rarity, level, star } = data;
    this.id = id;
    this.name = name;
    this.rarity = rarity;
    this.level = level;
    this.star = star;
  }

  async get_assets() {
    const result = await getSquareBangboo(this.id);
    this.square_icon = result;
  }
}

/**
 * @class
 */
export class Item {
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

  async get_assets() {
    const result = await getSquareBangboo(this.id);
    this.square_icon = result;
  }
}

/**
 * @class
 */
export class BangbooWiki {
  /**
   * @param {string} item_id
   * @param {string} wiki_url
   */
  constructor(item_id, wiki_url) {
    this.item_id = item_id;
    this.wiki_url = wiki_url;
  }
}

/**
 * @class
 */
export class ZZZBangbooResp {
  /**
   * @param {Item[]} items
   * @param {BangbooWiki} bangboo_wiki
   */
  constructor(items, bangboo_wiki) {
    this.items = items;
    this.bangboo_wiki = bangboo_wiki;
  }

  async get_assets() {
    for (const item of this.items) {
      await item.get_assets();
    }
  }
}
