import { ZZZIndexResp } from '../model/index.js';
import { rulePrefix } from '../lib/common.js';
import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
export class Card extends ZZZPlugin {
    constructor() {
        super({
            name: '[ZZZ-Plugin]Card',
            dsc: 'zzzcard',
            event: 'message',
            priority: _.get(settings.getConfig('priority'), 'card', 70),
            rule: [
                {
                    reg: `${rulePrefix}(card|卡片|个人信息|角色)$`,
                    fnc: 'card'
                }
            ]
        });
    }
    async card() {
        const { api, deviceFp } = await this.getAPI();
        await this.getPlayerInfo();
        const indexData = await api.getFinalData('zzzIndex', {
            deviceFp
        }).catch((e) => {
            this.reply(e.message);
            throw e;
        });
        if (!indexData)
            return false;
        const zzzAvatarList = await api.getFinalData('zzzAvatarList', {
            deviceFp
        }).catch((e) => {
            this.reply(e.message);
            throw e;
        });
        if (!zzzAvatarList)
            return false;
        indexData.avatar_list = zzzAvatarList.avatar_list;
        const zzzBuddyList = await api.getFinalData('zzzBuddyList', {
            deviceFp
        }).catch((e) => {
            this.reply(e.message);
            throw e;
        });
        if (!zzzBuddyList)
            return false;
        indexData.buddy_list = zzzBuddyList.list?.map((item) => ({
            ...item,
            bangboo_rectangle_url: item.bangboo_rectangle_url || item.bangboo_square_url
        }));
        const finalIndexData = new ZZZIndexResp(indexData);
        if (this.e.playerCard?.player) {
            this.e.playerCard.player.region_name = finalIndexData.stats.world_level_name;
        }
        const timer = setTimeout(() => {
            if (this?.reply) {
                this.reply('查询成功，正在下载图片资源，请稍候。');
            }
        }, 5000);
        await finalIndexData.get_assets();
        clearTimeout(timer);
        const data = {
            card: finalIndexData
        };
        await this.render('card/index.html', data);
    }
}
//# sourceMappingURL=card.js.map