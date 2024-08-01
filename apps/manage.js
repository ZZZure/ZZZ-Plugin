import { ZZZPlugin } from '../lib/plugin.js';
import { rulePrefix } from '../lib/common.js';
import { getAllEquipID } from '../lib/convert/equip.js';
import { getAllWeaponID } from '../lib/convert/weapon.js';
import { imageResourcesPath } from '../lib/path.js';
import settings from '../lib/settings.js';
import fs from 'fs';
import {
  getRoleImage,
  getSmallSquareAvatar,
  getSquareAvatar,
  getSuitImage,
  getWeaponImage,
} from '../lib/download.js';
import _ from 'lodash';
import { char } from '../lib/convert.js';

export class Panel extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Manage',
      dsc: 'zzzmanage',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'manage', 70),
      rule: [
        {
          reg: `${rulePrefix}下载(全部|所有)资源$`,
          fnc: 'downloadAll',
        },
        {
          reg: `${rulePrefix}删除(全部|所有)资源$`,
          fnc: 'deleteAll',
        },
        {
          reg: `^${rulePrefix}设置默认攻略(\\d+|all)$`,
          fnc: 'setDefaultGuide',
        },
        {
          reg: `^${rulePrefix}设置所有攻略显示个数(\\d+)$`,
          fnc: 'setMaxForwardGuide',
        },
        {
          reg: `^${rulePrefix}设置渲染精度(\\d+)$`,
          fnc: 'setRenderPrecision',
        },
        {
          reg: `^${rulePrefix}刷新抽卡间隔(\\d+)$`,
          fnc: 'setRefreshGachaInterval',
        },
        {
          reg: `^${rulePrefix}刷新面板间隔(\\d+)$`,
          fnc: 'setRefreshPanelInterval',
        },
        {
          reg: `^${rulePrefix}添加(\\S+)别名(\\S+)$`,
          fnc: 'addAlias',
        },
        {
          reg: `^${rulePrefix}删除别名(\\S+)$`,
          fnc: 'deleteAlias',
        },
      ],
    });
  }
  async downloadAll() {
    if (!this.e.isMaster) return false;
    const charIDs = char.getAllCharactersID();
    const equipSprites = getAllEquipID();
    const weaponSprites = getAllWeaponID();
    const result = {
      char: {
        success: 0,
        failed: 0,
        total: charIDs.length,
      },
      charSmallSquare: {
        success: 0,
        failed: 0,
        total: charIDs.length,
      },
      charSquare: {
        success: 0,
        failed: 0,
        total: charIDs.length,
      },
      equip: {
        success: 0,
        failed: 0,
        total: equipSprites.length,
      },
      weapon: {
        success: 0,
        failed: 0,
        total: weaponSprites.length,
      },
    };
    await this.reply(
      '开始下载资源，注意，仅支持下载面板的角色图、武器图、套装图，以及角色卡片的角色头像图。暂不支持下载邦布头像。'
    );
    for (const id of charIDs) {
      try {
        await getSquareAvatar(id);
        result.charSquare.success++;
      } catch (error) {
        logger.error('getSquareAvatar', id, error);
        result.charSquare.failed++;
      }
      try {
        await getSmallSquareAvatar(id);
        result.charSmallSquare.success++;
      } catch (error) {
        logger.error('getSmallSquareAvatar', id, error);
        result.charSmallSquare.failed++;
      }
      try {
        await getRoleImage(id);
        result.char.success++;
      } catch (error) {
        logger.error('getRoleImage', id, error);
        result.char.failed++;
      }
    }
    for (const sprite of equipSprites) {
      try {
        await getSuitImage(sprite);
        result.equip.success++;
      } catch (error) {
        logger.error('getSuitImage', sprite, error);
        result.equip.failed++;
      }
    }
    for (const sprite of weaponSprites) {
      try {
        await getWeaponImage(sprite);
        result.weapon.success++;
      } catch (error) {
        logger.error('getWeaponImage', sprite, error);
        result.weapon.failed++;
      }
    }
    const messages = [
      '资源下载完成（成功的包含先前下载的图片）',
      '角色图需下载' +
        charIDs.length +
        '张，成功' +
        result.char.success +
        '张，失败' +
        result.char.failed +
        '张',
      '角色头像图需下载' +
        charIDs.length +
        '张，成功' +
        result.charSquare.success +
        '张，失败' +
        result.charSquare.failed +
        '张',
      '套装图需下载' +
        equipSprites.length +
        '张，成功' +
        result.equip.success +
        '张，失败' +
        result.equip.failed +
        '张',
      '武器图需下载' +
        weaponSprites.length +
        '张，成功' +
        result.weapon.success +
        '张，失败' +
        result.weapon.failed +
        '张',
    ];
    await this.reply(messages.join('\n'));
  }
  async deleteAll() {
    if (!this.e.isMaster) return false;
    await this.reply('【注意】正在删除所有资源图片，后续使用需要重新下载！');
    if (fs.existsSync(imageResourcesPath)) {
      fs.rmSync(imageResourcesPath, { recursive: true });
    }
    await this.reply('资源图片已删除！');
  }

  /** 设置默认攻略 */
  async setDefaultGuide() {
    if (!this.e.isMaster) {
      this.reply('仅限主人设置');
      return false;
    }
    const match = /设置默认攻略(\d+|all)$/g.exec(this.e.msg);
    let guide_id = match[1];
    if (guide_id == 'all') {
      guide_id = 0;
    }
    guide_id = Number(guide_id);
    if (guide_id > this.maxNum) {
      const reply_msg = [
        '绝区零默认攻略设置方式为:',
        '%设置默认攻略[0123...]',
        `请增加数字0-${this.maxNum}其中一个，或者增加 all 以显示所有攻略`,
        '攻略来源请输入 %攻略帮助 查看',
      ];
      await this.e.reply(reply_msg.join('\n'));
      return;
    }
    settings.setSingleConfig('guide', 'default_guide', guide_id);

    const source_name = guide_id == 0 ? 'all' : this.source[guide_id - 1];
    await this.e.reply(`绝区零默认攻略已设置为: ${guide_id} (${source_name})`);
  }

  /** 设置所有攻略显示个数 */
  async setMaxForwardGuide() {
    if (!this.e.isMaster) {
      this.reply('仅限主人设置');
      return false;
    }
    const match = /设置所有攻略显示个数(\d+)$/g.exec(this.e.msg);
    const max_forward_guide = Number(match[1]);
    settings.setSingleConfig('guide', 'max_forward_guides', max_forward_guide);
    await this.e.reply(`绝区零所有攻略显示个数已设置为: ${max_forward_guide}`);
  }

  /** 设置渲染精度 */
  async setRenderPrecision() {
    if (!this.e.isMaster) {
      this.reply('仅限主人设置');
      return false;
    }
    const match = /渲染精度(\d+)$/g.exec(this.e.msg);
    const render_precision = Number(match[1]);
    if (render_precision < 50) {
      await this.e.reply('渲染精度不能小于50');
      return false;
    }
    if (render_precision > 200) {
      await this.e.reply('渲染精度不能大于200');
      return false;
    }
    settings.setSingleConfig('config', 'render', {
      scale: render_precision,
    });
    await this.e.reply(`绝区零渲染精度已设置为: ${render_precision}`);
  }

  /** 设置刷新抽卡间隔 */
  async setRefreshGachaInterval() {
    if (!this.e.isMaster) {
      this.reply('仅限主人设置');
      return false;
    }
    const match = /刷新抽卡间隔(\d+)$/g.exec(this.e.msg);
    const refresh_gacha_interval = Number(match[1]);
    if (refresh_gacha_interval < 0) {
      await this.e.reply('刷新抽卡间隔不能小于0秒');
      return false;
    }
    if (refresh_gacha_interval > 1000) {
      await this.e.reply('刷新抽卡间隔不能大于1000秒');
      return false;
    }
    settings.setSingleConfig('gacha', 'interval', refresh_gacha_interval);
    await this.e.reply(`绝区零刷新抽卡间隔已设置为: ${refresh_gacha_interval}`);
  }

  /** 设置刷新面板间隔 */
  async setRefreshPanelInterval() {
    if (!this.e.isMaster) {
      this.reply('仅限主人设置');
      return false;
    }
    const match = /刷新面板间隔(\d+)$/g.exec(this.e.msg);
    const refresh_panel_interval = Number(match[1]);
    if (refresh_panel_interval < 0) {
      await this.e.reply('刷新面板间隔不能小于0秒');
      return false;
    }
    if (refresh_panel_interval > 1000) {
      await this.e.reply('刷新面板间隔不能大于1000秒');
      return false;
    }
    settings.setSingleConfig('panel', 'interval', refresh_panel_interval);
    await this.e.reply(`绝区零刷新面板间隔已设置为: ${refresh_panel_interval}`);
  }

  async addAlias() {
    if (!this.e.isMaster) {
      this.reply('仅限主人设置');
      return false;
    }
    const match = /添加(\S+)别名(\S+)$/g.exec(this.e.msg);
    const key = match[1];
    const value = match[2];
    const oriName = char.aliasToName(key);
    const isExist = char.aliasToName(value);
    if (!oriName) {
      await this.e.reply(`未找到 ${value} 的对应角色`);
      return;
    }
    if (isExist) {
      await this.e.reply(`别名 ${value} 已存在`);
      return;
    }
    settings.addArrayleConfig('alias', oriName, value);
    await this.e.reply(`角色 ${key} 别名 ${value} 成功`);
  }

  async deleteAlias() {
    if (!this.e.isMaster) {
      this.reply('仅限主人设置');
      return false;
    }
    const match = /删除别名(\S+)$/g.exec(this.e.msg);
    const key = match[1];
    const oriName = char.aliasToName(key);
    if (!oriName) {
      await this.e.reply(`未找到 ${key} 的对应角色`);
      return;
    }
    if (key === oriName) {
      await this.e.reply(`别名 ${key} 为角色本名，无法删除`);
      return;
    }
    settings.removeArrayleConfig('alias', oriName, key);
    await this.e.reply(`角色 ${key} 别名删除成功`);
  }
}
