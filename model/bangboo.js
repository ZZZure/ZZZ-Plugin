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
}
