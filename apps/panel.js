import { ZZZPlugin } from '../lib/plugin.js';
import {
  getPanelList,
  refreshPanel as refreshPanelFunction,
  getPanelOrigin,
  updatePanelData,
  formatPanelData,
  getPanelListOrigin,
} from '../lib/avatar.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { rulePrefix } from '../lib/common.js';
import { getZzzEnkaData } from '../lib/ekapi/query.js'
import { _enka_data_to_mys_data } from '../lib/ekapi/enka_to_mys.js'

export class Panel extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Panel',
      dsc: 'zzzpanel',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'panel', 70),
      rule: [
        {
          reg: `${rulePrefix}(.*)面板(刷新|更新|列表)?$`,
          fnc: 'handleRule',
        },
        {
          reg: `${rulePrefix}练度(统计)?$`,
          fnc: 'proficiency',
        },
        {
          reg: `${rulePrefix}原图$`,
          fnc: 'getCharOriImage',
        },
      ],
      handler: [
        { key: 'zzz.tool.panel', fn: 'getCharPanelTool' },
        { key: 'zzz.tool.panelList', fn: 'getCharPanelListTool' },
      ],
    });
  }
  async handleRule() {
    if (!this.e.msg) return;
    const reg = new RegExp(`${rulePrefix}(.*)面板(刷新|更新|列表)?$`);
    const pre = this.e.msg.match(reg)[4]?.trim();
    const suf = this.e.msg.match(reg)[5]?.trim();
    if (['刷新', '更新'].includes(pre) || ['刷新', '更新'].includes(suf))
      return await this.refreshPanel();
    if (!pre || suf === '列表') return await this.getCharPanelList();
    const queryPanelReg = new RegExp(`${rulePrefix}(.*)面板$`);
    if (queryPanelReg.test(this.e.msg)) return await this.getCharPanel();
    return false;
  }

    async refreshPanel() {
    const uid = await this.getUID();
    this.uid = uid
    let playerInfo = null;
    try {
      playerInfo = await this.getPlayerInfo();
      if (!playerInfo) playerInfo = this.e.player;
      if (!playerInfo) {
          playerInfo = { uid: uid, nickname: `用户${uid}`, level: '??', region_name: '未知服务器' };
      }
    } catch (playerInfoError) {
        playerInfo = { uid: uid, nickname: `用户${uid}`, level: '??', region_name: '错误', error: playerInfoError.message };
    }

    this.result = null;
    const useEnka = _.get(settings.getConfig('panel'), 'useEnka', true);
    logger.debug(`[panel.js] useEnka 设置值: ${useEnka}`);
    if (!useEnka && this.e.runtime.hasCk) {
      console.log('this.e.runtime.hasCk',this.e.runtime.hasCk)
      try {
          const { api } = await this.getAPI(); // MYS 需要 api 对象
          // MYS 逻辑需要冷却判断
          const lastQueryTime = await redis.get(`ZZZ:PANEL:${uid}:LASTTIME`);
          const panelSettings = settings.getConfig('panel');
          const coldTime = _.get(panelSettings, 'interval', 300);
          if (lastQueryTime && Date.now() - lastQueryTime < 1000 * coldTime) {
              await this.reply(`${coldTime}秒内只能刷新一次，请稍后再试`);
              return false;
          }
          await redis.set(`ZZZ:PANEL:${uid}:LASTTIME`, Date.now());
          await this.reply('正在刷新面板列表 (MYS API)，请稍候...');

          const mysResult = await refreshPanelFunction(api); // 调用 MYS 刷新函数
          if (!mysResult) { throw new Error('MYS API 返回空结果'); }
          this.result = mysResult; // <<< MYS 结果赋给 this.result
          logger.mark('[panel.js] MYS API refreshPanelFunction 调用完成.');
      } catch (mysError) {
          logger.error(' MYS API 刷新出错:', mysError);
           await this.refreshByEnka();
      }

    } else {
       await this.refreshByEnka();
    }

    if (this.result && Array.isArray(this.result)) { // 确保有有效数据 (非 null, 是数组)
      // 并且至少包含一个角色数据才存，避免存空数组？(可选)
      if (this.result.length > 0) {
          try {

            await updatePanelData(uid, this.result);

          } catch (cacheError) {
            logger.error('出错:', cacheError);
            // 记录错误，但可能继续
          }
      } else {
          logger.debug('[panel.js] 获取到的角色列表为空数组，不执行缓存更新。');
          // 如果是 Enka 路径且展示柜为空，这是正常情况
      }
    } else {
      logger.debug('[panel.js] 没有有效的角色列表数据 (this.result)，跳过缓存更新。');
      // 如果之前的步骤没有 return false，这里可能需要提示用户
      if (!useEnka) { // MYS 失败的情况
          await this.reply('未能获取或处理有效的面板列表数据。');
          return false; // 如果 MYS 失败且结果无效，应该退出
      }
      // 如果是 Enka 路径且结果无效/非数组，也提示并退出
      await this.reply('处理后的面板数据格式无效。');
      return false;
    }
    const currentResult = this.result || [];
    const newCharCount = (currentResult.length > 0 && currentResult[0]?.isNew !== undefined)
                         ? currentResult.filter(item => item && item.isNew).length
                         : 0;
    const finalData = {
      newChar: newCharCount,
      list: currentResult,
      player: playerInfo,
      uid: uid
    };

    try {
        await this.render('panel/refresh.html', finalData);
    } catch (renderError) {
        logger.error('[panel.js] 渲染 refresh.html 模板失败:', renderError);
        await this.reply(`生成刷新结果图片时出错: ${renderError.message}`);
    }
  }

  async refreshByEnka(){
    //enka兜底 todo:数据转换修正..
      logger.debug('[panel.js] 进入 Enka 逻辑块');
      try {
        const enkaData = await getZzzEnkaData(this.uid);
        if (!enkaData || enkaData === -1 || !enkaData.PlayerInfo) { throw new Error('获取或验证 Enka 数据失败'); }
        this.result = await _enka_data_to_mys_data(enkaData);
        return this.result;
      } catch (enkaError) {
         logger.error('处理 Enka 逻辑时出错:', enkaError);
         await this.reply(`处理Enka数据时出错: ${enkaError.message}`);
         return false;
      }
  }
  async getCharPanelListTool(uid, origin = false) {
    if (!uid) {
      return false;
    }
    if (origin) {
      const result = getPanelListOrigin(uid);
      return result;
    }
    const result = getPanelList(uid);
    return result;
  }

  async getCharPanel() {
    const uid = await this.getUID();
    const reg = new RegExp(`${rulePrefix}(.+)面板$`);
    const match = this.e.msg.match(reg);
    if (!match) return false;
    const name = match[4];
    const data = getPanelOrigin(uid, name);
    if (!data) {
      await this.reply(`未找到角色${name}的面板信息，请先刷新面板`);
      return;
    }
    let handler = this.e.runtime.handler || {};

    if (handler.has('zzz.tool.panel')) {
      await handler.call('zzz.tool.panel', this.e, {
        uid,
        data: data,
        needSave: false,
      });
    }
    return false;
  }

  async getCharPanelTool(e, _data = {}) {
    if (e) this.e = e;
    if (e?.reply) this.reply = e.reply;

    const {
      uid = undefined,
      data = undefined,
      needSave = true,
      reply = true,
      needImg = true
    } = _data;
    if (!uid) {
      await this.reply('UID为空');
      return false;
    }
    if (!data) {
      await this.reply('数据为空');
      return false;
    }
    if (needSave) {
      updatePanelData(uid, [data]);
    }
    const timer = setTimeout(() => {
      const msg = '查询成功，正在下载图片资源，请稍候。'
      if (this?.reply && needImg) {
        this.reply(msg);
      } else {
        logger.mark(msg)
      }
    }, 5000);
    const parsedData = formatPanelData(data);
    await parsedData.get_detail_assets();
    clearTimeout(timer);
    const finalData = {
      uid,
      charData: parsedData,
    };
    const image = needImg ? await this.render('panel/card.html', finalData, {
      retType: 'base64',
    }) : needImg;

    if (reply) {
      const res = await this.reply(image);
      if (res?.message_id && parsedData.role_icon)
        await redis.set(
          `ZZZ:PANEL:IMAGE:${res.message_id}`,
          parsedData.role_icon,
          {
            EX: 3600 * 3,
          }
        );
      return {
        message: res,
        image,
      };
    }

    return image;
  }
  async proficiency() {
    const uid = await this.getUID();
    const result = getPanelList(uid);
    if (!result) {
      await this.reply('未找到面板数据，请先%刷新面板');
      return false;
    }
    await this.getPlayerInfo();
    result.sort((a, b) => {
      return b.proficiency_score - a.proficiency_score;
    });
    const WeaponCount = result.filter(item => item?.weapon).length,
      SWeaponCount = result.filter(
        item => item?.weapon && item.weapon.rarity === 'S'
      ).length;
    const general = {
      total: result.length,
      SCount: result.filter(item => item.rarity === 'S').length,
      SWeaponRate: (SWeaponCount / WeaponCount) * 100,
      SSSCount: result.reduce((acc, item) => {
        if (item.equip) {
          acc += item.equip.filter(
            equip => equip.comment === 'SSS' || equip.comment === 'ACE'
          ).length;
        }
        return acc;
      }, 0),
      highRank: result.filter(item => item.rank > 4).length,
    };
    const timer = setTimeout(() => {
      if (this?.reply) {
        this.reply('查询成功，正在下载图片资源，请稍候。');
      }
    }, 5000);
    for (const item of result) {
      await item.get_small_basic_assets();
    }
    clearTimeout(timer);
    const finalData = {
      general,
      list: result,
    };
    await this.render('proficiency/index.html', finalData);
  }
  async getCharOriImage() {
    let source;
    if (this.e.getReply) {
      source = await this.e.getReply();
    } else if (this.e.source) {
      if (this.e.group?.getChatHistory) {
        // 支持at图片添加，以及支持后发送
        source = (
          await this.e.group.getChatHistory(this.e.source?.seq, 1)
        ).pop();
      } else if (this.e.friend?.getChatHistory) {
        source = (
          await this.e.friend.getChatHistory(this.e.source?.time + 1, 1)
        ).pop();
      }
    }
    const id = source?.message_id;
    if (!id) {
      await this.reply('未找到消息源，请引用要查看的图片');
      return false;
    }
    const image = await redis.get(`ZZZ:PANEL:IMAGE:${id}`);
    if (!image) {
      await this.reply('未找到原图');
      return false;
    }
    await this.reply(segment.image(image));
    return false;
  }
}
