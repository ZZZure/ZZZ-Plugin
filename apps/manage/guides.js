import guides from '../../lib/guides.js';
import settings from '../../lib/settings.js';

/** 设置默认攻略 */
export async function setDefaultGuide() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    return false;
  }
  const match = /设置默认攻略(\d+|all)$/g.exec(this.e.msg);
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
      '攻略来源请输入 %攻略帮助 查看',
    ];
    await this.e.reply(reply_msg.join('\n'));
    return;
  }
  settings.setSingleConfig('guide', 'default_guide', guide_id);

  const source_name = guide_id == 0 ? 'all' : this.source[guide_id - 1];
  await this.e.reply(
    `绝区零默认攻略已设置为: ${guide_id} (${source_name})`,
    false,
    { at: true, recallMsg: 100 }
  );
}

/** 设置所有攻略显示个数 */
export async function setMaxForwardGuide() {
  if (!this.e.isMaster) {
    this.reply('仅限主人设置', false, { at: true, recallMsg: 100 });
    return false;
  }
  const match = /设置所有攻略显示个数(\d+)$/g.exec(this.e.msg);
  const max_forward_guide = Number(match[1]);
  if (max_forward_guide < 1) {
    await this.e.reply('所有攻略显示个数不能小于1', false, {
      at: true,
      recallMsg: 100,
    });
    return false;
  }
  if (max_forward_guide > guides.guideMaxNum) {
    await this.e.reply(`所有攻略显示个数不能大于${guides.guideMaxNum}`, false, {
      at: true,
      recallMsg: 100,
    });
    return false;
  }
  settings.setSingleConfig('guide', 'max_forward_guides', max_forward_guide);
  await this.e.reply(
    `绝区零所有攻略显示个数已设置为: ${max_forward_guide}`,
    false,
    { at: true, recallMsg: 100 }
  );
}
