import { ZZZPlugin } from '../lib/plugin.js';
import { rulePrefix } from '../lib/common.js';

export class Help extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Help',
      dsc: 'zzzhelp',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: `${rulePrefix}(帮助|help)$`,
          fnc: 'help',
        },
      ],
    });
  }
  async help() {
    const reply_msg = [
      'ZZZ-Plugin 帮助还在制作中',
      '目前主要功能如下：',
      '1. 体力进度：【#zzznote或者%note】',
      '2. 个人信息：【#zzzcard或者%card】',
      '3. 抽卡分析：【#zzz抽卡帮助】来查看相应功能',
      '4. 角色攻略：【#zzz角色攻略+角色名称/别名】',
      '仓库地址：https://github.com/ZZZure/ZZZ-Plugin',
      'GsCore版：https://github.com/ZZZure/ZZZeroUID',
    ].join('\n');
    await this.reply(reply_msg);
  }
}
