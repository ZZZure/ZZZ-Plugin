import { ZZZPlugin } from '../lib/plugin.js';
import render from '../lib/render.js';
import { rulePrefix } from '../lib/common.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { ZZZChallenge } from '../model/abyss.js';

export class Abyss extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]abyss',
      dsc: 'zzz式舆防卫战',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'abyss', 70),
      rule: [
        {
          reg: `${rulePrefix}(式舆防卫战|式舆|深渊|防卫战|防卫)$`,
          fnc: 'abyss',
        },
      ],
    });
  }
  async abyss() {
    const { api, deviceFp } = await this.getAPI();
    if (!api) return false;
    await this.getPlayerInfo();
    const abyssData = await api.getFinalData(this.e, 'zzzChallenge', {
      deviceFp,
    });
    if (!abyssData?.has_data) {
      await this.reply('没有式舆防卫战数据');
      return false;
    }
    const abyss = new ZZZChallenge(abyssData);
    const timer = setTimeout(() => {
      if (this?.reply) {
        this.reply('查询成功，正在下载图片资源，请稍候。');
      }
    }, 3000);
    await abyss.get_assets();
    clearTimeout(timer);
    const finalData = {
      abyss,
    };
    await render(this.e, 'abyss/index.html', finalData, this);
  }
}