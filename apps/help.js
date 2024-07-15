import { ZZZPlugin } from '../lib/plugin.js';
import { rulePrefix } from '../lib/common.js';
import settings from '../lib/settings.js';
import _ from 'lodash';

export class Help extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Help',
      dsc: 'zzzhelp',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'help', 70),
      rule: [
        {
          reg: `${rulePrefix}(帮助|help)$`,
          fnc: 'help',
        },
      ],
    });
  }
  async help() {
    const reply_msg = [
      'ZZZ-Plugin 帮助还在制作中',
      '目前主要功能如下：',
      '所有功能前缀为：#zzz、%、#ZZZ、#绝区零 任选其一',
      '便签 - 命令: note、便签、便笺、体力、每日',
      '基本信息汇总（角色和邦布） - 命令: card、卡片、个人信息',
      '更新抽卡记录（需要逍遥插件支持） - 命令: 刷新抽卡链接、更新抽卡链接、刷新抽卡记录、更新抽卡记录',
      '获取抽卡记录链接（需要逍遥插件支持） - 命令: 获取抽卡链接',
      '抽卡记录 - 命令: 抽卡分析、抽卡记录',
      '角色攻略 - 命令: 角色名称/别名+攻略+(可选)来源数字',
      '刷新角色面板 - 命令: 刷新面板、更新面板、面板刷新、面板更新',
      '查看角色面板列表 - 命令: 面板、面板列表',
      '查看角色面板 - 命令: 角色名/别名+面板',
      '仓库地址：https://github.com/ZZZure/ZZZ-Plugin',
      'GsCore版：https://github.com/ZZZure/ZZZeroUID',
    ].join('\n');
    await this.reply(reply_msg);
  }
}
