import { setGroupRankAllowed, removeGroupRank } from '../../lib/rank.js';

export async function switchGroupRank() {
  if (!this.e?.isMaster) {
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
  setGroupRankAllowed(isEnable);
  const enableString = isEnable ? '开启' : '关闭';
  await this.e.reply(
    `绝区零群内深渊排名功能已设置为: ${enableString}`,
    false,
    { at: true, recallMsg: 100 }
  );
}

export async function resetGroupRank() {
  if (!(this.e?.group_id)) {
    return this.reply('请在群聊中使用该命令！');
  }

  if (this.e?.isMaster) {
    let rank_types = []
    let rank_type_str = ''
    if (/式舆防卫战|式舆|深渊|防卫战|防卫/.test(this.e.msg)) {
      rank_types = ['ABYSS']
      rank_type_str = '式舆防卫战'
    } else if (/危局强袭战|危局|强袭|强袭战/.test(this.e.msg)) {
      rank_types = ['DEADLY']
      rank_type_str = '危局强袭战'
    } else {
      rank_types = ['ABYSS', 'DEADLY']
      rank_type_str = '式舆防卫战和危局强袭战'
    }
    for (const rank_type of rank_types) {
      await removeGroupRank(rank_type, this.e.group_id);
    }
    return this.reply(`清除${rank_type_str}排名成功！`, false, { at: true, recallMsg: 100 });
  } else {
    return this.reply('仅限主人操作', false, { at: true, recallMsg: 100 });
  }
}