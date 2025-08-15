import _ from 'lodash';
import settings from '../lib/settings.js';
import { rulePrefix } from '../lib/common.js';
import { Deadly } from '../model/deadly.js';
import { ZZZChallenge } from '../model/abyss.js';
import { ZZZPlugin } from '../lib/plugin.js';

const USER_CONFIGS_KEY = 'ZZZ:REMIND:USER_CONFIGS';

export class Remind extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Remind',
      dsc: '式舆防卫战/危局强袭战未完成提醒',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'remind', 70),
      rule: [
        {
          reg: `${rulePrefix}开启挑战提醒$`,
          fnc: 'subscribe',
        },
        {
          reg: `${rulePrefix}关闭挑战提醒$`,
          fnc: 'unsubscribe',
        },
        {
          reg: `${rulePrefix}设置式舆阈值\\s*(\\d+)`,
          fnc: 'setMyAbyssThreshold',
        },
        {
          reg: `${rulePrefix}设置危局阈值\\s*(\\d+)`,
          fnc: 'setMyDeadlyThreshold',
        },
        {
          reg: `${rulePrefix}查询挑战状态$`,
          fnc: 'checkNow',
        },
        {
          reg: `${rulePrefix}设置个人提醒时间\\s*(每日\\d+时|每周.\\d+时)`,
          fnc: 'setMyRemindTime',
        },
        {
          reg: `${rulePrefix}个人提醒时间$`,
          fnc: 'viewMyRemindTime',
        },
        {
          reg: `${rulePrefix}取消个人提醒时间`,
          fnc: 'deleteMyRemindTime',
        },
      ],
    });

    const globalRemindConfig = settings.getConfig('remind');
    if (globalRemindConfig.enable) {
      this.task = {
        name: 'ZZZ-Plugin式舆防卫战/危局强袭战提醒任务',
        cron: '0 * * * *', // 每小时的第0分钟执行
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

  isTimeMatch(remindTime, date) {
    if (!remindTime) return false;

    const currentHour = date.getHours();
    const currentDay = date.getDay(); // 0 = 周日, 1 = 周一, ..., 6 = 周六

    if (remindTime.includes('每日')) {
      const match = remindTime.match(/每日(\d+)时/);
      if (match) {
        const hour = parseInt(match, 10);
        return currentHour === hour;
      }
    } else if (remindTime.includes('每周')) {
      const dayMap = { '日': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6 };
      const match = remindTime.match(/每周(.)(\d+)时/);
      if (match) {
        const dayChar = match;
        const hour = parseInt(match, 10);
        const day = dayMap[dayChar];
        return currentDay === day && currentHour === hour;
      }
    }
    return false;
  }

  async subscribe() {
    const uid = await this.getUID();
    if (!uid) {
      await this.reply('未绑定UID，请先绑定');
      return false;
    }

    let userConfig = await this.getUserConfig(this.e.user_id);

    if (userConfig && userConfig.enable) {
      await this.reply('提醒已开启，请勿重复操作');
      return false;
    }

    if (userConfig) {
      userConfig.enable = true;
    } else {
      const defaultConfig = settings.getConfig('remind');
      userConfig = {
        enable: true,
        abyssCheckLevel: defaultConfig.abyssCheckLevel,
        deadlyStars: defaultConfig.deadlyStars,
      };
    }

    await this.setUserConfig(this.e.user_id, userConfig);
    await this.reply('提醒功能已开启');
  }

  async unsubscribe() {
    let userConfig = await this.getUserConfig(this.e.user_id);
    if (!userConfig || !userConfig.enable) {
      await this.reply('提醒功能尚未开启');
      return false;
    }

    userConfig.enable = false;
    await this.setUserConfig(this.e.user_id, userConfig);
    await this.reply('提醒功能已关闭');
  }

  async setMyAbyssThreshold() {
    const match = this.e.msg.match(/设置式舆阈值\s*(\d+)/);
    if (!match) return;
    const threshold = Number(match[1]);

    if (threshold < 1 || threshold > 7) {
      await this.reply('阈值必须在1到7之间');
      return false;
    }

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
    await this.reply(`式舆防卫战提醒阈值已设为: 检查前 ${threshold} 层`);
  }

  async setMyDeadlyThreshold() {
    const match = this.e.msg.match(/设置危局阈值\s*(\d+)/);
    if (!match) return;
    const threshold = Number(match[1]);

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
    await this.reply(`危局强袭战星星阈值已设为: ${threshold}`);
  }

  async checkNow() {
    const userConfig = await this.getUserConfig(this.e.user_id);
    if (!userConfig) {
      await this.reply('尚未设置任何提醒，请先设置阈值');
      return false;
    }
    await this.reply('正在查询，请稍候...');
    const messages = await this.checkUser(this.e.user_id, userConfig, true); // 主动查询，显示所有状态
    if (messages.length > 0) {
      await this.reply(messages.join('\n'));
    } else {
      await this.reply('查询失败，请稍后再试');
    }
  }

  async checkUser(userId, userConfig, showAll = false) {
    let messages = [];

    // 创建一个模拟的 e 对象，用于获取 API
    const mockE = {
      user_id: userId,
      game: 'zzz',
      reply: (msg) => logger.info(`[Remind Mock Reply] ${msg}`)
    };

    // 临时设置 this.e 用于调用父类方法
    const originalE = this.e;
    this.e = mockE;

    try {
      const { api, deviceFp } = await this.getAPI();
      await this.getPlayerInfo(mockE);

      // 检查式舆防卫战
      const abyssRawData = await api.getFinalData('zzzChallenge', { deviceFp }).catch(() => ({}));
      if (!abyssRawData.has_data) {
        messages.push(`式舆防卫战S评级: 0/7`);
      } else {
        const abyssData = new ZZZChallenge(abyssRawData);
        const userThreshold = userConfig.abyssCheckLevel || 7;
        if (showAll || !abyssData.areAllSUpTo(userThreshold)) {
          const sCount = abyssData.getSRankCountUpTo(7);
          const status = abyssData.areAllSUpTo(userThreshold) ? ' ✓' : '';
          messages.push(`式舆防卫战S评级: ${sCount}/7${status}`);
        }
      }

      // 检查危局强袭战
      const deadlyRawData = await api.getFinalData('zzzDeadly', { deviceFp }).catch(() => ({}));
      if (!deadlyRawData.has_data) {
        messages.push(`危局强袭战星星: 0/9`);
      } else {
        const deadlyData = new Deadly(deadlyRawData);
        if (showAll || deadlyData.total_star < userConfig.deadlyStars) {
          const status = deadlyData.total_star >= userConfig.deadlyStars ? ' ✓' : '';
          messages.push(`危局强袭战星星: ${deadlyData.total_star}/9${status}`);
        }
      }
    } catch (error) {
      logger.error(`[ZZZ-Plugin] 为用户 ${userId} 执行检查失败: ${error}`);
      messages.push('查询失败，请稍后再试');
    } finally {
      // 恢复原来的 this.e
      this.e = originalE;
    }
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

      const remindTime = userConfig.remindTime || globalRemindTime;

      if (this.isTimeMatch(remindTime, now)) {
        const messages = await this.checkUser(userId, userConfig);
        if (messages.length > 0) {
          const user = Bot.pickUser(userId);
          await user.sendMsg(messages.join('\n'));
        }
      }
    }
    logger.info('[ZZZ-Plugin] 式舆防卫战/危局强袭战提醒任务执行完毕');
  }

  async setMyRemindTime() {
    const match = this.e.msg.match(/设置个人提醒时间\s*(每日\d+时|每周.\d+时)/);
    if (!match) return;
    const remindTime = match[1];

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
      await this.reply(`当前提醒时间: ${userConfig.remindTime}`);
    } else {
      const globalRemindTime = settings.getConfig('remind.globalRemindTime') || '每日20时';
      await this.reply(`个人提醒时间未设置，默认使用全局时间: ${globalRemindTime}`);
    }
  }

  async deleteMyRemindTime() {
    let userConfig = await this.getUserConfig(this.e.user_id);
    if (userConfig && userConfig.remindTime) {
      delete userConfig.remindTime;
      await this.setUserConfig(this.e.user_id, userConfig);
      await this.reply('个人提醒时间已取消');
    } else {
      await this.reply('个人提醒时间尚未设置');
    }
  }
}