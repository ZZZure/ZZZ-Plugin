import { setGroupRankAllowed, removeGroupRank } from '../../lib/rank.js';
export async function switchGroupRank(e) {
    e ||= this.e;
    if (!e.isMaster) {
        return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }
    const enableRegex = /开启|打开|on|启用|启动/i;
    const disableRegex = /关闭|关掉|off|禁用|停止/i;
    let isEnable;
    if (enableRegex.test(e.msg)) {
        isEnable = true;
    }
    else if (disableRegex.test(e.msg)) {
        isEnable = false;
    }
    else {
        return e.reply('请输入"开启"或"关闭"来设置群内深渊排名功能', false, { at: true, recallMsg: 100 });
    }
    setGroupRankAllowed(isEnable);
    const enableString = isEnable ? '开启' : '关闭';
    await e.reply(`绝区零群内深渊排名功能已设置为: ${enableString}`, false, { at: true, recallMsg: 100 });
}
export async function resetGroupRank(e) {
    e ||= this.e;
    if (!e.group_id) {
        return e.reply('请在群聊中使用该命令！');
    }
    if (e.isMaster) {
        let rank_types = [];
        let rank_type_str = '';
        if (/式舆防卫战|式舆|深渊|防卫战|防卫/.test(e.msg)) {
            rank_types = ['ABYSS'];
            rank_type_str = '式舆防卫战';
        }
        else if (/危局强袭战|危局|强袭|强袭战/.test(e.msg)) {
            rank_types = ['DEADLY'];
            rank_type_str = '危局强袭战';
        }
        else if (/临界推演|临界|推演/.test(e.msg)) {
            rank_types = ['VOID_FRONT_BATTLE'];
            rank_type_str = '临界推演';
        }
        else {
            rank_types = ['ABYSS', 'DEADLY', 'VOID_FRONT_BATTLE'];
            rank_type_str = '式舆防卫战、危局强袭战和临界推演';
        }
        for (const rank_type of rank_types) {
            await removeGroupRank(rank_type, e.group_id);
        }
        return e.reply(`清除${rank_type_str}排名成功！`, false, { at: true, recallMsg: 100 });
    }
    else {
        return e.reply('仅限主人操作', false, { at: true, recallMsg: 100 });
    }
}
//# sourceMappingURL=rank.js.map