import { downloadFile } from '../lib/download/core.js';
import common from '../../../../lib/common/common.js';
import { imageResourcesPath } from '../lib/path.js';
import { rulePrefix } from '../lib/common.js';
import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import { char } from '../lib/convert.js';
import guides from '../lib/guides.js';
import fetch from 'node-fetch';
import lodash from 'lodash';
import path from 'path';
import _ from 'lodash';
import fs from 'fs';
const ZZZ_GUIDES_PATH = path.join(imageResourcesPath, 'guides');
export class Guide extends ZZZPlugin {
    url;
    constructor() {
        super({
            name: '[ZZZ-Plugin]Guide',
            dsc: '#zzz角色攻略',
            event: 'message',
            priority: _.get(settings.getConfig('priority'), 'guide', 70),
            rule: [
                {
                    reg: `^${rulePrefix}攻略(说明|帮助)$`,
                    fnc: 'GuideHelp'
                },
                {
                    reg: `${rulePrefix}(更新)?\\S+攻略(\\d+|all)?$`,
                    fnc: 'Guide'
                }
            ]
        });
        this.url =
            'https://bbs-api.mihoyo.com/post/wapi/getPostFullInCollection?&gids=8&collection_id=';
    }
    getGuideFolder(groupIndex) {
        const guideFolder = path.join(ZZZ_GUIDES_PATH, guides.guideSources[groupIndex - 1] || '');
        return guideFolder;
    }
    async getGuidePath(groupIndex, characterName, isUpdate = false) {
        const filename = `role_guide_${characterName}.png`;
        const guidePath = path.join(this.getGuideFolder(groupIndex), filename);
        if (fs.existsSync(guidePath) && !isUpdate)
            return guidePath;
        return await this.getImg(characterName, groupIndex);
    }
    async Guide() {
        const reg = new RegExp(`${rulePrefix}(更新|刷新)?(\\S+)攻略(\\d+|all)?$`);
        const match = this.e.msg.match(reg);
        if (!match)
            return false;
        const [, , , , isUpdate, aliasRaw, groupRaw = _.get(settings.getConfig('guide'), 'default_guide', 1).toString()] = match;
        const alias = aliasRaw;
        let group = groupRaw;
        if (group === 'all') {
            group = '0';
        }
        group = Number(group);
        if (group > guides.guideMaxNum) {
            return this.reply(`超过攻略数量（${guides.guideMaxNum}）`);
        }
        if (alias === '设置默认' || alias === '设置所有') {
            return false;
        }
        const name = char.aliasToName(alias);
        if (!name) {
            return this.reply('该角色不存在');
        }
        if (group === 0) {
            const msg = [];
            for (let i = 1; i <=
                Number(_.get(settings.getConfig('guide'), 'max_forward_guides', 4)); i++) {
                const guidePath = await this.getGuidePath(i, name, !!isUpdate);
                if (guidePath) {
                    msg.push(segment.image(guidePath));
                }
                else {
                    msg.push(`暂无${name}攻略 (${guides.guideSources[i - 1]})`);
                }
            }
            if (msg.length) {
                await this.reply(await common.makeForwardMsg(this.e, msg));
            }
        }
        const guidePath = await this.getGuidePath(group, name, !!isUpdate);
        if (!guidePath) {
            return this.e.reply(`暂无${name}攻略 (${guides.guideSources[group - 1]})\n请尝试其他的攻略来源查询`);
        }
        await this.e.reply(segment.image(guidePath));
    }
    async getImg(name, group) {
        let mysRes = [];
        guides.collection_id[group].forEach(id => mysRes.push(this.getData(this.url + id)));
        try {
            mysRes = await Promise.all(mysRes);
        }
        catch (error) {
            console.log(`米游社接口报错：${error}}`);
            this.e.reply('暂无攻略数据，请稍后再试');
            return false;
        }
        const filtered_name = name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '');
        const posts = lodash.flatten(lodash.map(mysRes, item => item.data.posts));
        let url;
        for (const val of posts) {
            if (val.post.subject
                .replace(/【[^】]*本[^】]*】/g, '')
                .includes(filtered_name)) {
                let max = 0;
                val.image_list.forEach((v, i) => {
                    if (Number(v.size) >= Number(val.image_list[max].size) &&
                        v.format != 'gif') {
                        max = i;
                    }
                });
                url = val.image_list[max].url;
                url += '?x-oss-process=image/resize,s_1200/quality,q_90/auto-orient,0/interlace,1/format,jpg';
                break;
            }
        }
        if (!url) {
            return false;
        }
        logger.debug(`${this.e.logFnc} 下载${name}攻略图 - ${guides.guideSources[group - 1]}`);
        const filename = `role_guide_${name}.png`;
        const guidePath = path.join(this.getGuideFolder(group), filename);
        const download = await downloadFile(url, guidePath);
        logger.debug(`${this.e.logFnc} 下载${name}攻略成功 - ${guides.guideSources[group - 1]}`);
        return download;
    }
    async getData(url) {
        const response = await fetch(url, { method: 'get' });
        if (!response.ok) {
            return false;
        }
        return await response.json();
    }
    async GuideHelp() {
        const reply_msg = [
            '绝区零角色攻略帮助:',
            '%艾莲攻略+攻略id',
            '%更新艾莲攻略+攻略id',
            '%设置默认攻略+攻略id',
            '%设置所有攻略显示个数+攻略id',
            '示例: %艾莲攻略2',
            '',
            '攻略来源:'
        ].concat(guides.guideSources.map((element, index) => `${index + 1}: ${element}`));
        await this.e.reply(reply_msg.join('\n'));
    }
}
