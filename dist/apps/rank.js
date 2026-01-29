import { isUserRankAllowed, isGroupRankAllowed, getUsersInGroupRank, setUserRankAllowed, getUid2QQsMapping, removeUidAllRecord, } from '../lib/rank.js';
import { getAbyssDataInGroupRank, getDeadlyDataInGroupRank } from '../lib/db.js';
import { rulePrefix } from '../lib/common.js';
import { ZZZPlugin } from '../lib/plugin.js';
import { Deadly } from '../model/deadly.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
export class Rank extends ZZZPlugin {
    isGroupRankAllowed;
    scale;
    constructor() {
        super({
            name: '[ZZZ-Plugin]rank',
            dsc: 'zzz群排名',
            event: 'message',
            priority: _.get(settings.getConfig('priority'), 'rank', 70),
            rule: [
                {
                    reg: `${rulePrefix}(式舆防卫战|式舆|深渊|防卫战|防卫)排名$`,
                    fnc: 'abyssRank'
                },
                {
                    reg: `${rulePrefix}(危局强袭战|危局|强袭|强袭战)排名$`,
                    fnc: 'deadlyRank'
                },
                {
                    reg: `${rulePrefix}(显示|展示|开启|打开|on|启用|启动|隐藏|取消显示|关闭|关掉|off|禁用|停止)(式舆防卫战|式舆|深渊|防卫战|防卫|危局强袭战|危局|强袭|强袭战)?(群(内)?)?排名$`,
                    fnc: 'switchRank'
                }
            ]
        });
        this.isGroupRankAllowed = isGroupRankAllowed;
        this.scale = 0.25;
    }
    async abyssRank() {
        const rank_type = 'ABYSS';
        if (!(this.e?.group_id)) {
            return this.reply('请在群聊中使用该命令！');
        }
        if (!this.isGroupRankAllowed()) {
            return this.reply('当前群深渊排名功能已关闭！');
        }
        const uidInGroupRank = await getUsersInGroupRank(rank_type, this.e.group_id);
        const memberMap = await this.e.group?.getMemberMap() || new Map();
        const qqInGroupSet = new Set(Array.from(memberMap.keys(), String));
        const uid2qqs = await getUid2QQsMapping(this.e.group_id);
        const uidInGroupRankFiltered = [];
        for (const uid of uidInGroupRank) {
            if (uid in uid2qqs && uid2qqs[uid].some(qq => qqInGroupSet.has(qq))) {
                uidInGroupRankFiltered.push(uid);
            }
            else {
                await removeUidAllRecord(this.e.group_id, uid);
            }
        }
        const rawData = getAbyssDataInGroupRank(uidInGroupRankFiltered);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const filteredByUser = [];
        for (const item of rawData) {
            const gameUid = _.get(item, 'player.player.game_uid');
            const userRankAllowed = await isUserRankAllowed(rank_type, gameUid, this.e.group_id);
            if (/^[0-9]{8}$/.test(gameUid) && userRankAllowed) {
                filteredByUser.push(item);
            }
        }
        let scoredData = filteredByUser
            .filter(item => _.get(item, 'result.hadal_ver') === 'v2')
            .filter(item => {
            const beginTime = _.get(item, 'result.hadal_info_v2.begin_time');
            const endTime = _.get(item, 'result.hadal_info_v2.end_time');
            return currentTimestamp >= beginTime && currentTimestamp <= endTime;
        })
            .map(item => {
            const score = _.get(item, 'result.hadal_info_v2.brief.score', 0);
            const rating = _.get(item, 'result.hadal_info_v2.brief.rating', 'C');
            const layers = _.get(item, 'result.hadal_info_v2.fitfh_layer_detail.layer_challenge_info_list', []);
            let updateTime = 0;
            for (const layer of layers) {
                const challengeTime = _.get(layer, 'challenge_time', 0);
                updateTime = Math.max(updateTime, challengeTime);
            }
            if (updateTime === 0) {
                updateTime = currentTimestamp;
            }
            return {
                ...item,
                result: item.result,
                score: {
                    score,
                    rating,
                    updateTime
                }
            };
        });
        if (scoredData.length === 0) {
            return this.reply('没有式舆防卫战排名，请先 %显示深渊排名，并且用 %深渊 查询战绩');
        }
        scoredData.sort((a, b) => {
            if (a.score.score !== b.score.score) {
                return b.score.score - a.score.score;
            }
            if (a.score.rating !== b.score.rating) {
                const ratingOrder = { 'S+': 5, 'S': 4, 'A': 3, 'B': 2, 'C': 1 };
                return (ratingOrder[b.score.rating] ?? 0) - (ratingOrder[a.score.rating] ?? 0);
            }
            return a.score.updateTime - b.score.updateTime;
        });
        let maxDisplay = _.get(settings.getConfig('rank'), 'max_display', 15);
        maxDisplay = Math.max(1, Math.min(maxDisplay, 15));
        scoredData = scoredData.slice(0, maxDisplay);
        const finalData = { scoredData };
        await this.render('rank/abyss/index.html', finalData, this);
    }
    async deadlyRank() {
        const rank_type = 'DEADLY';
        if (!(this.e?.group_id)) {
            return this.reply('请在群聊中使用该命令！');
        }
        if (!this.isGroupRankAllowed()) {
            await this.reply('当前群危局强袭战排名功能已关闭！');
        }
        const uidInGroupRank = await getUsersInGroupRank(rank_type, this.e.group_id);
        const memberMap = await this.e.group?.getMemberMap() || new Map();
        const qqInGroupSet = new Set(Array.from(memberMap.keys(), String));
        const uid2qqs = await getUid2QQsMapping(this.e.group_id);
        const uidInGroupRankFiltered = [];
        for (const uid of uidInGroupRank) {
            if (uid in uid2qqs && uid2qqs[uid].some(qq => qqInGroupSet.has(qq))) {
                uidInGroupRankFiltered.push(uid);
            }
            else {
                await removeUidAllRecord(this.e.group_id, uid);
            }
        }
        const rawData = getDeadlyDataInGroupRank(uidInGroupRankFiltered);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const filteredByUser = [];
        for (const item of rawData) {
            const gameUid = _.get(item, 'player.player.game_uid');
            const userRankAllowed = await isUserRankAllowed(rank_type, gameUid, this.e.group_id);
            if (/^[0-9]{8}$/.test(gameUid) && userRankAllowed) {
                filteredByUser.push(item);
            }
        }
        let scoredData = filteredByUser
            .filter(item => {
            const startTimeObj = _.get(item, 'result.start_time');
            const endTimeObj = _.get(item, 'result.end_time');
            const startTime = new Date(startTimeObj.year, startTimeObj.month - 1, startTimeObj.day, startTimeObj.hour, startTimeObj.minute, startTimeObj.second).getTime() / 1000;
            const endTime = new Date(endTimeObj.year, endTimeObj.month - 1, endTimeObj.day, endTimeObj.hour, endTimeObj.minute, endTimeObj.second).getTime() / 1000;
            return currentTimestamp >= startTime && currentTimestamp <= endTime;
        })
            .filter(item => _.get(item, 'result.has_data') === true)
            .map(item => {
            const totalScore = _.get(item, 'result.total_score', 0);
            const totalStar = _.get(item, 'result.total_star', 0);
            const challenges = _.get(item, 'result.list');
            let updateTime = 0;
            for (const challenge of challenges) {
                const { year, month, day, hour, minute, second } = challenge.challenge_time;
                const challengeTime = new Date(year, month - 1, day, hour, minute, second).getTime() / 1000;
                updateTime = Math.max(updateTime, challengeTime);
            }
            if (updateTime === 0) {
                updateTime = currentTimestamp;
            }
            return {
                ...item,
                result: new Deadly(item.result),
                score: {
                    totalStar,
                    totalScore,
                    updateTime
                }
            };
        });
        if (scoredData.length === 0) {
            return this.reply('没有危局强袭战排名，请先 %显示危局排名，并且用 %危局 查询战绩');
        }
        scoredData.sort((a, b) => {
            if (a.score.totalStar !== b.score.totalStar) {
                return b.score.totalStar - a.score.totalStar;
            }
            if (a.score.totalScore !== b.score.totalScore) {
                return b.score.totalScore - a.score.totalScore;
            }
            return a.score.updateTime - b.score.updateTime;
        });
        let maxDisplay = _.get(settings.getConfig('rank'), 'max_display', 15);
        maxDisplay = Math.max(1, Math.min(maxDisplay, 15));
        scoredData = scoredData.slice(0, maxDisplay);
        const timer = setTimeout(() => {
            if (this?.reply) {
                this.reply('查询成功，正在下载图片资源，请稍候。');
            }
        }, 5000);
        await Promise.all(_.map(scoredData, async (item) => {
            await item.result.get_assets();
        }));
        clearTimeout(timer);
        const finalData = { scoredData };
        await this.render('rank/deadly/index.html', finalData, this);
    }
    async switchRank() {
        if (!(this.e?.group_id)) {
            return this.reply('请在群聊中使用该命令！');
        }
        const uid = await this.getUID();
        if (!uid) {
            return this.reply('未绑定UID，请先绑定');
        }
        const enableRegex = /显示|展示|开启|打开|on|启用|启动/i;
        const disableRegex = /隐藏|取消显示|关闭|关掉|off|禁用|停止/i;
        let isEnable;
        if (enableRegex.test(this.e.msg)) {
            isEnable = true;
        }
        else if (disableRegex.test(this.e.msg)) {
            isEnable = false;
        }
        else {
            return this.reply('请输入"显示"或"隐藏"来设置是否显示个人的深渊排名', false, { at: true });
        }
        let rank_types = [];
        if (/式舆防卫战|式舆|深渊|防卫战|防卫/.test(this.e.msg)) {
            rank_types = ['ABYSS'];
        }
        else if (/危局强袭战|危局|强袭|强袭战/.test(this.e.msg)) {
            rank_types = ['DEADLY'];
        }
        else {
            rank_types = ['ABYSS', 'DEADLY'];
        }
        for (const rank_type of rank_types) {
            await setUserRankAllowed(rank_type, uid, this.e.group_id, isEnable ? 1 : 0);
        }
        const enableString = isEnable ? '显示' : '隐藏';
        await this.e.reply(`绝区零 UID: ${uid}，深渊排名功能已设置为: ${enableString}`, false, { at: true });
    }
}
//# sourceMappingURL=rank.js.map