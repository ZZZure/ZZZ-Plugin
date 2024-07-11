import { ZZZPlugin } from '../lib/plugin.js';
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
          reg: `${rulePrefix}(note|每日|体力|便笺|便签)$`,
          fnc: 'note',
        },
      ],
    });
  }
  async note() {
    const { api, deviceFp } = await this.getAPI();
    if (!api) return false;
    await this.getPlayerInfo();
    const noteResponse = await api.getFinalData(this.e, 'zzzNote', {
      deviceFp,
    });
    if (!noteResponse) return false;
    const noteData = new ZZZNoteResp(noteResponse);
    const finalData = {
      note: noteData,
    };
    await render(this.e, 'note/index.html', finalData);
  }
}
