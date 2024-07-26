import { ZZZPlugin } from '../lib/plugin.js';
import render from '../lib/render.js';
import { rulePrefix } from '../lib/common.js';
import { getPanelList, refreshPanel, getPanel } from '../lib/avatar.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { getMapData } from '../utils/file.js';
const skilldict = getMapData('SkillData');

export class Panel extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Panel',
      dsc: 'zzzpanel',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'panel', 70),
      rule: [
        {
          reg: `${rulePrefix}(.*)面板(.*)$`,
          fnc: 'handleRule',
        },
      ],
    });
  }
  async handleRule() {
    if (!this.e.msg) return;
    const reg = new RegExp(`${rulePrefix}(.*)面板(.*)$`);
    const pre = this.e.msg.match(reg)[4].trim();
    const suf = this.e.msg.match(reg)[5].trim();
    if (['刷新', '更新'].includes(pre) || ['刷新', '更新'].includes(suf))
      return this.refreshPanel();
    if (!pre || suf === '列表') return this.getCharPanelList();
    return this.getCharPanel();
  }

  async refreshPanel() {
    const uid = await this.getUID();
    if (!uid) return;
    const lastQueryTime = await redis.get(`ZZZ:PANEL:${uid}:LASTTIME`);
    const panelSettings = settings.getConfig('panel');
    const coldTime = _.get(panelSettings, 'interval', 300);
    if (lastQueryTime && Date.now() - lastQueryTime < 1000 * coldTime) {
      await this.reply(`${coldTime}秒内只能刷新一次，请稍后再试`);
      return false;
    }
    const { api, deviceFp } = await this.getAPI();
    if (!api) return false;
    await redis.set(`ZZZ:PANEL:${uid}:LASTTIME`, Date.now());
    await this.reply('正在刷新面板列表，请稍候...');
    await this.getPlayerInfo();
    const result = await refreshPanel(this.e, api, uid, deviceFp);
    if (!result) {
      await this.reply('面板列表刷新失败，请稍后再试');
      return false;
    }
    const newChar = result.filter(item => item.isNew);
    const finalData = {
      newChar: newChar.length,
      list: result,
    };
    await render(this.e, 'panel/refresh.html', finalData);
  }
  async getCharPanelList() {
    const uid = await this.getUID();
    if (!uid) return false;
    const result = getPanelList(uid);
    await this.getPlayerInfo();
    const timer = setTimeout(() => {
      if (this?.reply) {
        this.reply('查询成功，正在下载图片资源，请稍候。');
      }
    }, 3000);
    for (const item of result) {
      await item.get_basic_assets();
    }
    clearTimeout(timer);
    const finalData = {
      count: result?.length || 0,
      list: result,
    };
    await render(this.e, 'panel/list.html', finalData);
  }
  async getCharPanel() {
    const uid = await this.getUID();
    if (!uid) return false;
    const reg = new RegExp(`${rulePrefix}(.+)面板$`);
    const name = this.e.msg.match(reg)[4];
    if (['刷新', '更新'].includes(name)) return this.getCharPanelList();
    const data = getPanel(uid, name);
    if (!data) {
      await this.reply(`未找到角色${name}的面板信息，请先刷新面板`);
      return;
    }
    const timer = setTimeout(() => {
      if (this?.reply) {
        this.reply('查询成功，正在下载图片资源，请稍候。');
      }
    }, 3000);
    await data.get_detail_assets();
    clearTimeout(timer);
    const finalData = {
      uid: uid,
      charData: data,
    };
    await render(this.e, 'panel/card.html', finalData);
  }
}
