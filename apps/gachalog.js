import { ZZZPlugin } from '../lib/plugin.js';
import _ from 'lodash';
import render from '../lib/render.js';
import { ZZZNoteResp } from '../model/note.js';
import { rulePrefix } from '../lib/common.js';

export class GachaLog extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]GachaLog',
      dsc: 'zzzGachaLog',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: `${rulePrefix}抽卡记录$`,
          fnc: 'gachaLog',
        },
      ],
    });
  }
  async gachaLog(e) {
    const { api, deviceFp } = await this.getAPI();
    if (!api) return false;
    let userData = await api.getData('zzzUser');
    if (!userData?.data || _.isEmpty(userData.data.list)) {
      await e.reply('[zzznote]玩家信息获取失败');
      return false;
    }
    userData = userData?.data?.list[0];
    let noteData = await api.getData('zzzNote', { deviceFp });
    noteData = await api.checkCode(e, noteData, 'zzzNote', {});
    if (!noteData || noteData.retcode !== 0) {
      await e.reply('[zzznote]每日数据获取失败');
      return false;
    }
    noteData = noteData.data;
    noteData = new ZZZNoteResp(noteData);
    let avatar = this.e.bot.avatar;
    // 头像
    if (this.e.member?.getAvatarUrl) {
      avatar = await this.e.member.getAvatarUrl();
    } else if (this.e.friend?.getAvatarUrl) {
      avatar = await this.e.friend.getAvatarUrl();
    }
    const finalData = {
      avatar,
      player: userData,
      note: noteData,
    };
    await render(e, 'note/index.html', finalData);
  }
}
