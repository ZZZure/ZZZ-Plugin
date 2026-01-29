import { gacha_type_meta_data, gacha_type_meta_data_ck, item_type_ck, rarity_ck, FLOORS_MAP, HOMO_TAG, EMOJI, NORMAL_LIST, } from './gacha/const.js';
import { getZZZGachaLogByAuthkey } from './gacha/core.js';
import { getGachaLog, saveGachaLog } from './db.js';
import { getLevelFromList } from './gacha/tool.js';
import { SingleGachaLog } from '../model/gacha.js';
import { sleep } from '../utils/time.js';
import { rank } from './convert.js';
export const updateGachaLog = async (authKey, uid, region, game_biz) => {
    const previousLog = getGachaLog(uid) || {};
    const newCount = {};
    for (const name of Object.keys(gacha_type_meta_data)) {
        if (!previousLog[name]) {
            previousLog[name] = [];
        }
        newCount[name] = 0;
        previousLog[name] = previousLog[name].map(i => new SingleGachaLog(i));
        const lastSaved = previousLog[name]?.[0];
        let page = 1;
        let endId = '0';
        const newData = [];
        for (const type of gacha_type_meta_data[name]) {
            queryLabel: while (true) {
                const log = await getZZZGachaLogByAuthkey(authKey, type, type[0], page, endId, region, game_biz);
                if (!log || !log?.list || log?.list?.length === 0) {
                    break;
                }
                for (const item of log.list) {
                    if (lastSaved && lastSaved.equals(item)) {
                        break queryLabel;
                    }
                    newData.push(item);
                    newCount[name]++;
                }
                endId = log.list[log.list.length - 1]?.id || endId;
                page++;
                await sleep(1000);
            }
        }
        previousLog[name] = [...newData, ...previousLog[name]];
    }
    saveGachaLog(uid, previousLog);
    return {
        data: previousLog,
        count: newCount,
    };
};
export const updateGachaLog_ck = async (api, uid, deviceFp) => {
    const previousLog = getGachaLog(uid) || {};
    const newCount = {};
    for (const name of Object.keys(gacha_type_meta_data_ck)) {
        if (!previousLog[name]) {
            previousLog[name] = [];
        }
        newCount[name] = 0;
        previousLog[name] = previousLog[name].map(i => new SingleGachaLog(i));
        const lastSaved = previousLog[name]?.[0];
        let endId = '0';
        const newData = [];
        for (const type of gacha_type_meta_data_ck[name]) {
            queryLabel: while (true) {
                const log = await api.getFinalData('zzzGacha_Record', {
                    deviceFp,
                    type,
                    endId,
                });
                if (!log || !log?.gacha_item_list || log?.gacha_item_list?.length === 0) {
                    break;
                }
                for (let item of log.gacha_item_list) {
                    const date = item.date;
                    item = {
                        uid: uid,
                        gacha_id: '0',
                        gacha_type: '2',
                        item_id: item.item_id,
                        count: '1',
                        time: `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')} ${date.hour.toString().padStart(2, '0')}:${date.minute.toString().padStart(2, '0')}:${date.second.toString().padStart(2, '0')}`,
                        name: item.item_name,
                        lang: 'zh-cn',
                        item_type: item_type_ck[item.item_type],
                        rank_type: rarity_ck[item.rarity],
                        id: item.id,
                        square_icon: '',
                    };
                    if (lastSaved && lastSaved.equals(item)) {
                        break queryLabel;
                    }
                    newData.push(item);
                    newCount[name]++;
                }
                endId = log.gacha_item_list[log.gacha_item_list.length - 1]?.id || endId;
                await sleep(1000);
            }
        }
        previousLog[name] = [...newData, ...previousLog[name]];
    }
    saveGachaLog(uid, previousLog);
    return {
        data: previousLog,
        count: newCount,
    };
};
export const anaylizeGachaLog = async (uid) => {
    const savedData = getGachaLog(uid);
    if (!savedData) {
        return null;
    }
    const result = [];
    for (const name of Object.keys(savedData)) {
        const data = savedData[name].map(item => new SingleGachaLog(item));
        const earliest = data[data.length - 1];
        const latest = data[0];
        const list = [];
        let lastFive = null;
        let preIndex = 0;
        let i = 0;
        for (const item of data) {
            let isUp = true;
            if (item.rank_type === '4') {
                await item.get_assets();
                if (NORMAL_LIST.includes(item.name)) {
                    isUp = false;
                }
                if (lastFive === null) {
                    lastFive = i;
                }
                if (list.length > 0) {
                    list[list.length - 1]['totalCount'] = (i - preIndex).toString();
                    if (i - preIndex <= FLOORS_MAP[name][0]) {
                        list[list.length - 1]['color'] = 'rgb(63, 255, 0)';
                    }
                    else if (i - preIndex >= FLOORS_MAP[name][1]) {
                        list[list.length - 1]['color'] = 'rgb(255, 20, 20)';
                    }
                }
                list.push({
                    ...item,
                    rank_type_label: rank.getRankChar(item.rank_type),
                    isUp: isUp,
                    totalCount: '-',
                    color: 'white',
                });
                preIndex = i;
            }
            if (i === data.length - 1 && list.length > 0) {
                list[list.length - 1]['totalCount'] = (i - preIndex + 1).toString();
                if (i - preIndex + 1 <= FLOORS_MAP[name][0]) {
                    list[list.length - 1]['color'] = 'rgb(63, 255, 0)';
                }
                else if (i - preIndex + 1 >= FLOORS_MAP[name][1]) {
                    list[list.length - 1]['color'] = 'rgb(255, 20, 20)';
                }
            }
            i++;
        }
        const upCount = list.filter(i => i.isUp).length;
        const totalCount = data.length;
        const fiveStars = list.length;
        let timeRange = '还没有抽卡';
        let avgFive = '-';
        let avgUp = '-';
        let noWai = '-';
        let level = 2;
        if (data.length > 0) {
            timeRange = `${latest.time} ～ ${earliest.time}`;
            if (lastFive) {
                if (fiveStars > 0)
                    avgFive = ((totalCount - lastFive) / fiveStars).toFixed(1);
                if (upCount > 0)
                    avgUp = ((totalCount - lastFive) / upCount).toFixed(1);
                if (+avgFive && +avgUp) {
                    noWai = ((2 - +avgUp / +avgFive) * 100).toFixed(0) + '%';
                }
            }
        }
        if (!lastFive && fiveStars === 0) {
            if (totalCount > 0)
                lastFive = totalCount;
            else
                lastFive = '-';
        }
        if (avgUp !== '-') {
            if ('音擎频段' === name) {
                level = getLevelFromList(+avgUp, [62, 75, 88, 99, 111]);
            }
            else if ('音擎回响' === name) {
                level = getLevelFromList(+avgUp, [62, 75, 88, 99, 111]);
            }
            else if ('邦布频段' === name) {
                level = getLevelFromList(+avgUp, [51, 55, 61, 68, 70]);
            }
            else if ('独家频段' === name) {
                level = getLevelFromList(+avgUp, [74, 87, 99, 105, 120]);
            }
            else if ('独家重映' === name) {
                level = getLevelFromList(+avgUp, [74, 87, 99, 105, 120]);
            }
        }
        if (avgFive !== '-') {
            if ('常驻频段' === name) {
                level = getLevelFromList(+avgFive, [53, 60, 68, 73, 75]);
            }
        }
        const tag = HOMO_TAG[level];
        const emojis = EMOJI[level];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        result.push({
            name,
            timeRange,
            list,
            lastFive,
            fiveStars,
            upCount,
            totalCount,
            avgFive,
            avgUp,
            noWai,
            level,
            tag,
            emoji,
        });
    }
    const order = ['独家频段', '独家重映', '音擎频段', '音擎回响', '常驻频段', '邦布频段'];
    result.sort((a, b) => {
        const ai = order.indexOf(a.name);
        const bi = order.indexOf(b.name);
        const aIdx = ai === -1 ? order.length : ai;
        const bIdx = bi === -1 ? order.length : bi;
        return aIdx - bIdx;
    });
    return result;
};
//# sourceMappingURL=gacha.js.map