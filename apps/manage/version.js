import version from '../../lib/version.js';
import render from '../../lib/render.js';
import { ZZZUpdate } from '../../lib/update.js';
import { pluginName } from '../../lib/path.js';

export async function getChangeLog() {
  const versionData = version.changelogs;
  await render(this.e, 'help/version.html', {
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
      await render(this.e, 'help/commit.html', {
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
      await render(this.e, 'help/commit.html', {
        commitData: result.logs,
      });
    } else {
      await this.reply(`[${pluginName}]已是最新`);
    }
  }
  return true;
}
