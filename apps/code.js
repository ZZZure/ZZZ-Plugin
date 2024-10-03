import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { rulePrefix } from '../lib/common.js';
import { getCodeMsg } from '../lib/code.js';

export class Note extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Code',
      dsc: 'zzzcode',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'code', 70),
      rule: [
        {
          reg: `${rulePrefix}(code|兑换码)$`,
          fnc: 'code',
        },
      ],
    });
  }
  async code() {
    const msg = await getCodeMsg();
    await this.reply(msg);
    return false;
  }
}
