import guides from '../../lib/guides.js';
import settings from '../../lib/settings.js';
export async function setDefaultGuide(e) {
    e ||= this.e;
    if (!e.isMaster) {
        return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }
    const match = /设置默认攻略(\d+|all)$/.exec(e.msg);
    if (!match)
        return false;
    let guide_id = match[1];
    if (guide_id == 'all') {
        guide_id = 0;
    }
    guide_id = Number(guide_id);
    if (guide_id > guides.guideMaxNum) {
        const reply_msg = [
            '绝区零默认攻略设置方式为:',
            '%设置默认攻略[0123...]',
            `请增加数字0-${guides.guideMaxNum}其中一个，或者增加 all 以显示所有攻略`,
            '攻略来源请输入 %攻略帮助 查看'
        ];
        await e.reply(reply_msg.join('\n'));
        return;
    }
    settings.setSingleConfig('guide', 'default_guide', guide_id);
    const source_name = guide_id == 0 ? 'all' : guides.guideSources[guide_id - 1];
    await e.reply(`绝区零默认攻略已设置为: ${guide_id} (${source_name})`, false, { at: true, recallMsg: 100 });
}
export async function setMaxForwardGuide(e) {
    e ||= this.e;
    if (!e.isMaster) {
        return e.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    }
    const match = /设置所有攻略显示个数(\d+)$/.exec(e.msg);
    if (!match)
        return false;
    const max_forward_guide = Number(match[1]);
    if (max_forward_guide < 1) {
        return e.reply('所有攻略显示个数不能小于1', false, {
            at: true,
            recallMsg: 100
        });
    }
    if (max_forward_guide > guides.guideMaxNum) {
        return e.reply(`所有攻略显示个数不能大于${guides.guideMaxNum}`, false, {
            at: true,
            recallMsg: 100
        });
    }
    settings.setSingleConfig('guide', 'max_forward_guides', max_forward_guide);
    await e.reply(`绝区零所有攻略显示个数已设置为: ${max_forward_guide}`, false, { at: true, recallMsg: 100 });
}
//# sourceMappingURL=guides.js.map