import { ZZZPlugin } from '../lib/plugin.js';
import _ from 'lodash';
import render from '../lib/render.js';
import { ZZZNoteResp } from '../model/note.js';
import { rulePrefix } from '../lib/common.js';

export class Panel extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Panel',
      dsc: 'zzzpanel',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: `${rulePrefix}((刷新|更新)面板|面板(刷新|更新))$`,
          fnc: 'refreshPanel',
        },
      ],
    });
  }
  async refreshPanel() {
    const { api, deviceFp } = await this.getAPI();
    if (!api) return false;
    await this.reply('TODO');
    // await this.getPlayerInfo();
    // let noteData = await api.getData('zzzNote', { deviceFp });
    // noteData = await api.checkCode(this.e, noteData, 'zzzNote', {});
    // if (!noteData || noteData.retcode !== 0) {
    //   await this.reply('[zzznote]每日数据获取失败');
    //   return false;
    // }
    // noteData = noteData.data;
    // noteData = new ZZZNoteResp(noteData);
    // const finalData = {
    //   note: noteData,
    // };
    // await render(this.e, 'note/index.html', finalData);
  }
}
