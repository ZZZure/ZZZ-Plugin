import {ZZZPlugin} from '../lib/plugin.js';
import {rulePrefix} from '../lib/common.js';
import {atlasToName} from '../lib/convert/char.js'
import path from 'path';
import fs from 'fs';
import {imageResourcesPath} from '../lib/path.js'
import fetch from 'node-fetch'
import lodash from 'lodash'

const ZZZ_GUIDES_PATH = path.join(imageResourcesPath, 'guides');

export class Guide extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Guide',
      dsc: '#zzz角色攻略',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: `${rulePrefix}角色攻略\\S+$`,
          fnc: 'Guide',
        },
      ],
    });

    this.url = 'https://bbs-api.mihoyo.com/post/wapi/getPostFullInCollection?&gids=8&collection_id='
    this.collection_id = [
      [],
      // 来源：新艾利都快讯
      [2712859],
    ]
    this.source = ['新艾利都快讯']
  }
  async Guide() {
    let reg = new RegExp(`${rulePrefix}角色攻略(\\S+)$`);
    let [,,,, name] = this.e.msg.match(reg);
    let id = atlasToName(name);
    if (!id) {
      await this.reply('该角色不存在');
      return;
    }
    const filename = `role_guide_${name}.png`;
    const guidePath = path.join(ZZZ_GUIDES_PATH, filename);
    if (fs.existsSync(guidePath)) {
      await this.e.reply(segment.image(`file://${guidePath}`));
      return;
    }
    //目前攻略较少,暂为1
    if (await this.getImg(name, 1)) {
      await this.e.reply(segment.image(`file://${guidePath}`))
    }

  }

  /** 下载攻略图 */
  async getImg (name, group) {
    let msyRes = []
    this.collection_id[group].forEach((id) => msyRes.push(this.getData(this.url + id)))

    try {
      msyRes = await Promise.all(msyRes)
    } catch (error) {
      this.e.reply('暂无攻略数据，请稍后再试')
      console.log(`米游社接口报错：${error}}`)
      return false
    }

    let posts = lodash.flatten(lodash.map(msyRes, (item) => item.data.posts))
    let url
    for (let val of posts) {
      if (val.post.subject.includes(name)) {
        let max = 0
        val.image_list.forEach((v, i) => {
          if (Number(v.size) >= Number(val.image_list[max].size)) max = i
        })
        url = val.image_list[max].url
        break
      }
    }
    if (!url) {
      this.e.reply(`暂无${name}攻略（${this.source[group - 1]}）\n请尝试其他的攻略来源查询`)
      return false
    }
    console.log(`${this.e.logFnc} 下载${name}攻略图`)

    const download = await fetch(url);
    const arrayBuffer = await download.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `role_guide_${name}.png`;
    const avatarPath = path.join(ZZZ_GUIDES_PATH, filename);
    if (!fs.existsSync(ZZZ_GUIDES_PATH)) {
      fs.mkdirSync(ZZZ_GUIDES_PATH, { recursive: true });
    }
    fs.writeFileSync(avatarPath , buffer);

    console.log(`${this.e.logFnc} 下载${name}攻略成功`)

    return true
  }

  /** 获取数据 */
  async getData (url) {
    let response = await fetch(url, { method: 'get' })
    if (!response.ok) {
      return false
    }
    return await response.json()
  }
}
