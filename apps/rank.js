import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { ZZZChallenge } from '../model/abyss.js';
import { Deadly } from '../model/deadly.js';
import { rulePrefix } from '../lib/common.js';
import { getAllAbyssData, getAllDeadlyData, removeAbyssData, removeDeadlyData, removeAllAbyssData, removeAllDeadlyData } from '../lib/db.js';
import { DEFAULT_RANK_ALLOWED, isGroupRankAllowed } from '../lib/rank.js'

export class Rank extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]rank',
      dsc: 'zzz排名',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'rank', 70),
      rule: [
        {
          reg: `${rulePrefix}(式舆防卫战|式舆|深渊|防卫战|防卫)(上半|下半|1|2)?排名$`,
          fnc: 'abyssRank',
        },
        {
          reg: `${rulePrefix}(危局强袭战|危局|强袭|强袭战)排名$`,
          fnc: 'deadlyRank',
        },
        {
          reg: `${rulePrefix}(显示|展示|开启|打开|on|启用|启动|隐藏|取消显示|关闭|关掉|off|禁用|停止)(式舆防卫战|式舆|深渊|防卫战|防卫|危局强袭战|危局|强袭|强袭战)排名$`,
          fnc: 'switchRank',
        },
        {
          reg: `${rulePrefix}(重置|清空)(式舆防卫战|式舆|深渊|防卫战|防卫)排名$`,
          fnc: 'resetRank',
        }
      ],
    });
    this.isGroupRankAllowed = isGroupRankAllowed;
  }
  async abyssRank() {
    if (!(this.isGroupRankAllowed())) {
      await this.reply('当前群深渊排名功能已关闭！')
    }
    // 加载所有 JSON
    let rawData = getAllAbyssData();
    // 筛选
    // 获取当前时间的 UNIX 时间戳（秒）
    const currentTimestamp = Math.floor(Date.now() / 1000);

    let scoredData = _.chain(rawData)
      .filter(async item => {
        const gameUid = _.get(item, 'player.player.game_uid');
        const rankPermission = (await redis.get(`ZZZ:RANK_PERMISSION:${gameUid}`)) ?? DEFAULT_RANK_ALLOWED;
        return /^[0-9]{8}$/.test(gameUid) && rankPermission;
      })
      .filter(item => {
        const beginTime = _.get(item, 'result.begin_time');
        const endTime = _.get(item, 'result.end_time');
        return currentTimestamp >= beginTime && currentTimestamp <= endTime;
      })
      .filter(item => _.get(item, 'result.has_data') === true)
      .map(item => {
        const detail = _.get(item, 'result.all_floor_detail[0]', {});
        const node1Time = _.get(detail, 'node_1.battle_time', 6000);
        const node2Time = _.get(detail, 'node_2.battle_time', 6000);
        const layerIndex = _.get(detail, 'layer_index', 0);
        
        const score = -100000 * layerIndex + node1Time + node2Time;
        
        return {
          ...item,
          result: new ZZZChallenge(item.result),
          score: score
        };
      })
      .value();
    
    scoredData = _.sortBy(scoredData, 'score');  // 默认升序
    // 读取配置中的最大显示数量
    const maxDisplay = _.get(settings.getConfig('rank'), 'max_display', 15);
    // 取前maxDisplay个数据
    scoredData = scoredData.slice(0, maxDisplay);
    const timer = setTimeout(() => {
      if (this?.reply) {
        this.reply('查询成功，正在下载图片资源，请稍候。');
      }
    }, 5000);
    await Promise.all(_.map(scoredData, async (item) => {
        await item.result.get_assets();
    }));
    // 清除定时器
    clearTimeout(timer);
    const finalData = {
      scoredData
    }
    await this.render('rank/abyss/index.html', finalData, this);
  }

  async deadlyRank() {
    if (!(this.isGroupRankAllowed())) {
      await this.reply('当前群危局强袭战排名功能已关闭！')
    }
    // 加载所有 JSON
    let rawData = getAllDeadlyData();
    // 筛选
    // 获取当前时间的 UNIX 时间戳（秒）
    const currentTimestamp = Math.floor(Date.now() / 1000);

    let scoredData = _.chain(rawData)
      .filter(async item => {
        const gameUid = _.get(item, 'player.player.game_uid');
        const rankPermission = (await redis.get(`ZZZ:RANK_PERMISSION:${gameUid}`)) ?? DEFAULT_RANK_ALLOWED;
        return /^[0-9]{8}$/.test(gameUid) && rankPermission;
      })
      .filter(item => {
        // 危局强袭战的数据结构中时间字段是对象格式，需要转换为时间戳
        const startTime = new Date(
          item.result.start_time.year,
          item.result.start_time.month - 1,
          item.result.start_time.day,
          item.result.start_time.hour,
          item.result.start_time.minute,
          item.result.start_time.second
        ).getTime() / 1000;
        const endTime = new Date(
          item.result.end_time.year,
          item.result.end_time.month - 1,
          item.result.end_time.day,
          item.result.end_time.hour,
          item.result.end_time.minute,
          item.result.end_time.second
        ).getTime() / 1000;
        return currentTimestamp >= startTime && currentTimestamp <= endTime;
      })
      .filter(item => _.get(item, 'result.has_data') === true)
      .map(item => {
        // 危局强袭战的排名依据是总分
        const totalScore = _.get(item, 'result.total_score', 0);
        const totalStar = _.get(item, 'result.total_star', 0);
        
        return {
          ...item,
          result: new Deadly(item.result),
          score: 1000000 * totalStar + totalScore // (星级, 得分) 的字典序
        };
      })
      .value();
    
    scoredData = _.sortBy(scoredData, 'score').reverse();  // 降序排序，分数越高排名越前
    // 读取配置中的最大显示数量
    const maxDisplay = _.get(settings.getConfig('rank'), 'max_display', 15);
    // 取前maxDisplay个数据
    scoredData = scoredData.slice(0, maxDisplay);
    const timer = setTimeout(() => {
      if (this?.reply) {
        this.reply('查询成功，正在下载图片资源，请稍候。');
      }
    }, 5000);
    await Promise.all(_.map(scoredData, async (item) => {
        await item.result.get_assets();
    }));
    // 清除定时器
    clearTimeout(timer);
    const finalData = {
      scoredData
    }
    await this.render('rank/deadly/index.html', finalData, this);
  }

  async switchRank() {
    const uid = await this.getUID();
    if (!uid) {
      return this.reply('未绑定UID，请先绑定');
    }
    // 使用正则判断是否包含"显示"
    const enableRegex = /显示|展示|开启|打开|on|启用|启动/i;
    const disableRegex = /隐藏|取消显示|关闭|关掉|off|禁用|停止/i;
    
    let isEnable;
    
    if (enableRegex.test(this.e.msg)) {
      isEnable = true;
    } else if (disableRegex.test(this.e.msg)) {
      isEnable = false;
    } else {
      // 如果都不匹配，默认使用显示/隐藏的逻辑（根据是否有"显示"）
      // 或者返回错误提示
      return this.reply('请输入"显示"或"隐藏"来设置是否显示个人的深渊排名', false, { at: true, recallMsg: 100 });
    }
    await redis.set(`ZZZ:RANK_PERMISSION:${uid}`, isEnable)
    const enableString = isEnable ? '显示' : '隐藏';
    await this.e.reply(
      `绝区零个人深渊排名功能已设置为: ${enableString}`,
      false,
      { at: true, recallMsg: 100 }
    );
    
  }

  async resetRank() {
    if (this.e?.isMaster) {
      removeAllAbyssData();
      removeAllDeadlyData();
      return this.reply('清除深渊排名成功！', false, { at: true, recallMsg: 100 });
    } else {
      return this.reply('仅限主人操作', false, { at: true, recallMsg: 100 });
    }
  }
}
