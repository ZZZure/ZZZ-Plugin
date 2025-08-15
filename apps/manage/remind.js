import settings from '../../lib/settings.js';

/** 设置全局提醒时间 */
export async function setGlobalRemind() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    return false;
  }
  const match = this.e.msg.match(/设置全局提醒时间\s*(每日\d+时|每周.\d+时)/);
  if (!match) return;
  const remindTime = match[1];

  // 将全局提醒时间写入yaml配置
  settings.setConfig('remind.globalRemindTime', remindTime);
  await this.reply(`全局提醒时间已更新为: ${remindTime}。`);
}