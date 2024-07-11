import { ZZZPlugin } from '../lib/plugin.js';
import _ from 'lodash';
import render from '../lib/render.js';
import { rulePrefix } from '../lib/common.js';
import { ZZZIndexResp } from '../model/index.js';

export class Card extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Card',
      dsc: 'zzzcard',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: `${rulePrefix}(card|卡片|个人信息)$`,
          fnc: 'card',
        },
      ],
    });
  }
  async card() {
    const { api, deviceFp } = await this.getAPI();
    if (!api) return false;
    await this.getPlayerInfo();
    let indexData = await api.getData('zzzIndex', { deviceFp });
    indexData = await api.checkCode(this.e, indexData, 'zzzIndex', {});
    if (!indexData || indexData.retcode !== 0) {
      await this.reply('[zzznote]Index数据获取失败');
      return false;
    }
    indexData = indexData.data;
    indexData = new ZZZIndexResp(indexData);
    this.e.playerCard.player.region_name = indexData.stats.world_level_name;
    await indexData.get_assets();
    const data = {
      card: indexData,
    };
    await render(this.e, 'card/index.html', data);
  }
}
