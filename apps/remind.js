import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { rulePrefix } from '../lib/common.js';
import { ZZZChallenge } from '../model/abyss.js';
import { Deadly } from '../model/deadly.js';

const USER_CONFIGS_KEY = 'ZZZ:REMIND:USER_CONFIGS';

export class Remind extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Remind',
      dsc: '式舆防卫战/危局强袭战未完成提醒',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'remind', 80),
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
      ],
    });

    this.task = {
      name: 'ZZZ-Plugin式舆防卫战/危局强袭战提醒任务',
      cron: this.getCron(),
      fnc: () => this.runTask(),
    };
  }

  getCron() {
    const remindConfig = settings.getConfig('remind');
    return _.get(remindConfig, 'cron', '0 30 20 * * ? *');
  }

  async getUserConfig(userId) {
    const userConfigJson = await redis.hGet(USER_CONFIGS_KEY, String(userId));
    return userConfigJson ? JSON.parse(userConfigJson) : null;
  }

  async setUserConfig(userId, config) {
    await redis.hSet(USER_CONFIGS_KEY, String(userId), JSON.stringify(config));
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
   const threshold = Number(match);

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
    const threshold = Number(match);

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
    try {
      const user = this.e.bot.pickUser(userId);
      const tempE = { ...this.e, user_id: userId, reply: (msg) => user.sendMsg(msg) };

      const { api, deviceFp } = await this.getAPI(tempE);
      await this.getPlayerInfo(tempE);

      // 检查式舆防卫战
     const abyssRawData = await api
       .getFinalData('zzzChallenge', { deviceFp })
       .catch(() => ({}));
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

    for (const userId in allUserConfigs) {
      const userConfig = JSON.parse(allUserConfigs[userId]);
      if (!userConfig.enable) continue;

      const messages = await this.checkUser(userId, userConfig);
      if (messages.length > 0) {
        const user = this.e.bot.pickUser(userId);
        await user.sendMsg(messages.join('\n'));
      }
    }
    logger.info('[ZZZ-Plugin] 式舆防卫战/危局强袭战提醒任务执行完毕');
  }
}