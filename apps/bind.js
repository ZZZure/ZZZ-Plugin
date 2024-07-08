import { rulePrefix } from '../lib/common.js';
import { ZZZPlugin } from '../lib/plugin.js';

export class bind extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Bind',
      dsc: 'zzzbind',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: `^${rulePrefix}绑定(uid|UID)?(\\s)?[1-9][0-9]{7,9}$`,
          fnc: 'bindUid',
        },
      ],
    });
  }
  async bindUid() {
    const uid = parseInt(this.e.msg.replace(/[^0-9]/gi, ''));
    const user = this.e.user_id;
    await redis.set(`ZZZ:UID:${user}`, uid);
    this.reply(`绑定成功,当前绑定[zzz]uid:${uid}`, false);
    return false;
  }
}
