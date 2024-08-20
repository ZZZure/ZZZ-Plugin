import _ from 'lodash';
import { rulePrefix } from '../lib/common.js';
import { pluginName } from '../lib/path.js';
import settings from '../lib/settings.js';
import { ZZZUpdate } from '../lib/update.js';

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
  }

  async update(e = this.e) {
    if (!e.isMaster || !ZZZUpdate) return false;
    e.msg = `#${e.msg.includes('强制') ? '强制' : ''}更新${pluginName}`;
    const up = new ZZZUpdate(e);
    up.e = e;
    return up.update();
  }
}
