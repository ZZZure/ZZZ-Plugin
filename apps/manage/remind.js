import settings from '../../lib/settings.js';
import { rulePrefix } from '../../lib/common.js';
import { ZZZPlugin } from '../../lib/plugin.js';

export class RemindManage extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]RemindManage',
      dsc: '提醒功能管理',
      event: 'message',
      priority: 40, // 管理插件优先级较高
      rule: [
        {
          reg: `${rulePrefix}设置提醒时间\\s*(.+)`,
          fnc: 'setCron',
          permission: 'master',
        },
      ],
    });
  }

  async setCron() {
    const match = this.e.msg.match(/设置提醒时间\s*(.+)/);
    if (!match) return;
    const cron = match.trim();
    settings.setSingleConfig('remind', 'cron', cron);
    await this.reply(`式舆防卫战/危局强袭战提醒的定时任务已更新为: ${cron}`);
  }
}