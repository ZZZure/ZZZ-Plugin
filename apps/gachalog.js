import { ZZZPlugin } from '../lib/plugin.js';
import _ from 'lodash';
import render from '../lib/render.js';
import { ZZZNoteResp } from '../model/note.js';
import { rulePrefix } from '../lib/common.js';
import { getAuthKey, getStoken } from '../lib/authkey.js';
import { updateGachaLog } from '../lib/gacha.js';

export class GachaLog extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]GachaLog',
      dsc: 'zzzGachaLog',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: `${rulePrefix}抽卡链接$`,
          fnc: 'startGachaLog',
        },
        {
          reg: `${rulePrefix}刷新抽卡链接$`,
          fnc: 'refreshGachaLog',
        },
        {
          reg: `^${rulePrefix}抽卡帮助$`,
          fnc: 'gachaHelp',
        },
      ],
    });
  }
  async gachaHelp() {
    const reply_msg = [
      'StarRail-Plugin 抽卡链接绑定方法：',
      '1. 输入【#zzz抽卡链接】，等待 bot 回复【请发送抽卡链接】',
      '2. 获取抽卡链接',
      '3. 将获取到的抽卡链接发送给 bot',
    ].join('\n');
    await this.reply(reply_msg);
  }
  async startGachaLog() {
    if (!this.e.isPrivate) {
      await this.reply('请私聊发送抽卡链接', false, { at: true });
      return false;
    }
    this.setContext('gachaLog');
    await this.reply('请发送抽卡链接', false, { at: true });
  }
  async gachaLog() {
    if (!this.e.isPrivate) {
      await this.reply('请私聊发送抽卡链接', false, { at: true });
      return false;
    }
    let key = this.e.msg.trim();
    key = key?.split?.('authkey=')?.[1]?.split('&')?.[0];
    if (!key) {
      await this.reply('抽卡链接格式错误，请重新发送');
      this.finish('gachaLog');
      return false;
    }
    this.finish('gachaLog');
    this.getLog(key);
  }
  async refreshGachaLog() {
    const uid = await this.getUID();
    const key = await getAuthKey(this.e, uid);
    if (!key) {
      await this.reply('authKey获取失败，请检查cookie是否过期');
      return false;
    }
    this.getLog(key);
  }
  async getLog(key) {
    const lastQueryTime = await redis.get(`ZZZ:GACHA:${uid}:LASTTIME`);
    if (lastQueryTime && Date.now() - lastQueryTime < 1000 * 60 * 5) {
      await this.reply('1分钟内只能刷新一次，请稍后重试');
      return false;
    }
    await redis.set(`ZZZ:GACHA:${uid}:LASTTIME`, Date.now());
    const uid = await this.getUID();
    const data = await updateGachaLog(key, uid);
    let msg = `抽卡记录更新成功，共${Object.keys(data).length}个卡池`;
    for (const name in data) {
      msg += `\n${name}一共${data[name].length}条记录`;
    }
    await this.reply(msg);
    return false;
  }
}
