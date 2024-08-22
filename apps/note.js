import { ZZZPlugin } from '../lib/plugin.js';
import { ZZZNoteResp } from '../model/note.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { rulePrefix } from '../lib/common.js';

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
    const noteResponse = await api.getFinalData('zzzNote').catch(e => {
      this.reply(e.message);
      throw e;
    });
    if (!noteResponse) return false;
    const noteData = new ZZZNoteResp(noteResponse);
    const finalData = {
      note: noteData,
    };
    await this.render('note/index.html', finalData);
  }
}
