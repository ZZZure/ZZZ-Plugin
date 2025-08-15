import settings from '../../lib/settings.js';
import { rulePrefix } from '../../lib/common.js';
import { ZZZPlugin } from '../../lib/plugin.js';

const USER_CONFIGS_KEY = 'ZZZ:REMIND:USER_CONFIGS';

export class RemindManage extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]RemindManage',
      dsc: '提醒功能管理',
      event: 'message',
      priority: 40, // 管理插件优先级较高
      rule: [
        {
          reg: `${rulePrefix}设置全局提醒时间\\s*(每日\\d+时|每周.\\d+时)`,
          fnc: 'setGlobalRemind',
          permission: 'master',
        },
        {
          reg: `${rulePrefix}(设置|修改)个人提醒时间\\s*(每日\\d+时|每周.\\d+时)`,
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
  }

  async getUserConfig(userId) {
    const userConfigJson = await redis.hGet(USER_CONFIGS_KEY, String(userId));
    return userConfigJson ? JSON.parse(userConfigJson) : null;
  }

  async setUserConfig(userId, config) {
    await redis.hSet(USER_CONFIGS_KEY, String(userId), JSON.stringify(config));
  }

  async setGlobalRemind() {
    const match = this.e.msg.match(/(每日\d+时|每周.\d+时)/);
    if (!match) return;
    const remindTime = match[1];

    // 将全局提醒时间写入yaml配置
    settings.setConfig('remind.globalRemindTime', remindTime);
    await this.reply(`全局提醒时间已更新为: ${remindTime}。`);
  }

  async setMyRemindTime() {
    const match = this.e.msg.match(/(每日\d+时|每周.\d+时)/);
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