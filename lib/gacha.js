import { SingleGachaLog, ZZZGachaLogResp } from '../model/gacha.js';
import { sleep } from '../utils/time.js';
import { rank } from './convert.js';
import { getGachaLog, saveGachaLog } from './db.js';
import { ZZZ_GET_GACHA_LOG_API } from './mysapi/api.js';
import { fetchWithRetry } from '../utils/network.js';

// 池子代码
export const gacha_type_meta_data = {
  音擎频段: ['3001'],
  独家频段: ['2001'],
  常驻频段: ['1001'],
  邦布频段: ['5001'],
};

// 欧非阈值
const FLOORS_MAP = {
  邦布频段: [50, 70],
  音擎频段: [50, 70],
  独家频段: [60, 80],
  常驻频段: [60, 80],
};

// 欧非标签
const HOMO_TAG = ['非到极致', '运气不好', '平稳保底', '小欧一把', '欧狗在此'];

// 欧非表情
const EMOJI = [
  [4, 8, 13],
  [1, 10, 5],
  [16, 15, 2],
  [12, 3, 9],
  [6, 14, 7],
];

// 常驻名称
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

/**
 * 获取抽卡链接
 * @param {string} authKey 米游社认证密钥
 * @param {string} gachaType 祈愿类型（池子代码）
 * @param {string} initLogGachaBaseType
 * @param {number} page 页数
 * @param {string} endId 最后一个数据的 id
 * @param {string} size 页面数据大小
 * @returns {Promise<string>} 抽卡链接
 */
export const getZZZGachaLink = async (
  authKey,
  gachaType = '2001',
  initLogGachaBaseType = '2',
  page = 1,
  endId = '0',
  size = '20'
) => {
  // 暂时直接写死服务器为国服
  const serverId = 'prod_gf_cn';
  const url = ZZZ_GET_GACHA_LOG_API;
  const timestamp = Math.floor(Date.now() / 1000);
  // 请求参数
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
    size: size,
    end_id: endId,
  });
  // 完整链接
  return `${url}?${params}`;
};

/**
 * 通过米游社认证密钥获取抽卡记录
 * @param {string} authKey 米游社认证密钥
 * @param {string} gachaType 祈愿类型（池子代码）
 * @param {string} initLogGachaBaseType
 * @param {number} page 页数
 * @param {string} endId 最后一个数据的 id
 * @returns {Promise<ZZZGachaLogResp>} 抽卡记录
 */
export const getZZZGachaLogByAuthkey = async (
  authKey,
  gachaType = '2001',
  initLogGachaBaseType = '2',
  page = 1,
  endId = '0'
) => {
  // 获取抽卡链接
  const link = await getZZZGachaLink(
    authKey,
    gachaType,
    initLogGachaBaseType,
    page,
    endId
  );
  // 发送请求
  const response = await fetchWithRetry(link, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  // 获取数据
  const data = await response.json();
  if (!data || !data?.data) return null;

  return new ZZZGachaLogResp(data.data);
};

/**
 * 更新抽卡数据
 * @param {string} authKey 米游社认证密钥
 * @param {string} uid ZZZUID
 * @returns {Promise<{
 *  data: {
 *   [x: string]: SingleGachaLog[];
 *  },
 *  count: {
 *   [x: string]: number;
 *  }
 * }>} 更新后的抽卡数据
 */
export const updateGachaLog = async (authKey, uid) => {
  // 获取之前的抽卡数据
  let previousLog = getGachaLog(uid);
  if (!previousLog) {
    // 如果没有数据，初始化为空对象
    previousLog = {};
  }
  // 新的抽卡数据
  let newCount = {};
  // 遍历所有池子
  for (const name in gacha_type_meta_data) {
    if (!previousLog[name]) {
      // 如果没有数据，初始化为空数组
      previousLog[name] = [];
    }
    // 初始化新数据计数(当前池子)
    newCount[name] = 0;
    // 转换为 SingleGachaLog 对象
    previousLog[name] = previousLog[name].map(i => new SingleGachaLog(i));
    // 获取上一次保存的数据
    const lastSaved = previousLog[name]?.[0];
    // 初始化页数和最后一个数据的 id
    let page = 1;
    let endId = '0';
    // 新数据
    const newData = [];
    // 遍历当前池子的所有类型
    for (const type of gacha_type_meta_data[name]) {
      // 循环获取数据
      queryLabel: while (true) {
        // 获取抽卡记录
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
        // 遍历数据 (从最新的开始)
        for (const item of log.list) {
          if (lastSaved && lastSaved.equals(item)) {
            // 如果数据相同，说明已经获取完毕
            break queryLabel;
          }
          // 添加到新数据中
          newData.push(item);
          // 当前池子新数据计数加一
          newCount[name]++;
        }
        // 更新页数和最后一个数据的 id
        endId = log.list[log.list.length - 1]?.id || endId;
        page++;
        // 防止请求过快
        await sleep(1000);
      }
    }
    // 合并新数据和之前的数据
    previousLog[name] = [...newData, ...previousLog[name]];
  }
  // 保存数据到文件
  saveGachaLog(uid, previousLog);
  // 返回数据
  return {
    data: previousLog,
    count: newCount,
  };
};

/**
 * 欧非分析
 * @param {number} ast
 * @param {number[]} lst
 */
const getLevelFromList = (ast, lst) => {
  if (ast === 0) {
    return 2;
  }

  let level = 0;
  for (let numIndex = 0; numIndex < lst.length; numIndex++) {
    if (ast <= lst[numIndex]) {
      level = 4 - numIndex;
      break;
    }
  }
  return level;
};

/**
 * 抽卡分析
 * @param {string} uid  ZZZUID
 * @returns {Promise<{
 *  name: string;
 *  timeRange: string;
 *  list: SingleGachaLog[];
 *  lastFive: number | string;
 *  fiveStars: number;
 *  upCount: number;
 *  totalCount: number;
 *  avgFive: string;
 *  avgUp: string;
 *  level: number;
 *  tag: string;
 *  emoji: number;
 * }[]>} 分析结果
 */
export const anaylizeGachaLog = async uid => {
  // 读取已保存的数据
  const savedData = getGachaLog(uid);
  if (!savedData) {
    return null;
  }
  // 初始化结果
  const result = [];
  // 遍历所有池子
  for (const name in savedData) {
    // 转换为 SingleGachaLog 对象
    const data = savedData[name].map(item => new SingleGachaLog(item));
    // 获取最早和最晚的数据
    const earliest = data[data.length - 1];
    const latest = data[0];
    // 初始化五星列表
    const list = [];
    // 初始化最后五星位置
    let lastFive = null;
    // 初始化前一个索引
    let preIndex = 0;
    // 遍历数据
    let i = 0;
    for (const item of data) {
      // 是否为UP
      let isUp = true;
      // 如果是五星
      if (item.rank_type === '4') {
        // 下载图片资源
        await item.get_assets();
        // 判断是否为常驻
        if (NORMAL_LIST.includes(item.name)) {
          isUp = false;
        }
        // 如果是第一个五星
        if (lastFive === null) {
          // 记录位置
          lastFive = i;
        }
        // 如果不是第一个五星
        if (list.length > 0) {
          // 计算前一个五星到当前五星的次数（即前一个五星出卡所用的抽数）
          list[list.length - 1]['totalCount'] = i - preIndex;
          // 根据次数设置颜色
          if (i - preIndex <= FLOORS_MAP[name][0]) {
            list[list.length - 1]['color'] = 'rgb(63, 255, 0)';
          } else if (i - preIndex >= FLOORS_MAP[name][1]) {
            list[list.length - 1]['color'] = 'rgb(255, 20, 20)';
          }
        }
        // 添加到列表中
        list.push({
          ...item,
          rank_type_label: rank.getRankChar(item.rank_type),
          isUp: isUp,
          totalCount: '-',
          color: 'white',
        });
        preIndex = i;
      }
      // 如果是最后一个数据
      if (i === data.length - 1 && list.length > 0) {
        // 计算前一个五星到当前五星的次数（即前一个五星出卡所用的抽数）
        list[list.length - 1]['totalCount'] = i - preIndex + 1;
        // 根据次数设置颜色
        if (i - preIndex + 1 <= FLOORS_MAP[name][0]) {
          list[list.length - 1]['color'] = 'rgb(63, 255, 0)';
        } else if (i - preIndex + 1 >= FLOORS_MAP[name][1]) {
          list[list.length - 1]['color'] = 'rgb(255, 20, 20)';
        }
      }
      i++;
    }
    // 计算五星数量和UP数量
    const upCount = list.filter(i => i.isUp).length;
    // 计算总次数
    const totalCount = data.length;
    // 计算五星数量
    const fiveStars = list.length;
    // 初始化时间范围
    let timeRange = '还没有抽卡';
    // 初始化平均五星次数
    let avgFive = '-';
    // 初始化平均UP次数
    let avgUp = '-';
    // 初始化欧非等级
    let level = 2;
    // 如果有数据
    if (data.length > 0) {
      // 设置时间范围
      timeRange = `${latest.time} ～ ${earliest.time}`;
      // 计算平均五星次数
      if (fiveStars > 0)
        avgFive = ((totalCount - lastFive) / fiveStars).toFixed(1);
      // 计算平均UP次数
      if (upCount > 0) avgUp = ((totalCount - lastFive) / upCount).toFixed(1);
    }
    // 如果没有最后五星
    if (!lastFive && fiveStars === 0) {
      // 设置最后五星为 '-'
      if (totalCount > 0) lastFive = totalCount;
      else lastFive = '-';
    }
    // 根据不同池子计算欧非等级
    if (avgUp !== '-') {
      if ('音擎频段' === name) {
        level = getLevelFromList(avgUp, [62, 75, 88, 99, 111]);
      } else if ('邦布频段' === name) {
        level = getLevelFromList(avgUp, [51, 55, 61, 68, 70]);
      } else if ('独家频段' === name) {
        level = getLevelFromList(avgUp, [74, 87, 99, 105, 120]);
      }
    }
    if (avgFive !== '-') {
      if ('常驻频段' === name) {
        level = getLevelFromList(avgFive, [53, 60, 68, 73, 75]);
      }
    }
    // 设置欧非标签
    const tag = HOMO_TAG[level];
    // 设置欧非表情
    const emojis = EMOJI[level];
    // 随机选取一个
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    // 写入数据
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
      level,
      tag,
      emoji,
    });
  }
  return result;
};
