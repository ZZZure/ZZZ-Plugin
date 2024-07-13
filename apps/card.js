import { ZZZPlugin } from '../lib/plugin.js';
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
    const indexData = await api.getFinalData(this.e, 'zzzIndex', { deviceFp });
    if (!indexData) return false;

    let zzzAvatarList = await api.getFinalData(this.e, 'zzzAvatarList', {
      deviceFp,
    });
    if (!zzzAvatarList) return false;
    indexData.avatar_list = zzzAvatarList.avatar_list;

    let zzzBuddyList = await api.getFinalData(this.e, 'zzzBuddyList', {
      deviceFp,
    });
    if (!zzzBuddyList) return false;
    indexData.buddy_list = zzzBuddyList.list;
    const finalIndexData = new ZZZIndexResp(indexData);
    this.e.playerCard.player.region_name =
      finalIndexData.stats.world_level_name;
    await finalIndexData.get_assets();
    const data = {
      card: finalIndexData,
    };
    await render(this.e, 'card/index.html', data);
  }
}
