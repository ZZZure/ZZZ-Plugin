import { ZZZPlugin } from '../lib/plugin.js';
import render from '../lib/render.js';
import { rulePrefix } from '../lib/common.js';
import { ZZZIndexResp } from '../model/index.js';
import settings from '../lib/settings.js';
import _ from 'lodash';

export class Card extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Card',
      dsc: 'zzzcard',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'card', 70),
      rule: [
        {
          reg: `${rulePrefix}(card|卡片|个人信息)$`,
          fnc: 'card',
        },
      ],
    });
  }
  async card() {
    const { api } = await this.getAPI();
    await this.getPlayerInfo();
    const indexData = await api.getFinalData(this.e, 'zzzIndex');
    if (!indexData) return false;

    let zzzAvatarList = await api.getFinalData(this.e, 'zzzAvatarList');
    if (!zzzAvatarList) return false;
    indexData.avatar_list = zzzAvatarList.avatar_list;

    let zzzBuddyList = await api.getFinalData(this.e, 'zzzBuddyList');
    if (!zzzBuddyList) return false;
    indexData.buddy_list = zzzBuddyList.list;
    const finalIndexData = new ZZZIndexResp(indexData);
    this.e.playerCard.player.region_name =
      finalIndexData.stats.world_level_name;
    const timer = setTimeout(() => {
      if (this?.reply) {
        this.reply('查询成功，正在下载图片资源，请稍候。');
      }
    }, 5000);
    await finalIndexData.get_assets();
    clearTimeout(timer);
    const data = {
      card: finalIndexData,
    };
    await render(this.e, 'card/index.html', data);
  }
}
