import version from '../../lib/version.js';
import { ZZZUpdate } from '../../lib/update.js';
import { pluginName } from '../../lib/path.js';
import settings from '../../lib/settings.js';

export async function getChangeLog() {
  const versionData = version.changelogs;
  await this.render('help/version.html', {
    versionData,
  });
  return false;
}

export async function getCommitLog() {
  if (!ZZZUpdate) return false;
  let updatePlugin = new ZZZUpdate();
  updatePlugin.e = this.e;
  updatePlugin.reply = this.reply;
  if (updatePlugin.getPlugin(pluginName)) {
    try {
      const commitData = await updatePlugin.getZZZAllLog();
      await this.render('help/commit.html', {
        commitData,
      });
    } catch (error) {
      this.reply(`[${pluginName}]获取更新日志失败\n${error.message}`, false, {
        at: true,
        recallMsg: 100,
      });
    }
  }
  return true;
}

export async function hasUpdate() {
  if (!ZZZUpdate) return false;
  let updatePlugin = new ZZZUpdate();
  updatePlugin.e = this.e;
  updatePlugin.reply = this.reply;
  if (updatePlugin.getPlugin(pluginName)) {
    const result = await updatePlugin.hasUpdate();
    if (result.hasUpdate) {
      await this.reply(`[${pluginName}]有${result.logs.length || 1}个更新`);
      await this.render('help/commit.html', {
        commitData: result.logs,
      });
    } else {
      await this.reply(`[${pluginName}]已是最新`);
    }
  }
  return true;
}

/** 开启/关闭自动更新推送 */
export async function enableAutoUpdatePush() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    return false;
  }
  let enable = true;
  if (this.e.msg.includes('关闭')) {
    enable = false;
  }
  settings.setSingleConfig('config', 'update', { autoCheck: enable });
  await this.reply(
    `[${pluginName}]自动更新推送${enable ? '已开启' : '已关闭'}`,
    false,
    { at: true, recallMsg: 100 }
  );
}

/** 设置自动更新时间 */
export async function setCheckUpdateCron() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    return false;
  }
  const cron = this.e.msg.split('时间')[1];
  if (!cron) {
    await this.reply(
      `[${pluginName}]设置自动更新频率失败，无cron表达式`,
      false,
      {
        at: true,
        recallMsg: 100,
      }
    );
    return false;
  }
  settings.setSingleConfig('config', 'update', { cron });
  await this.reply(`[${pluginName}]自动更新频率已设置为${cron}`, false, {
    at: true,
    recallMsg: 100,
  });
}
