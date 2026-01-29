import { isGroupRankAllowed, isUserRankAllowed, addUserToGroupRank, setUidAndQQ } from '../lib/rank.js';
import { rulePrefix } from '../lib/common.js';
import { saveDeadlyData } from '../lib/db.js';
import { ZZZPlugin } from '../lib/plugin.js';
import { Deadly } from '../model/deadly.js';
import settings from '../lib/settings.js';
export class deadly extends ZZZPlugin {
    isGroupRankAllowed;
    constructor() {
        super({
            name: '[ZZZ-Plugin]deadly',
            dsc: 'zzz危局强袭战',
            event: 'message',
            priority: settings.getConfig('priority')?.deadly ?? 70,
            rule: [
                {
                    reg: `${rulePrefix}(上期|往期)?(危局强袭战|危局|强袭|强袭战)$`,
                    fnc: 'deadly'
                }
            ]
        });
        this.isGroupRankAllowed = isGroupRankAllowed;
    }
    async deadly() {
        const { api, deviceFp } = await this.getAPI();
        await this.getPlayerInfo();
        const method = this.e.msg.match(`(上期|往期)`) ? 'zzzDeadlyPeriod' : 'zzzDeadly';
        const deadlyData = await api.getFinalData(method, {
            deviceFp
        }).catch((e) => {
            this.reply(e.message);
            throw e;
        });
        if (!deadlyData?.has_data) {
            return this.reply('没有危局强袭战数据');
        }
        const rank_type = 'DEADLY';
        const uid = await this.getUID();
        let userRankAllowed = null;
        if (uid) {
            if (this.e?.group_id) {
                await addUserToGroupRank(rank_type, uid, this.e.group_id);
                const qq = (this.e.at && !this.e.atBot) ? this.e.at : this.e.user_id;
                await setUidAndQQ(this.e.group_id, uid, qq);
                userRankAllowed = !!(await isUserRankAllowed(rank_type, uid, this.e.group_id));
            }
            if (this.isGroupRankAllowed()) {
                saveDeadlyData(uid, {
                    player: this.e.playerCard,
                    result: deadlyData
                });
            }
        }
        const deadly = new Deadly(deadlyData);
        const timer = setTimeout(() => {
            if (this?.reply) {
                this.reply('查询成功，正在下载图片资源，请稍候。');
            }
        }, 5000);
        await deadly.get_assets();
        clearTimeout(timer);
        const finalData = {
            deadly,
            userRankAllowed
        };
        await this.render('deadly/index.html', finalData, this);
    }
}
//# sourceMappingURL=deadly.js.map