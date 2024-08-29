import { ZZZPlugin } from '../lib/plugin.js';
import { getAuthKey } from '../lib/authkey.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import common from '../../../lib/common/common.js';
import { anaylizeGachaLog, updateGachaLog } from '../lib/gacha.js';
import { getZZZGachaLink, getZZZGachaLogByAuthkey } from '../lib/gacha/core.js';
import { gacha_type_meta_data } from '../lib/gacha/const.js';
import { getQueryVariable } from '../utils/network.js';
import { rulePrefix } from '../lib/common.js';

export class GachaLog extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]GachaLog',
      dsc: 'zzzGachaLog',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'gachalog', 70),
      rule: [
        {
          reg: `^${rulePrefix}抽卡帮助$`,
          fnc: 'gachaHelp',
        },
        {
          reg: `${rulePrefix}抽卡链接$`,
          fnc: 'startGachaLog',
        },
        {
          reg: `${rulePrefix}(刷新|更新)抽卡(链接|记录)$`,
          fnc: 'refreshGachaLog',
        },
        {
          reg: `^${rulePrefix}抽卡(分析|记录)$`,
          fnc: 'gachaLogAnalysis',
        },
        {
          reg: `^${rulePrefix}获取抽卡链接$`,
          fnc: 'getGachaLink',
        },
      ],
    });
  }
  async gachaHelp() {
    const reply_msg = [
      'ZZZ-Plugin 抽卡链接绑定方法：',
      '一、（不推荐）抓包获取',
      '1. 私聊 bot 发送【#zzz抽卡链接】，等待 bot 回复【请发送抽卡链接】',
      '2. 抓包获取抽卡链接',
      '3. 将获取到的抽卡链接发送给 bot',
      '二、通过 Cookie 刷新抽卡链接（需 bot 主人安装逍遥插件）',
      '1. 前提绑定 Cookie 或者 扫码登录',
      '2. 发送【#zzz刷新抽卡链接】',
      '当抽卡链接绑定完后，可以通过命令【#zzz抽卡分析】来查看抽卡分析',
    ].join('\n');
    await this.reply(reply_msg);
  }
  async startGachaLog() {
    const uid = await this.getUID();
    if (/^(1[0-9])[0-9]{8}/i.test(uid)) {
      await this.reply('抽卡记录相应功能只支持国服');
      return false;
    }
    const allowGroup = _.get(settings.getConfig('gacha'), 'allow_group', false);
    const whiteList = _.get(settings.getConfig('gacha'), 'white_list', []);
    const blackList = _.get(settings.getConfig('gacha'), 'black_list', []);
    if (!this.e.isPrivate) {
      const currentGroup = this.e?.group_id;
      if (!currentGroup) {
        await this.reply('获取群聊ID失败，请尝试私聊发送抽卡链接', false, {
          at: true,
          recallMsg: 100,
        });
        return false;
      }
      if (!allowGroup) {
        if (whiteList.length <= 0 || !whiteList?.includes(currentGroup)) {
          await this.reply(
            '当前群聊未开启链接刷新抽卡记录功能，请私聊发送',
            false,
            {
              at: true,
              recallMsg: 100,
            }
          );
          return false;
        }
      } else {
        if (blackList.length > 0 && blackList?.includes(currentGroup)) {
          await this.reply(
            '当前群聊未开启链接刷新抽卡记录功能，请私聊发送',
            false,
            {
              at: true,
              recallMsg: 100,
            }
          );
          return false;
        }
      }
      await this.reply(
        '请注意，当前在群聊中发送抽卡链接，包含authkey，其他人获取authkey可能导致未知后果，请谨慎操作，请在机器人回复你获取链接成功后及时撤回抽卡链接消息。',
        false,
        { at: true, recallMsg: 100 }
      );
    }
    this.setContext('gachaLog');
    await this.reply(
      '请发送抽卡链接，发送“取消”即可取消本次抽卡链接刷新',
      false,
      { at: true, recallMsg: 100 }
    );
  }
  async gachaLog() {
    const msg = this.e.msg.trim();
    if (msg.includes('取消')) {
      await this.reply('已取消', false, { at: true, recallMsg: 100 });
      this.finish('gachaLog');
      return false;
    }
    const key = getQueryVariable(msg, 'authkey');
    if (!key) {
      await this.reply('抽卡链接格式错误，请重新发起%抽卡链接', false, {
        at: true,
        recallMsg: 100,
      });
      this.finish('gachaLog');
      return false;
    }
    this.finish('gachaLog');
    this.getLogWithOutUID(key);
  }
  async refreshGachaLog() {
    const uid = await this.getUID();
    if (/^(1[0-9])[0-9]{8}/i.test(uid)) {
      await this.reply('抽卡记录相应功能只支持国服');
      return false;
    }
    if (!uid) return false;
    const lastQueryTime = await redis.get(`ZZZ:GACHA:${uid}:LASTTIME`);
    const gachaConfig = settings.getConfig('gacha');
    const coldTime = _.get(gachaConfig, 'interval', 300);
    try {
      const key = await getAuthKey(this.e, this.User, uid);
      if (!key) {
        await this.reply('authKey获取失败，请检查cookie是否过期');
        return false;
      }
      if (lastQueryTime && Date.now() - lastQueryTime < 1000 * coldTime) {
        await this.reply(`${coldTime}秒内只能刷新一次，请稍后再试`);
        return false;
      }
      await redis.set(`ZZZ:GACHA:${uid}:LASTTIME`, Date.now());
      this.getLog(key);
    } catch (error) {
      await this.reply(error.message);
    }
  }
  async getLog(key) {
    const uid = await this.getUID();
    if (!uid) {
      return false;
    }
    this.reply('抽卡记录获取中请稍等...可能需要一段时间，请耐心等待');
    const { data, count } = await updateGachaLog(key, uid);
    let msg = [];
    msg.push(`抽卡记录更新成功，共${Object.keys(data).length}个卡池`);
    for (const name in data) {
      msg.push(
        `${name}新增${count[name] || 0}条记录，一共${data[name].length}条记录`
      );
    }
    await this.reply(
      await common.makeForwardMsg(this.e, msg.join('\n'), '抽卡记录更新成功')
    );
    return false;
  }
  async getLogWithOutUID(key) {
    await this.reply(
      '抽卡链接解析成功，正在查询抽卡记录，可能耗费一段时间，请勿重复发送',
      false,
      { at: true, recallMsg: 100 }
    );
    /** @type {string} */
    let uid;
    queryLabel: for (const name in gacha_type_meta_data) {
      for (const type of gacha_type_meta_data[name]) {
        const log = await getZZZGachaLogByAuthkey(
          key,
          type,
          type[0],
          1,
          '0',
          '1'
        );
        if (log && log.list && log.list.length > 0) {
          uid = log.list[0].uid;
          break queryLabel;
        }
      }
    }
    if (!uid) {
      await this.reply('未查询到uid，请检查链接是否正确', false, {
        at: true,
        recallMsg: 100,
      });
      return false;
    }
    const { data, count } = await updateGachaLog(key, uid);
    let msg = [];
    msg.push(`抽卡记录更新成功，共${Object.keys(data).length}个卡池`);
    for (const name in data) {
      msg.push(
        `${name}新增${count[name] || 0}条记录，一共${data[name].length}条记录`
      );
    }
    await this.reply(
      await common.makeForwardMsg(this.e, msg, '抽卡记录更新成功')
    );
    return false;
  }

  async gachaLogAnalysis() {
    const uid = await this.getUID();
    if (/^(1[0-9])[0-9]{8}/i.test(uid)) {
      await this.reply('抽卡记录相应功能只支持国服');
      return false;
    }
    if (!uid) {
      return false;
    }
    await this.getPlayerInfo();
    await this.reply('正在分析抽卡记录，请稍等', false, {
      at: true,
      recallMsg: 100,
    });
    const data = await anaylizeGachaLog(uid);
    if (!data) {
      await this.reply(
        '未查询到抽卡记录，请先发送抽卡链接或%更新抽卡记录',
        false,
        {
          at: true,
          recallMsg: 100,
        }
      );
      return false;
    }
    const result = {
      data,
    };
    await this.render('gachalog/index.html', result);
  }
  async getGachaLink() {
    const uid = await this.getUID();
    if (/^(1[0-9])[0-9]{8}/i.test(uid)) {
      await this.reply('抽卡记录相应功能只支持国服');
      return false;
    }
    if (!this.e.isPrivate || this.e.isGroup) {
      await this.reply('请私聊获取抽卡链接', false, { at: true });
      return false;
    }
    if (!uid) {
      return false;
    }
    const key = await getAuthKey(this.e, this.User, uid);
    if (!key) {
      await this.reply('authKey获取失败，请检查cookie是否过期');
      return false;
    }
    const link = await getZZZGachaLink(key);
    await this.reply(link);
  }
}
