import { getSquareBangboo } from '../lib/download.js';
export class Buddy {
    id;
    name;
    rarity;
    level;
    star;
    square_icon;
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
export class Item {
    id;
    name;
    rarity;
    level;
    star;
    square_icon;
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
export class BangbooWiki {
    item_id;
    wiki_url;
    constructor(item_id, wiki_url) {
        this.item_id = item_id;
        this.wiki_url = wiki_url;
    }
}
export class ZZZBangbooResp {
    items;
    bangboo_wiki;
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
//# sourceMappingURL=bangboo.js.map