import { ZZZPlugin } from '../lib/plugin.js';
import { rulePrefix } from '../lib/common.js';

export class Challenge extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]challenge',
      dsc: 'zzz式舆防卫战',
      event: 'message',
      priority: 100,
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
    const indexData = await api.getFinalData(this.e, 'zzzChallenge', { deviceFp });
    await this.reply('data:' + JSON.stringify(indexData));
  }
}
