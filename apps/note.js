import { ZZZPlugin } from '../lib/plugin.js';
import _ from 'lodash';
import render from '../lib/render.js';
import { ZZZNoteResp } from '../model/note.js';
import { rulePrefix } from '../lib/common.js';

export class Note extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Note',
      dsc: 'zzznote',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: `${rulePrefix}note$`,
          fnc: 'note',
        },
      ],
    });
  }
  async note() {
    const { api, deviceFp } = await this.getAPI();
    if (!api) return false;
    await this.getPlayerInfo();
    let noteData = await api.getData('zzzNote', { deviceFp });
    noteData = await api.checkCode(this.e, noteData, 'zzzNote', {});
    if (!noteData || noteData.retcode !== 0) {
      await this.reply('[zzznote]每日数据获取失败');
      return false;
    }
    noteData = noteData.data;
    noteData = new ZZZNoteResp(noteData);
    const finalData = {
      note: noteData,
    };
    await render(this.e, 'note/index.html', finalData);
  }
}
