import settings from '../../lib/settings.js';

export async function switchGroupRank() {
  if (!this.e.isMaster) {
    return this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
  }
  // 使用正则判断是否包含"开启"
  const enableRegex = /开启|打开|on|启用|启动/i;
  const disableRegex = /关闭|关掉|off|禁用|停止/i;
  
  let isEnable;
  
  if (enableRegex.test(this.e.msg)) {
    isEnable = true;
  } else if (disableRegex.test(this.e.msg)) {
    isEnable = false;
  } else {
    // 如果都不匹配，默认使用开启/关闭的逻辑（根据是否有"开启"）
    // 或者返回错误提示
    return this.reply('请输入"开启"或"关闭"来设置群内深渊排名功能', false, { at: true, recallMsg: 100 });
  }
  settings.setSingleConfig('rank', 'allow_group', isEnable);
  const enableString = isEnable ? '开启' : '关闭';
  await this.e.reply(
    `绝区零群内深渊排名功能已设置为: ${enableString}`,
    false,
    { at: true, recallMsg: 100 }
  );
}