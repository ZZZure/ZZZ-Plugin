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
          reg: `${rulePrefix}(更新)?\\S+攻略(\\d+)?$`,
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
    ];
    this.source = [
      '新艾利都快讯',
      '清茶沐沐Kiyotya',
      '小橙子阿',
      '猫冬',
      '月光中心',
    ];
    // 最大攻略数量
    this.maxNum = this.source.length;

    // 最大显示攻略数量
    this.maxForwardGuides = 4;
  }

  async init() {
    for (let group = 1; group <= this.maxNum; group++) {
      let guideFolder = this.getGuideFolder(group);
      if (!fs.existsSync(guideFolder)) {
        fs.mkdirSync(guideFolder, { recursive: true });
      }
    }
  }

  getGuideFolder(groupIndex) {
    let guideFolder = path.join(ZZZ_GUIDES_PATH, this.source[groupIndex - 1]);
    return guideFolder;
  }

  getGuidePath(groupIndex, characterName) {
    let filename = `role_guide_${characterName}.png`;
    let guidePath = path.join(this.getGuideFolder(groupIndex), filename);
    return guidePath;
  }

  canGetImageFromFile(guidePath, isUpdate) {
    return fs.existsSync(guidePath) && !isUpdate;
  }

  async Guide() {
    let reg = new RegExp(`${rulePrefix}(更新)?(\\S+)攻略(\\d+)?$`);
    let [
      ,
      ,
      ,
      ,
      isUpdate,
      name,
      group = '1', // setting.getConfig('mys')?.defaultSource
    ] = this.e.msg.match(reg);
    group = +group;
    if (group > this.maxNum) {
      await this.reply(`超过攻略数量（${this.maxNum}）`);
      return;
    }
    let id = atlasToName(name);
    if (!id) {
      await this.reply('该角色不存在');
      return;
    }

    if (group === 0) {
      // eslint-disable-next-line no-unused-vars
      let msg = [];
      // eslint-disable-next-line no-unused-vars
      for (let i = 1; i <= this.maxNum; i++) {
        let guidePath = this.getGuidePath(i, name);
        if (this.canGetImageFromFile(guidePath, isUpdate)) {
          msg.push(segment.image(`file://${guidePath}`));
          continue;
        }
        if (i < this.maxForwardGuides && (await this.getImg(name, i))) {
          msg.push(segment.image(`file://${guidePath}`));
        }
      }
      if (msg.length) {
        await this.reply(await common.makeForwardMsg(this.e, [msg]));
      }
      return false;
    }

    let guidePath = this.getGuidePath(group, name);
    if (this.canGetImageFromFile(guidePath, isUpdate)) {
      await this.e.reply(segment.image(`file://${guidePath}`));
      return;
    }

    if (await this.getImg(name, group)) {
      await this.e.reply(segment.image(`file://${guidePath}`));
    }
  }

  /** 下载攻略图 */
  async getImg(name, group) {
    let msyRes = [];
    this.collection_id[group].forEach(id =>
      msyRes.push(this.getData(this.url + id))
    );

    try {
      msyRes = await Promise.all(msyRes);
    } catch (error) {
      this.e.reply('暂无攻略数据，请稍后再试');
      console.log(`米游社接口报错：${error}}`);
      return false;
    }

    let posts = lodash.flatten(lodash.map(msyRes, item => item.data.posts));
    let url;
    for (let val of posts) {
      if (val.post.subject.replace(/【[^】]*本[^】]*】/g, '').includes(name)) {
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
        break;
      }
    }
    if (!url) {
      this.e.reply(
        `暂无${name}攻略（${this.source[group - 1]}）\n请尝试其他的攻略来源查询`
      );
      return false;
    }
    console.log(`${this.e.logFnc} 下载${name}攻略图`);

    const download = await fetch(url);
    const arrayBuffer = await download.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let guidePath = this.getGuidePath(group, name);
    fs.writeFileSync(guidePath, buffer);

    console.log(`${this.e.logFnc} 下载${name}攻略成功`);

    return true;
  }

  /** 获取数据 */
  async getData(url) {
    let response = await fetch(url, { method: 'get' });
    if (!response.ok) {
      return false;
    }
    return await response.json();
  }
}
