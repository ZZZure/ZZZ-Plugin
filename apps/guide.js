import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import lodash from 'lodash';
import common from '../../../lib/common/common.js';
import { ZZZPlugin } from '../lib/plugin.js';
import { rulePrefix } from '../lib/common.js';
import { atlasToName } from '../lib/convert/char.js';
import { imageResourcesPath } from '../lib/path.js';
import _ from 'lodash';
import settings from '../lib/settings.js';
import { downloadFile } from '../lib/download.js';

const ZZZ_GUIDES_PATH = path.join(imageResourcesPath, 'guides');

export class Guide extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Guide',
      dsc: '#zzz角色攻略',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'guide', 70),
      rule: [
        {
          reg: `^${rulePrefix}攻略(说明|帮助)$`,
          fnc: 'GuideHelp',
        },
        {
          reg: `^${rulePrefix}设置默认攻略(\\d+|all)$`,
          fnc: 'SetDefaultGuide',
        },
        {
          reg: `^${rulePrefix}设置所有攻略显示个数(\\d+)$`,
          fnc: 'SetMaxForwardGuide',
        },
        {
          reg: `${rulePrefix}(更新)?\\S+攻略(\\d+|all)?$`,
          fnc: 'Guide',
        },
      ],
    });

    this.url =
      'https://bbs-api.mihoyo.com/post/wapi/getPostFullInCollection?&gids=8&collection_id=';
    this.collection_id = [
      [],
      // 来源：新艾利都快讯
      [2712859],
      [2727116],
      [2721968],
      [2724610],
      [2722266],
      [2723586],
      [2716049],
    ];
    this.source = [
      '新艾利都快讯',
      '清茶沐沐Kiyotya',
      '小橙子阿',
      '猫冬',
      '月光中心',
      '苦雪的清心花凉糕Suki',
      'HoYo青枫',
    ];
    // 最大攻略数量
    this.maxNum = this.source.length;

    // 最大显示攻略数量
    this.maxForwardGuides = _.get(
      settings.getConfig('guide'),
      'max_forward_guides',
      4
    );
  }

  // async init() {
  //   for (let group = 1; group <= this.maxNum; group++) {
  //     let guideFolder = this.getGuideFolder(group);
  //     if (!fs.existsSync(guideFolder)) {
  //       fs.mkdirSync(guideFolder, { recursive: true });
  //     }
  //   }
  // }

  getGuideFolder(groupIndex) {
    let guideFolder = path.join(ZZZ_GUIDES_PATH, this.source[groupIndex - 1]);
    return guideFolder;
  }

  async getGuidePath(groupIndex, characterName, isUpdate = false) {
    const filename = `role_guide_${characterName}.png`;
    const guidePath = path.join(this.getGuideFolder(groupIndex), filename);
    if (fs.existsSync(guidePath) && !isUpdate) return guidePath;
    return await this.getImg(characterName, groupIndex);
  }

  async Guide() {
    let reg = new RegExp(`${rulePrefix}(更新|刷新)?(\\S+)攻略(\\d+|all)?$`);
    let [
      ,
      ,
      ,
      ,
      isUpdate,
      atlas,
      group = _.get(settings.getConfig('guide'), 'default_guide', 1).toString(),
    ] = this.e.msg.match(reg);
    // all -> 0
    if (group == 'all') {
      group = '0';
    }
    group = Number(group);
    if (group > this.maxNum) {
      await this.reply(`超过攻略数量（${this.maxNum}）`);
      return;
    }
    const name = atlasToName(atlas);

    if (!name) {
      await this.reply('该角色不存在');
      return;
    }

    if (group === 0) {
      const msg = [];
      for (let i = 1; i <= this.maxNum; i++) {
        const guidePath = await this.getGuidePath(i, name, !!isUpdate);
        // msg.push(segment.image(`file://${guidePath}`));
        if (guidePath) {
          msg.push(segment.image(guidePath));
        }
      }
      if (msg.length) {
        await this.reply(await common.makeForwardMsg(this.e, [msg]));
      }
      return false;
    }

    const guidePath = await this.getGuidePath(group, name, !!isUpdate);
    await this.e.reply(segment.image(guidePath));
    return false;
  }

  /** 下载攻略图 */
  async getImg(name, group) {
    let mysRes = [];
    this.collection_id[group].forEach(id =>
      mysRes.push(this.getData(this.url + id))
    );

    try {
      mysRes = await Promise.all(mysRes);
    } catch (error) {
      this.e.reply('暂无攻略数据，请稍后再试');
      console.log(`米游社接口报错：${error}}`);
      return false;
    }

    // 搜索时过滤特殊符号，譬如「11号」
    const filtered_name = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
    let posts = lodash.flatten(lodash.map(mysRes, item => item.data.posts));
    let url, created_at, updated_at;
    for (const val of posts) {
      if (
        val.post.subject
          .replace(/【[^】]*本[^】]*】/g, '')
          .includes(filtered_name)
      ) {
        let max = 0;
        val.image_list.forEach((v, i) => {
          if (
            Number(v.size) >= Number(val.image_list[max].size) &&
            v.format != 'gif' // 动图天生 size 会撑得很大
          ) {
            max = i;
          }
        });
        url = val.image_list[max].url;
        created_at = val.post.created_at;
        updated_at = val.post.updated_at;
        break;
      }
    }
    if (!url) {
      this.e.reply(
        `暂无${name}攻略 (${this.source[group - 1]})\n请尝试其他的攻略来源查询`
      );
      return false;
    }
    logger.debug(
      `${this.e.logFnc} 下载${name}攻略图 - ${this.source[group - 1]}`
    );

    const filename = `role_guide_${name}.png`;
    const guidePath = path.join(this.getGuideFolder(group), filename);
    const download = await downloadFile(url, guidePath);

    logger.debug(
      `${this.e.logFnc} 下载${name}攻略成功 - ${this.source[group - 1]}`
    );

    return download;
  }

  /** 获取数据 */
  async getData(url) {
    let response = await fetch(url, { method: 'get' });
    if (!response.ok) {
      return false;
    }
    return await response.json();
  }

  /** %攻略帮助 */
  async GuideHelp() {
    let reply_msg = [
      '绝区零角色攻略帮助:',
      '%艾莲攻略+攻略id',
      '%更新艾莲攻略+攻略id',
      '%设置默认攻略+攻略id',
      '%设置所有攻略显示个数+攻略id',
      '示例: %艾莲攻略2',
      '',
      '攻略来源:',
    ].concat(this.source.map((element, index) => `${index + 1}: ${element}`));
    await this.e.reply(reply_msg.join('\n'));
  }

  /** %设置默认攻略1 */
  async SetDefaultGuide() {
    let match = /设置默认攻略(\d+|all)$/g.exec(this.e.msg);
    let guide_id = match[1];
    if (guide_id == 'all') {
      guide_id = 0;
    }
    guide_id = Number(guide_id);
    if (guide_id > this.maxNum) {
      let reply_msg = [
        '绝区零默认攻略设置方式为:',
        '%设置默认攻略[0123...]',
        `请增加数字0-${this.maxNum}其中一个，或者增加 all 以显示所有攻略`,
        '攻略来源请输入 %攻略帮助 查看',
      ];
      await this.e.reply(reply_msg.join('\n'));
      return;
    }
    settings.setSingleConfig('guide', 'default_guide', guide_id);

    let source_name = guide_id == 0 ? 'all' : this.source[guide_id - 1];
    await this.e.reply(`绝区零默认攻略已设置为: ${guide_id} (${source_name})`);
  }

  /** %设置所有攻略显示个数3 */
  async SetMaxForwardGuide() {
    let match = /设置所有攻略显示个数(\d+)$/g.exec(this.e.msg);
    let max_forward_guide = Number(match[1]);
    this.setSingleConfig('max_forward_guides', max_forward_guide);
    await this.e.reply(`绝区零所有攻略显示个数已设置为: ${max_forward_guide}`);
  }
}
