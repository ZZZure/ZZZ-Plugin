import { ZZZPlugin } from '../lib/plugin.js';
import render from '../lib/render.js';
import { ZZZNoteResp } from '../model/note.js';
import { rulePrefix } from '../lib/common.js';
import settings from '../lib/settings.js';
import _ from 'lodash';

export class Note extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Note',
      dsc: 'zzznote',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'note', 70),
      rule: [
        {
          reg: `${rulePrefix}(note|每日|体力|便笺|便签)$`,
          fnc: 'note',
        },
      ],
    });
  }
  async note() {
    const { api } = await this.getAPI();
    await this.getPlayerInfo();
    const noteResponse = await api.getFinalData(this.e, 'zzzNote');
    if (!noteResponse) return false;
    const noteData = new ZZZNoteResp(noteResponse);
    const finalData = {
      note: noteData,
    };
    await render(this.e, 'note/index.html', finalData);
  }
}
