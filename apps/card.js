import { ZZZPlugin } from '../lib/plugin.js';
import { ZZZIndexResp } from '../model/index.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { rulePrefix } from '../lib/common.js';

export class Card extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Card',
      dsc: 'zzzcard',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'card', 70),
      rule: [
        {
          reg: `${rulePrefix}(card|卡片|个人信息|角色)$`,
          fnc: 'card',
        },
      ],
    });
  }
  async card() {
    const { api, deviceFp } = await this.getAPI();
    await this.getPlayerInfo();
    const indexData = await api.getFinalData('zzzIndex', {
      deviceFp,
    }).catch(e => {
      this.reply(e.message);
      throw e;
    });
    if (!indexData) return null;

    let zzzAvatarList = await api.getFinalData('zzzAvatarList', {
      deviceFp,
    }).catch(e => {
      this.reply(e.message);
      throw e;
    });
    if (!zzzAvatarList) return null;
    indexData.avatar_list = zzzAvatarList.avatar_list;

    let zzzBuddyList = await api.getFinalData('zzzBuddyList', {
      deviceFp,
    }).catch(e => {
      this.reply(e.message);
      throw e;
    });
    if (!zzzBuddyList) return null;
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
    await this.render('card/index.html', data);
  }
}
