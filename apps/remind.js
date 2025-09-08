import _ from 'lodash';
import settings from '../lib/settings.js';
import { rulePrefix } from '../lib/common.js';
import { ZZZPlugin } from '../lib/plugin.js';

const USER_CONFIGS_KEY = 'ZZZ:REMIND:USER_CONFIGS';

// 计算到指定等级为止的S评级数量
function getSRankCountUpTo(allFloorDetail, maxLevel) {
  const sSet = new Set(
    allFloorDetail.filter(f => f.rating === 'S').map(f => f.layer_index)
  );
  const minLevel = Math.min(...allFloorDetail.map(f => f.layer_index));
  let sRankCount = 0;
  for (let level = 1; level <= maxLevel; level++) {
    if (sSet.has(level) || level < minLevel) {
      sRankCount++;
    }
  }
  return sRankCount;
}

export class Remind extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Remind',
      dsc: '式舆防卫战/危局强袭战未完成提醒',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'remind', 70),
      rule: [
        {
          reg: `${rulePrefix}(开启|关闭)挑战提醒$`,
          fnc: 'setSubscribeEnable',
        },
        {
          reg: `${rulePrefix}(开启|启用|关闭|禁用)全局挑战提醒$`,
          fnc: 'setGlobalRemindEnable',
          permission: 'master',
        },
        {
          reg: `${rulePrefix}设置(全局)?式舆阈值\\s*(\\d+)`,
          fnc: 'setAbyssThreshold',
        },
        {
          reg: `${rulePrefix}设置(全局)?危局阈值\\s*(\\d+)`,
          fnc: 'setDeadlyThreshold',
        },
        {
          reg: `${rulePrefix}查询挑战状态$`,
          fnc: 'checkNow',
        },
        {
          reg: `${rulePrefix}设置个人提醒时间\\s*(每日\\d+时(?:(\\d+)分)?|每周.\\d+时(?:(\\d+)分)?)`,
          fnc: 'setMyRemindTime',
        },
        {
          reg: `${rulePrefix}个人提醒时间$`,
          fnc: 'viewMyRemindTime',
        },
        {
          reg: `${rulePrefix}(重置|删除|取消)个人提醒时间`,
          fnc: 'deleteMyRemindTime',
        },
        {
          reg: `${rulePrefix}设置全局提醒时间\\s*(每日\\d+时(?:(\\d+)分)?|每周.\\d+时(?:(\\d+)分)?)`,
          fnc: 'setGlobalRemindTime',
          permission: 'master',
        },
        {
          reg: `${rulePrefix}全局提醒时间$`,
          fnc: 'viewGlobalRemindTime',
        },
      ],
    });

    const globalRemindConfig = settings.getConfig('remind');
    if (globalRemindConfig.enable) {
      this.task = {
        name: 'ZZZ-Plugin式舆防卫战/危局强袭战提醒任务',
        cron: '0 */10 * * * ?',
        fnc: () => this.runTask(),
      };
    }
  }

  async getUserConfig(userId) {
    const userConfigJson = await redis.hGet(USER_CONFIGS_KEY, String(userId));
    return userConfigJson ? JSON.parse(userConfigJson) : null;
  }

  async setUserConfig(userId, config) {
    await redis.hSet(USER_CONFIGS_KEY, String(userId), JSON.stringify(config));
  }

  parseRemindTimeMessage(message) {
    const pattern = /提醒时间\s*(每日\d+时(?:(\d+)分)?|每周.\d+时(?:(\d+)分)?)/;
    const match = message.match(pattern);
    if (!match) return { remindTime: null, error: '时间格式错误' };
    const remindTime = match[1];
    const minute = Number(match[2]) || Number(match[3]) || 0;
    if (!(minute % 10 === 0 && minute >= 0 && minute < 60)) {
      return { remindTime: null, error: '分钟必须为整十分钟' };
    }
    return { remindTime, error: null };
  }

  isTimeMatch(remindTime, date) {
    if (!remindTime) return false;

    const currentDay = date.getDay(); // 0 = 周日, 1 = 周一, ..., 6 = 周六
    const currentHour = date.getHours();
    const currentMinute = date.getMinutes();

    if (remindTime.includes('每日')) {
      const match = remindTime.match(/每日(\d+)时(?:(\d+)分)?/);
      if (match) {
        const hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        return currentHour === hour && currentMinute === minute;
      }
    } else if (remindTime.includes('每周')) {
      const dayMap = { '日': 0, '天': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6 };
      const match = remindTime.match(/每周(.)(\d+)时(?:(\d+)分)?/);
      if (match) {
        const dayChar = match[1];
        const day = dayMap[dayChar];
        const hour = parseInt(match[2]);
        const minute = match[3] ? parseInt(match[3]) : 0;
        return currentDay === day && currentHour === hour && currentMinute === minute;
      }
    }
    return false;
  }

  checkEnableAndFriend() {
    if (!settings.getConfig('remind').enable) {
      this.reply('当前未启用防卫战/危局挑战提醒功能');
      return false;
    }
    if (!(this.e.bot ?? Bot).fl.get(this.e.user_id)) {
      this.reply('请添加好友后重试');
      return false;
    };
    return true;
  }

  async setSubscribeEnable() {
    if (!this.checkEnableAndFriend()) return;
    const enable = /开启挑战提醒$/.test(this.e.msg);
    const uid = await this.getUID();
    if (enable && !uid) {
      return this.reply('未绑定UID，请先绑定');
    }
    let userConfig = await this.getUserConfig(this.e.user_id);
    const defaultConfig = settings.getConfig('remind');
    if (!userConfig) {
      userConfig = {
        enable: false,
        abyssCheckLevel: defaultConfig.abyssCheckLevel,
        deadlyStars: defaultConfig.deadlyStars,
      };
    }
    if (userConfig.enable === enable) {
      return this.reply(enable ? '提醒已开启，请勿重复操作' : '提醒功能尚未开启');
    }
    userConfig.enable = enable;
    await this.setUserConfig(this.e.user_id, userConfig);
    await this.reply(`提醒功能已${enable ? '开启' : '关闭'}${enable ? `，将在${userConfig.remindTime || defaultConfig.globalRemindTime}对防卫战<${userConfig.abyssCheckLevel}层或危局<${userConfig.deadlyStars}星进行提醒` : ''}`);
  }

  async setGlobalRemindEnable() {
    if (!this.e.isMaster) {
      return this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }
    const enable = /(开启|启用)全局挑战提醒$/.test(this.e.msg);
    if (settings.getConfig('remind').enable === enable) {
      return this.reply(enable ? '全局防卫战/危局挑战提醒功能已启用，请勿重复操作' : '全局防卫战/危局挑战提醒功能已禁用，请勿重复操作');
    }
    settings.setSingleConfig('remind', 'enable', enable);
    await this.reply(`全局防卫战/危局挑战提醒功能已${enable ? '启用' : '禁用'}`);
  }

  async setAbyssThreshold() {
    const isGlobal = this.e.msg.includes('全局');
    if (isGlobal && !this.e.isMaster) {
      return this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }
    if (!isGlobal && !this.checkEnableAndFriend()) return;
    const match = this.e.msg.match(/设置(?:全局)?(?:式舆防卫战|式舆|深渊|防卫战|防卫)阈值\s*(\d+)/);
    if (!match) return;
    const threshold = Number(match[1]);

    if (threshold < 1 || threshold > 7) {
      return this.reply('防卫战阈值必须在1到7之间');
    }
    
    if (isGlobal) {
      settings.setSingleConfig('remind', 'abyssCheckLevel', threshold);
    } else {
      let userConfig = await this.getUserConfig(this.e.user_id);
      if (!userConfig) {
        const defaultConfig = settings.getConfig('remind');
        userConfig = {
          enable: false,
          abyssCheckLevel: defaultConfig.abyssCheckLevel,
          deadlyStars: defaultConfig.deadlyStars,
        };
      }
      userConfig.abyssCheckLevel = threshold;
      await this.setUserConfig(this.e.user_id, userConfig);
    };

    await this.reply(`${isGlobal ? '全局默认' : ''}式舆防卫战阈值已设为: <${threshold}层时提醒`);
  }

  async setDeadlyThreshold() {
    const isGlobal = this.e.msg.includes('全局');
    if (isGlobal && !this.e.isMaster) {
      return this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }
    if (!isGlobal && !this.checkEnableAndFriend()) return;
    const match = this.e.msg.match(/设置(?:全局)?(?:危局强袭战|危局|强袭|强袭战)阈值\s*(\d+)/);
    if (!match) return;
    const threshold = Number(match[1]);

    if (threshold < 1 || threshold > 9) {
      return this.reply('危局阈值必须在1到9之间');
    }

    if (isGlobal) {
      settings.setSingleConfig('remind', 'deadlyStars', threshold);
    } else {
      let userConfig = await this.getUserConfig(this.e.user_id);
      if (!userConfig) {
        const defaultConfig = settings.getConfig('remind');
        userConfig = {
          enable: false,
          abyssCheckLevel: defaultConfig.abyssCheckLevel,
          deadlyStars: defaultConfig.deadlyStars,
        };
      }

      userConfig.deadlyStars = threshold;
      await this.setUserConfig(this.e.user_id, userConfig);
    }
    await this.reply(`${isGlobal ? '全局默认' : ''}危局强袭战阈值已设为: <${threshold}星时提醒`);
  }

  async checkNow() {
    const uid = await this.getUID();
    if (!uid) return false;

    const targetUserId = this.e.user_id;
    let userConfig = await this.getUserConfig(targetUserId);
    if (!userConfig) {
      // 如果没有配置，使用默认配置
      const defaultConfig = settings.getConfig('remind');
      userConfig = {
        enable: false, // 不开启提醒，仅用于查询
        abyssCheckLevel: defaultConfig.abyssCheckLevel,
        deadlyStars: defaultConfig.deadlyStars,
      };
    }
    await this.reply('正在查询，请稍候...');
    const messages = await this.checkUser(targetUserId, userConfig, true); // 主动查询，显示所有状态
    if (messages.length > 0) {
      await this.reply(messages.join('\n'));
    } else {
      await this.reply('查询失败，请稍后再试');
    }
  }

  async checkUser(userId, userConfig, showAll = false, contextE = null) {
    let messages = [];

    const originalE = this.e;
    this.e = contextE || this.e;

    let api, deviceFp;
    try {
      // 获取 API 和玩家信息
      ({ api, deviceFp } = await this.getAPI());
      await this.getPlayerInfo(this.e);
    } catch (error) {
      logger.error(`[ZZZ-Plugin] 为用户 ${userId} 获取API或玩家信息失败: ${error}`);
      messages.push('查询失败，请稍后再试');
      // 恢复原来的 this.e
      this.e = originalE;
      return messages;
    }

    const defaultConfig = settings.getConfig('remind');
    // 检查式舆防卫战
    try {
      const abyssRawData = await api.getFinalData('zzzChallenge', { deviceFp });
      if (!abyssRawData || !abyssRawData.has_data) {
        messages.push('式舆防卫战S评级: 0/7');
      } else {
        const abyssCheckLevel = userConfig.abyssCheckLevel ?? defaultConfig.abyssCheckLevel;
        const sCount = getSRankCountUpTo(abyssRawData.all_floor_detail, 7);
        const status = sCount >= abyssCheckLevel ? ' ✓' : '';
        if (showAll || sCount < abyssCheckLevel) {
          messages.push(`式舆防卫战S评级: ${sCount}/7${status}`);
        }
      }
    } catch (error) {
      logger.error(`[ZZZ-Plugin] 为用户 ${userId} 检查式舆防卫战失败: ${error}`);
      messages.push(`式舆防卫战查询失败: ${error}`);
    }

    // 检查危局强袭战
    try {
      const deadlyRawData = await api.getFinalData('zzzDeadly', { deviceFp });
      if (!deadlyRawData || !deadlyRawData.has_data) {
        messages.push('危局强袭战星星: 0/9');
      } else {
        const deadlyStars = userConfig.deadlyStars ?? defaultConfig.deadlyStars;
        const totalStar = deadlyRawData.total_star || 0;
        const status = totalStar >= deadlyStars ? ' ✓' : '';
        if (showAll || totalStar < deadlyStars) {
          messages.push(`危局强袭战星星: ${totalStar}/9${status}`);
        }
      }
    } catch (error) {
      logger.error(`[ZZZ-Plugin] 为用户 ${userId} 检查危局强袭战失败: ${error}`);
      messages.push(`危局强袭战查询失败: ${error}`);
    }

    // 恢复原来的 this.e
    this.e = originalE;
    return messages;
  }

  async runTask() {
    const globalRemindConfig = settings.getConfig('remind');
    if (!globalRemindConfig.enable) {
      return;
    }
    logger.info('[ZZZ-Plugin] 开始执行式舆防卫战/危局强袭战提醒任务');

    const allUserConfigs = await redis.hGetAll(USER_CONFIGS_KEY);
    const now = new Date();
    const globalRemindTime = globalRemindConfig.globalRemindTime || '每日20时';

    for (const userId in allUserConfigs) {
      const userConfig = JSON.parse(allUserConfigs[userId]);
      if (!userConfig.enable) continue;
      if (!Bot.fl.get(userId)) continue;

      const remindTime = userConfig.remindTime || globalRemindTime;

      if (this.isTimeMatch(remindTime, now)) {
        // 创建一个模拟的 e 对象，用于获取 API
        const mockE = {
          user_id: userId,
          game: 'zzz',
          reply: (msg) => logger.info(`[Remind Mock Reply] ${msg}`)
        };

        const messages = await this.checkUser(userId, userConfig, false, mockE);
        if (messages.length > 0) {
          await Bot.pickFriend(userId).sendMsg('【式舆/危局挑战提醒】\n' + messages.join('\n')).catch(err => {
            logger.error(`[ZZZ-Plugin] 式舆/危局挑战推送用户 ${userId} 失败`, err);
          });
        }
      }
    }
    logger.info('[ZZZ-Plugin] 式舆防卫战/危局强袭战提醒任务执行完毕');
  }

  async setMyRemindTime() {
    if (!this.checkEnableAndFriend()) return;
    const { remindTime, error } = this.parseRemindTimeMessage(this.e.msg);
    if (!remindTime) return await this.reply(error);

    let userConfig = await this.getUserConfig(this.e.user_id);
    if (!userConfig) {
      const defaultConfig = settings.getConfig('remind');
      userConfig = {
        enable: false,
        abyssCheckLevel: defaultConfig.abyssCheckLevel,
        deadlyStars: defaultConfig.deadlyStars,
      };
    }

    userConfig.remindTime = remindTime;
    await this.setUserConfig(this.e.user_id, userConfig);
    await this.reply(`您的个人提醒时间已设置为: ${remindTime}`);
  }

  async viewMyRemindTime() {
    const userConfig = await this.getUserConfig(this.e.user_id);
    if (userConfig && userConfig.remindTime) {
      await this.reply(`当前个人提醒时间: ${userConfig.remindTime}`);
    } else {
      const remindConfig = settings.getConfig('remind');
      const globalRemindTime = remindConfig.globalRemindTime || '每日20时';
      await this.reply(`个人提醒时间未设置，默认使用全局时间: ${globalRemindTime}`);
    }
  }

  async deleteMyRemindTime() {
    if (!this.checkEnableAndFriend()) return;
    let userConfig = await this.getUserConfig(this.e.user_id);
    if (userConfig && userConfig.remindTime) {
      delete userConfig.remindTime;
      await this.setUserConfig(this.e.user_id, userConfig);
      await this.reply('个人提醒时间已重置为全局默认时间');
    } else {
      await this.reply('个人提醒时间尚未设置');
    }
  }

  async setGlobalRemindTime() {
    if (!this.e.isMaster) {
      return this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }

    const { remindTime: globalRemindTime, error } = this.parseRemindTimeMessage(this.e.msg);
    if (!globalRemindTime) return await this.reply(error);
    settings.setSingleConfig('remind', 'globalRemindTime', globalRemindTime);
    await this.reply(`全局提醒时间已更新为: ${globalRemindTime}`);
  }

  async viewGlobalRemindTime() {
    const globalRemindTime = settings.getConfig('remind').globalRemindTime || '每日20时';
    await this.reply(`当前全局提醒时间: ${globalRemindTime}`);
  }
}