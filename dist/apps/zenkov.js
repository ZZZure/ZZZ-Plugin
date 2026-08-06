import { rulePrefix } from '../lib/common.js';
import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
export class Zenkov extends ZZZPlugin {
    constructor() {
        super({
            name: '[ZZZ-Plugin]zenkov',
            dsc: 'zzz迷宫诡域',
            event: 'message',
            priority: settings.getConfig('priority')?.zenkov ?? 70,
            rule: [
                {
                    reg: `${rulePrefix}(迷宫诡域|迷宫|诡域|搜打撤|塔科夫|塔可夫|塔克夫|鸭科夫|绝科夫)$`,
                    fnc: 'zenkov',
                },
            ],
        });
    }
    formatTimeDaysHours(seconds) {
        if (!seconds || seconds <= 0)
            return '00天00时';
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        return `${days.toString().padStart(2, '0')}天${hours.toString().padStart(2, '0')}时`;
    }
    formatTimeDays(seconds) {
        if (!seconds || seconds <= 0)
            return '0天';
        const days = Math.floor(seconds / 86400);
        return `${days}天`;
    }
    async zenkov() {
        const { api, deviceFp } = await this.getAPI();
        await this.getPlayerInfo();
        const zenkovDetail = await api
            .getFinalData('zzzZenkov', {
            deviceFp,
        })
            .catch((e) => {
            this.reply(e.message);
            throw e;
        });
        if (!zenkovDetail) {
            return this.reply('暂无迷宫诡域数据');
        }
        if (zenkovDetail.refresh_time) {
            ;
            zenkovDetail.formatted_weekly_refresh_time =
                this.formatTimeDaysHours(zenkovDetail.refresh_time);
        }
        if (zenkovDetail.season_data?.refresh_time) {
            ;
            zenkovDetail.season_data.formatted_refresh_time =
                this.formatTimeDays(zenkovDetail.season_data.refresh_time);
        }
        let formattedRank = '-';
        if (zenkovDetail.is_show_percent && zenkovDetail.max_rank) {
            formattedRank = `${(zenkovDetail.max_rank / 100).toFixed(0)}%+`;
        }
        ;
        zenkovDetail.formatted_max_rank = formattedRank;
        const finalData = {
            zenkov: zenkovDetail,
        };
        await this.render('zenkov/index.html', finalData, this);
    }
}
//# sourceMappingURL=zenkov.js.map