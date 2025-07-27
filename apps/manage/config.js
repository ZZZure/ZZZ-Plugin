import settings from '../../lib/settings.js';

/** 设置渲染精度 */
export async function setRenderPrecision() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
  }
  const match = /渲染精度(\d+)$/g.exec(this.e.msg);
  const render_precision = Number(match[1]);
  if (render_precision < 50) {
    await this.e.reply('渲染精度不能小于50', false, {
      at: true,
      recallMsg: 100,
    });
  }
  if (render_precision > 200) {
    await this.e.reply('渲染精度不能大于200', false, {
      at: true,
      recallMsg: 100,
    });
  }
  settings.setSingleConfig('config', 'render', {
    scale: render_precision,
  });
  await this.e.reply(`绝区零渲染精度已设置为: ${render_precision}`);
}

/** 设置刷新抽卡间隔 */
export async function setRefreshGachaInterval() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
  }
  const match = /刷新抽卡间隔(\d+)$/g.exec(this.e.msg);
  const refresh_gacha_interval = Number(match[1]);
  if (refresh_gacha_interval < 0) {
    await this.e.reply('刷新抽卡间隔不能小于0秒', false, {
      at: true,
      recallMsg: 100,
    });
  }
  if (refresh_gacha_interval > 1000) {
    await this.e.reply('刷新抽卡间隔不能大于1000秒', false, {
      at: true,
      recallMsg: 100,
    });
  }
  settings.setSingleConfig('gacha', 'interval', refresh_gacha_interval);
  await this.e.reply(`绝区零刷新抽卡间隔已设置为: ${refresh_gacha_interval}`);
}

/** 设置刷新面板间隔 */
export async function setRefreshPanelInterval() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
  }
  const match = /刷新面板间隔(\d+)$/g.exec(this.e.msg);
  const refresh_panel_interval = Number(match[1]);
  if (refresh_panel_interval < 0) {
    await this.e.reply('刷新面板间隔不能小于0秒', false, {
      at: true,
      recallMsg: 100,
    });
  }
  if (refresh_panel_interval > 1000) {
    await this.e.reply('刷新面板间隔不能大于1000秒', false, {
      at: true,
      recallMsg: 100,
    });
  }
  settings.setSingleConfig('panel', 'interval', refresh_panel_interval);
  await this.e.reply(
    `绝区零刷新面板间隔已设置为: ${refresh_panel_interval}`,
    false,
    { at: true, recallMsg: 100 }
  );
}

/** 设置角色刷新间隔 */
export async function setRefreshCharInterval() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
  }
  const match = /刷新角色间隔(\d+)$/g.exec(this.e.msg);
  const refresh_char_interval = Number(match[1]);
  if (refresh_char_interval < 0) {
    await this.e.reply('刷新角色间隔不能小于0秒', false, {
      at: true,
      recallMsg: 100,
    });
  }
  if (refresh_char_interval > 1000) {
    await this.e.reply('刷新角色间隔不能大于1000秒', false, {
      at: true,
      recallMsg: 100,
    });
  }
  settings.setSingleConfig('panel', 'roleInterval', refresh_char_interval);
  await this.e.reply(`绝区零刷新角色间隔已设置为: ${refresh_char_interval}秒`);
}
