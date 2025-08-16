import settings from '../../lib/settings.js';

/** 设置全局提醒时间 */
export async function setGlobalRemind() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    return false;
  }
  const match = this.e.msg.match(/设置全局提醒时间\s*(每日\d+时(?:(\d+)分)?)|每周.\d+时(?:(\d+)分)?))/);
  if (!match) return;
  const remindTime = match[1];
  const minute = Number(match[2]) || Number(match[3]) || 0;

  // 验证分钟格式
  if (minute % 10 !== 0 || minute < 0 || minute >= 60) {
    await this.reply('分钟必须为整十分钟');
    return;
  }

  settings.setSingleConfig('remind', 'globalRemindTime', remindTime);
  await this.reply(`全局提醒时间已更新为: ${remindTime}。`);
}