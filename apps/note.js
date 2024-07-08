import { ZZZPlugin } from '../lib/plugin.js';
import MysZZZApi from '../lib/mysapi.js';
import { getCk } from '../lib/common.js';
import _ from 'lodash';
import render from '../lib/render.js';
import { ZZZNoteResp } from '../model/note.js';

export class test extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Note',
      dsc: 'zzznote',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: `^#zzznote$`,
          fnc: 'note',
        },
      ],
    });
  }
  async note(e) {
    const { api, deviceFp } = await this.getAPI();
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
