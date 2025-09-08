import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import common from '../../../lib/common/common.js';
import _ from 'lodash';
import { rulePrefix } from '../lib/common.js';

export class User extends ZZZPlugin {
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
          reg: `${rulePrefix}解绑设备$`,
          fnc: 'deleteBind',
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
    if (/^(1[0-9])[0-9]{8}/i.test(uid)) {
      return this.reply('国际服不需要绑定设备');
    }
    //先throw一步（
    this.setContext('toBindDevice');
    await this.reply(
      `为UID ${uid}绑定设备，请发送设备信息(建议私聊发送)，或者发送“取消”取消绑定`,
      false,
      { at: true, recallMsg: 100 }
    );
  }
  async toBindDevice() {
    const ltuid = await this.getLtuid();
    if (!ltuid) {
      this.finish('toBindDevice');
      return this.reply('未绑定UID');
    }
    const msg = this.e.msg.trim();
    if (!msg) {
      return this.reply('请发送设备信息', false, { at: true, recallMsg: 100 });
    }
    if (msg.includes('取消')) {
      this.finish('toBindDevice');
      return this.reply('已取消', false, { at: true, recallMsg: 100 });
    }
    try {
      const info = JSON.parse(msg);
      if (!info) {
        return this.reply('设备信息格式错误', false, { at: true, recallMsg: 100 });
      }
      if (!!info?.device_id && !!info.device_fp) {
        this.finish('toBindDevice');
        await redis.set(`ZZZ:DEVICE_FP:${ltuid}:FP`, info.device_fp);
        await redis.set(`ZZZ:DEVICE_FP:${ltuid}:ID`, info.device_id);
        return this.reply('绑定设备成功', false, { at: true, recallMsg: 100 });
      }
      if (
        !info?.deviceName ||
        !info?.deviceBoard ||
        !info?.deviceModel ||
        !info?.oaid ||
        !info?.androidVersion ||
        !info?.deviceFingerprint ||
        !info?.deviceProduct
      ) {
        return this.reply('设备信息格式错误', false, { at: true, recallMsg: 100 });
      }
      await redis.del(`ZZZ:DEVICE_FP:${ltuid}:FP`);
      await redis.set(`ZZZ:DEVICE_FP:${ltuid}:BIND`, JSON.stringify(info));
      const { deviceFp } = await this.getAPI();
      if (!deviceFp) {
        return this.reply('绑定设备失败');
      }
      logger.debug(`[LTUID:${ltuid}]绑定设备成功，deviceFp:${deviceFp}`);
      await this.reply(`绑定设备成功${this.e.isGroup ? '\n请撤回设备信息' : ''}`, false, { at: true, recallMsg: 100 });
    } catch (error) {
      return this.reply('设备信息格式错误', false, { at: true, recallMsg: 100 });
    } finally {
      this.finish('toBindDevice');
    }
  }
  async deleteBind() {
    const uid = await this.getUID();
    if (/^(1[0-9])[0-9]{8}/i.test(uid)) return false;
    const ltuid = await this.getLtuid();
    await redis.del(`ZZZ:DEVICE_FP:${ltuid}:FP`);
    await redis.del(`ZZZ:DEVICE_FP:${ltuid}:BIND`);
    await redis.del(`ZZZ:DEVICE_FP:${ltuid}:ID`);
    await this.reply('解绑设备成功', false, { at: true, recallMsg: 100 });
  }
  async bindDeviceHelp() {
    const msgs = [
        '[绑定设备]',
        '方法一：',
        '1. 使用抓包软件抓取米游社APP的请求',
        '2. 在请求头内找到【x-rpc-device_id】和【x-rpc-device_fp】',
        '3. 自行构造如下格式的信息：',
        '    {"device_id": "x-rpc-device_id的内容", "device_fp": "x-rpc-device_fp的内容"}',
        '4. 给机器人发送"%绑定设备"指令',
        '5. 机器人会提示发送设备信息',
        '6. 粘贴自行构造的信息发送',
        '7. 提示绑定成功',
        '--------------------------------',
        '方法二（仅适用于安卓设备）：',
        '1. 使用常用米游社手机下载下面链接的APK文件，并安装',
        _.get(
          settings.getConfig('config'),
          'url',
          'https://ghproxy.mihomo.me/https://raw.githubusercontent.com/forchannot/get_device_info/main/app/build/outputs/apk/debug/app-debug.apk'
        ),
        '2. 打开后点击按钮复制',
        '3. 给机器人发送"%绑定设备"指令',
        '4. 机器人会提示发送设备信息',
        '5. 粘贴设备信息发送',
        '6. 提示绑定成功',
        '--------------------------------',
        '[解绑设备]',
        '发送 %解绑设备 即可',
      ],
      msg = msgs.join('\n');
    await this.reply(await common.makeForwardMsg(this.e, msg, '绑定设备帮助'));
  }
}
