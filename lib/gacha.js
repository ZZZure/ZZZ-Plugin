import { SingleGachaLog } from '../model/gacha.js';
import { sleep } from '../utils/time.js';
import { rank } from './convert.js';
import { getGachaLog, saveGachaLog } from './db.js';
import {
  gacha_type_meta_data,
  FLOORS_MAP,
  HOMO_TAG,
  EMOJI,
  NORMAL_LIST,
} from './gacha/const.js';
import { getLevelFromList } from './gacha/tool.js';
import { getZZZGachaLogByAuthkey } from './gacha/core.js';

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
