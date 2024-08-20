import _ from 'lodash';
import { pluginName } from '../lib/path.js';
import settings from '../lib/settings.js';
import { ZZZUpdate } from '../lib/update.js';
import config from '../../../lib/config/config.js';
import { rulePrefix } from '../lib/common.js';

const updateInfo = {
  lastCheckCommit: '',
};
export class update extends plugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Update',
      dsc: 'zzzupdate',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'update', 70),
      rule: [
        {
          reg: `^${rulePrefix}(插件)?(强制)?更新(插件)?$`,
          fnc: 'update',
        },
      ],
    });
    const updateConfig = _.get(settings.getConfig('config'), 'update', {});
    const cron = _.get(updateConfig, 'cron', '0 0/10 * * * ?');
    this.task = {
      name: 'ZZZ-Plugin自动检测更新',
      cron: cron,
      fnc: () => {
        this.checkUpdateTask();
      },
    };
  }

  async update(e = this.e) {
    if (!e.isMaster || !ZZZUpdate) return false;
    e.msg = `#${e.msg.includes('强制') ? '强制' : ''}更新${pluginName}`;
    const up = new ZZZUpdate(e);
    up.e = e;
    return up.update();
  }

  async checkUpdateTask() {
    const updateConfig = _.get(settings.getConfig('config'), 'update', {});
    const enable = _.get(updateConfig, 'autoCheck', false);
    if (!enable) return;
    if (!ZZZUpdate) return false;
    const up = new ZZZUpdate();
    const result = await up.hasUpdate();
    if (result.hasUpdate) {
      if (result.logs[0].commit === updateInfo.lastCheckCommit) return;
      const botInfo = { nickname: 'ZZZ-Plugin更新', user_id: Bot.uin };
      const msgs = [
        {
          message: [`[${pluginName}]有${result.logs.length || 1}个更新`],
          ...botInfo,
        },
      ];
      for (const log of result.logs) {
        msgs.push({
          message: [`[${log.commit}|${log.date}]${log.msg}`],
          ...botInfo,
        });
      }
      const msg = Bot.makeForwardMsg(msgs);
      try {
        ForMsg.data = ForMsg.data
          .replace(/\n/g, '')
          .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
          .replace(
            /___+/,
            '<title color="#777777" size="26">ZZZ-Plugin更新</title>'
          );
      } catch (err) {}
      const masters = config.masterQQ;
      for (const master of masters) {
        if (master.toString().length > 11) continue;
        await Bot.pickFriend(master).sendMsg(msg);
        break;
      }
      updateInfo.lastCheckCommit = result.logs[0].commit;
    }
  }
}
