import { ZZZPlugin } from '../lib/plugin.js';
import { rulePrefix } from '../lib/common.js';
import settings from '../lib/settings.js';
import _ from 'lodash';

export class Challenge extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]challenge',
      dsc: 'zzz式舆防卫战',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'challenge', 70),
      rule: [
        {
          reg: `${rulePrefix}(式舆防卫战|式舆|深渊|防卫战|防卫)$`,
          fnc: 'challenge',
        },
      ],
    });
  }
  async challenge() {
    const { api, deviceFp } = await this.getAPI();
    if (!api) return false;
    await this.getPlayerInfo();
    const indexData = await api.getFinalData(this.e, 'zzzChallenge', {
      deviceFp,
    });
    await this.reply('data:' + JSON.stringify(indexData));
  }
}
