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
