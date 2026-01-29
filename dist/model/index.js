import { ZZZAvatarBasic } from './avatar.js';
import { Buddy } from './bangboo.js';
export class ZZZIndexResp {
    stats;
    avatar_list;
    cur_head_icon_url;
    buddy_list;
    constructor(data) {
        const { stats, avatar_list, cur_head_icon_url, buddy_list } = data;
        this.stats = stats;
        this.avatar_list = avatar_list.map(item => new ZZZAvatarBasic(item));
        this.cur_head_icon_url = cur_head_icon_url;
        this.buddy_list = buddy_list.map(item => new Buddy(item));
    }
    async get_assets() {
        for (const avatar of this.avatar_list) {
            await avatar.get_assets();
        }
        for (const buddy of this.buddy_list) {
            await buddy.get_assets();
        }
    }
}
//# sourceMappingURL=index.js.map