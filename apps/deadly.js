import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { Deadly } from '../model/deadly.js';
import { rulePrefix } from '../lib/common.js';

export class deadly extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]deadly',
      dsc: 'zzz危局强袭战',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'deadly', 70),
      rule: [
        {
          reg: `${rulePrefix}(上期|往期)?(危局强袭战|危局|强袭|强袭战)$`,
          fnc: 'deadly',
        },
      ],
    });
  }
  async deadly() {
    const { api } = await this.getAPI();
    await this.getPlayerInfo();
    const method = this.e.msg.match(`(上期|往期)`)
      ? 'zzzDeadlyPeriod'
      : 'zzzDeadly';
    const deadlyData = await api.getFinalData(method).catch(e => {
      this.reply(e.message);
      throw e;
    });
    if (!deadlyData?.has_data) {
      await this.reply('没有危局强袭战数据');
      return false;
    }
    const deadly = new Deadly(deadlyData);
    const timer = setTimeout(() => {
      if (this?.reply) {
        this.reply('查询成功，正在下载图片资源，请稍候。');
      }
    }, 5000);
    await deadly.get_assets();
    clearTimeout(timer);
    const finalData = {
      deadly,
    };
    logger.debug(JSON.stringify(finalData, null, 2));
    await this.render('deadly/index.html', finalData, this);
  }
}
