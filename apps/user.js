import { ZZZPlugin } from '../lib/plugin.js';
import { rulePrefix } from '../lib/common.js';
import settings from '../lib/settings.js';
import common from '../../../lib/common/common.js';
import _ from 'lodash';

export class Panel extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]User',
      dsc: 'zzzuser',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'user', 70),
      rule: [
        {
          reg: `${rulePrefix}绑定设备$`,
          fnc: 'bindDevice',
        },
        {
          reg: `${rulePrefix}绑定设备帮助$`,
          fnc: 'bindDeviceHelp',
        },
      ],
    });
  }
  async bindDevice() {
    const uid = await this.getUID();
    if (!uid) {
      this.reply('未绑定UID');
    }
    this.setContext('toBindDevice');
    await this.reply(
      `为UID ${uid}绑定设备，请发送设备信息，或者发送“取消”取消绑定`,
      false,
      { at: true, recallMsg: 100 }
    );
  }
  async toBindDevice() {
    const ltuid = await this.getLtuid();
    if (!ltuid) {
      this.reply('未绑定UID');
      this.finish('toBindDevice');
      return false;
    }
    const msg = this.e.msg.trim();
    if (!msg) {
      this.reply('请发送设备信息', false, { at: true, recallMsg: 100 });
      return false;
    }
    if (msg.includes('取消')) {
      await this.reply('已取消', false, { at: true, recallMsg: 100 });
      this.finish('toBindDevice');
      return false;
    }
    try {
      const info = JSON.parse(msg);
      if (!info) {
        this.reply('设备信息格式错误', false, { at: true, recallMsg: 100 });
        return false;
      }
      if (
        !'deviceName' in info ||
        !'deviceBoard' in info ||
        !'deviceModel' in info ||
        !'oaid' in info ||
        !'deviceFingerprint' in info ||
        !'deviceProduct' in info
      ) {
        this.reply('设备信息格式错误', false, { at: true, recallMsg: 100 });
        return false;
      }
      await redis.del(`ZZZ:DEVICE_FP:${ltuid}:FP`);
      await redis.set(`ZZZ:DEVICE_FP:${ltuid}:BIND`, JSON.stringify(info));
      const { deviceFp } = await this.getAPI();
      if (!deviceFp) {
        await this.reply('绑定设备失败');
        return false;
      }
      logger.debug(`[LTUID:${ltuid}]绑定设备成功，deviceFp:${deviceFp}`);
      await this.reply('绑定设备成功', false, { at: true, recallMsg: 100 });
    } catch (error) {
      this.reply('设备信息格式错误', false, { at: true, recallMsg: 100 });
      return false;
    } finally {
      this.finish('toBindDevice');
      return false;
    }
  }
  async bindDeviceHelp() {
    const msgs = [
        '绑定设备帮助',
        settings.getConfig('config')?.url,
        '1. 使用常用米游社手机下载以上APK，并安装',
        '2. 打开后点击按钮复制',
        '3. 给机器人发送"%绑定设备"指令',
        '4. 机器人会提示发送设备信息',
        '5. 粘贴设备信息发送',
        '6. 提示绑定成功',
      ],
      msg = msgs.join('\n');
    await this.reply(await common.makeForwardMsg(this.e, msg, '绑定设备帮助'));
  }
}
