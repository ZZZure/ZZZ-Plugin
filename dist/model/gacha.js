import { getSquareAvatar, getSquareBangboo, getWeaponImage, } from '../lib/download.js';
export class SingleGachaLog {
    uid;
    gacha_id;
    gacha_type;
    item_id;
    count;
    time;
    name;
    lang;
    item_type;
    rank_type;
    id;
    square_icon;
    constructor(data) {
        const { uid, gacha_id, gacha_type, item_id, count, time, name, lang, item_type, rank_type, id, } = data;
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
    equals(item) {
        return (this.uid === item.uid &&
            this.id === item.id &&
            this.gacha_type === this.gacha_type);
    }
    async get_assets() {
        if (this.item_type === '音擎') {
            const result = await getWeaponImage(this.item_id);
            if (result)
                this.square_icon = result;
        }
        else if (this.item_type === '邦布') {
            const result = await getSquareBangboo(this.item_id);
            if (result)
                this.square_icon = result;
        }
        else {
            const result = await getSquareAvatar(this.item_id);
            if (result)
                this.square_icon = result;
        }
    }
}
export class ZZZGachaLogResp {
    page;
    size;
    list;
    region;
    region_time_zone;
    constructor(data) {
        const { page, size, list, region, region_time_zone } = data;
        this.page = page;
        this.size = size;
        this.list = list.map(item => new SingleGachaLog(item));
        this.region = region;
        this.region_time_zone = region_time_zone;
    }
}
//# sourceMappingURL=gacha.js.map