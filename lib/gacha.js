import { SingleGachaLog, ZZZGachaLogResp } from '../model/gacha.js';
import { sleep } from '../utils/time.js';
import { getGachaLog, saveGachaLog } from './db.js';
import { ZZZ_GET_GACHA_LOG_API } from './mysapi/api.js';

export const gacha_type_meta_data = {
  音擎频段: ['3001'],
  独家频段: ['2001'],
  常驻频段: ['1001'],
  邦布频段: ['5001'],
};
/**
 *
 * @param {string} authKey
 * @param {*} gachaType
 * @param {*} initLogGachaBaseType
 * @param {number} page
 * @param {string} endId
 * @returns {Promise<ZZZGachaLogResp>}
 */
export async function getZZZGachaLogByAuthkey(
  authKey,
  gachaType = '2001',
  initLogGachaBaseType = '2',
  page = 1,
  endId = '0'
) {
  const serverId = 'prod_gf_cn';
  const url = ZZZ_GET_GACHA_LOG_API;
  const timestamp = Math.floor(Date.now() / 1000);

  const params = new URLSearchParams({
    authkey_ver: '1',
    sign_type: '2',
    auth_appid: 'webview_gacha',
    init_log_gacha_type: gachaType,
    init_log_gacha_base_type: initLogGachaBaseType,
    gacha_id: '2c1f5692fdfbb733a08733f9eb69d32aed1d37',
    timestamp: timestamp.toString(),
    lang: 'zh-cn',
    device_type: 'mobile',
    plat_type: 'ios',
    region: serverId,
    authkey: authKey,
    game_biz: 'nap_cn',
    gacha_type: gachaType,
    real_gacha_type: initLogGachaBaseType,
    page: page,
    size: '20',
    end_id: endId,
  });

  const response = await fetch(`${url}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!data || !data?.data) return null;

  return new ZZZGachaLogResp(data.data);
}

/**
 *
 * @param {string} authKey
 * @param {string} uid
 * @returns {Promise<{
 *  [x: string]: SingleGachaLog[];
 * }>}
 */
export async function updateGachaLog(authKey, uid) {
  let previousLog = getGachaLog(uid);
  if (!previousLog) {
    previousLog = {};
  }
  for (const name in gacha_type_meta_data) {
    if (!previousLog[name]) {
      previousLog[name] = [];
    }
    previousLog[name] = previousLog[name].map(
      i =>
        new SingleGachaLog(
          i.uid,
          i.gacha_id,
          i.gacha_type,
          i.item_id,
          i.count,
          i.time,
          i.name,
          i.lang,
          i.item_type,
          i.rank_type,
          i.id
        )
    );
    const lastSaved = previousLog[name]?.[0];
    let page = 1;
    let endId = '0';
    const newData = [];
    for (const type of gacha_type_meta_data[name]) {
      queryLabel: while (true) {
        const log = await getZZZGachaLogByAuthkey(
          authKey,
          type,
          type[0],
          page,
          endId
        );
        if (!log || !log?.list || log?.list?.length === 0) {
          break;
        }
        for (const item of log.list) {
          if (lastSaved && lastSaved.equals(item)) {
            break queryLabel;
          }
          newData.push(item);
        }
        endId = log.list[log.list.length - 1]?.id || endId;
        page++;
        await sleep(400);
      }
    }
    previousLog[name] = [...newData, ...previousLog[name]];
  }
  saveGachaLog(uid, previousLog);
  return previousLog;
}

const RANK_MAP = {
  4: 'S',
  3: 'A',
  2: 'B',
};
const HOMO_TAG = ['非到极致', '运气不好', '平稳保底', '小欧一把', '欧狗在此'];
const NORMAL_LIST = [
  '「11号」',
  '猫又',
  '莱卡恩',
  '丽娜',
  '格莉丝',
  '珂蕾妲',
  '拘缚者',
  '燃狱齿轮',
  '嵌合编译器',
  '钢铁肉垫',
  '硫磺石',
  '啜泣摇篮',
];

export async function anaylizeGachaLog(uid) {
  const savedData = getGachaLog(uid);
  if (!savedData) {
    return null;
  }
  const result = [];
  for (const name in savedData) {
    const data = savedData[name].map(
      item =>
        new SingleGachaLog(
          item.uid,
          item.gacha_id,
          item.gacha_type,
          item.item_id,
          item.count,
          item.time,
          item.name,
          item.lang,
          item.item_type,
          item.rank_type,
          item.id
        )
    );
    const earliest = data[data.length - 1];
    const latest = data[0];
    const list = [];
    let lastFive = null;
    let preIndex = 0;
    let luck = 0;
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
          list[list.length - 1]['totalCount'] = i - preIndex;
        }
        list.push({
          ...item,
          rank_type_label: RANK_MAP[item.rank_type],
          isUp: isUp,
          totalCount: '-',
        });
        preIndex = i;
      }
      if (i === data.length - 1 && list.length > 0) {
        list[list.length - 1]['totalCount'] = i - preIndex;
      }
      i++;
    }
    const upCount = list.length;
    const totalCount = data.length;
    const fiveStars = list.length;
    let timeRange = '还没有抽卡';
    let avgFive = '-';
    let avgUp = '-';
    if (data.length > 0) {
      timeRange = `${latest.time} ～ ${earliest.time}`;
      if (fiveStars > 0)
        avgFive = ((totalCount - lastFive) / fiveStars).toFixed(1);
      if (upCount > 0) avgUp = ((totalCount - lastFive) / upCount).toFixed(1);
    }
    if (!lastFive && fiveStars === 0) {
      if (totalCount > 0) lastFive = totalCount;
      else lastFive = '-';
    }
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
    });
  }
  return result;
}
