import { char } from '../../lib/convert.js';
import { downloadFile } from '../../lib/download/core.js';
import { imageResourcesPath } from '../../lib/path.js';
import common from '../../../../../lib/common/common.js';
import fs from 'fs';
import path from 'path';
export async function uploadCharacterImg(e) {
    e ||= this.e;
    if (!e.isMaster) {
        return e.reply('只有主人才能添加', false, { at: true, recallMsg: 100 });
    }
    const reg = /(上传|添加)(.+)(角色|面板)图$/;
    const match = e.msg.match(reg);
    if (!match) {
        return false;
    }
    const charName = match[2].trim();
    const name = char.aliasToName(charName);
    if (!name) {
        return e.reply('未找到对应角色', false, { at: true, recallMsg: 100 });
    }
    const images = [];
    for (const val of e.message) {
        if (val.type === 'image') {
            images.push(val);
        }
    }
    if (images.length === 0) {
        let source;
        if (e.getReply) {
            source = await e.getReply();
        }
        else if (e.source) {
            if (e.group?.getChatHistory) {
                source = (await e.group.getChatHistory(e.source?.seq, 1)).pop();
            }
            else if (e.friend?.getChatHistory) {
                source = (await e.friend.getChatHistory(e.source?.time + 1, 1)).pop();
            }
        }
        if (source) {
            for (const val of source.message) {
                if (val.type === 'image') {
                    images.push(val);
                }
                else if (val.type === 'xml' || val.type === 'forward') {
                    let resid;
                    try {
                        resid = val.data
                            .match(/m_resid="(\d|\w|\/|\+)*"/)[0]
                            .replace(/m_resid=|"/g, '');
                    }
                    catch (err) {
                        resid = val.id;
                    }
                    if (!resid)
                        break;
                    const message = await e.bot.getForwardMsg(resid);
                    for (const item of message) {
                        for (const i of item.message) {
                            if (i.type === 'image') {
                                images.push(i);
                            }
                        }
                    }
                }
            }
        }
    }
    if (images.length <= 0) {
        return e.reply('消息中未找到图片，请将要发送的图片与消息一同发送或引用要添加的图像。', false, { at: true, recallMsg: 100 });
    }
    const resourcesImagesPath = imageResourcesPath;
    const panelImagesPath = path.join(resourcesImagesPath, `panel/${name}`);
    let success = 0;
    let failed = 0;
    for (const image of images) {
        let fileName = new Date().getTime().toString();
        let fileType = 'png';
        if (image.file) {
            fileName = image.file.substring(0, image.file.lastIndexOf('.'));
            fileType = image.file.substring(image.file.lastIndexOf('.') + 1);
        }
        const filePath = path.join(panelImagesPath, `${fileName}.${fileType}`);
        const result = await downloadFile(image.url, filePath);
        if (result) {
            success++;
        }
        else {
            failed++;
        }
    }
    return e.reply(`成功上传${success}张图片，失败${failed}张图片。`, false, {
        at: true,
        recallMsg: 100
    });
}
export async function getCharacterImages(e) {
    e ||= this.e;
    const reg = /(获取|查看)(.+)(角色|面板)图(\d+)?$/;
    const match = e.msg.match(reg);
    if (!match) {
        return false;
    }
    const charName = match[2].trim();
    const name = char.aliasToName(charName);
    let page = match[4];
    if (!name) {
        return e.reply('未找到对应角色', false, { at: true, recallMsg: 100 });
    }
    const pageSize = 5;
    const resourcesImagesPath = imageResourcesPath;
    const panelImagesPath = path.join(resourcesImagesPath, `panel/${name}`);
    const files = fs.readdirSync(panelImagesPath);
    const images = [];
    for (const file of files) {
        images.push(path.join(panelImagesPath, file));
    }
    page = Number(page);
    if (!page || page < 1) {
        page = 1;
    }
    const start = (page - 1) * pageSize;
    const end = page * pageSize;
    if (start >= images.length) {
        return e.reply('哪有这么多图片', false, { at: true, recallMsg: 100 });
    }
    const imagePaths = images.slice(start, end);
    const imageMsg = imagePaths.map(imagePath => {
        const id = String(images.findIndex(value => value === imagePath) + 1);
        const msg = [`ID：${id}`, segment.image(imagePath)];
        return msg;
    });
    imageMsg.unshift(`当前页数：${page}，总页数：${Math.ceil(images.length / pageSize)}，查询指定页数请在指令后面加上页码。`);
    imageMsg.push('删除或者添加后会重新排序ID，此时若想删除，请重新获取图片列表，否则可能会删除错误的图片。');
    if (imageMsg.length)
        await e.reply(await common.makeForwardMsg(e, imageMsg));
}
export async function deleteCharacterImg(e) {
    e ||= this.e;
    if (!e.isMaster) {
        return e.reply('只有主人才能删除', false, { at: true, recallMsg: 100 });
    }
    const reg = /(删除)(.+)(角色|面板)图(.+)$/;
    const match = e.msg.match(reg);
    if (!match) {
        return false;
    }
    const charName = match[2].trim();
    const name = char.aliasToName(charName);
    if (!name) {
        return e.reply('未找到对应角色', false, { at: true, recallMsg: 100 });
    }
    const ids = match[4].split(/[,，、\s]+/);
    const resourcesImagesPath = imageResourcesPath;
    const panelImagesPath = path.join(resourcesImagesPath, `panel/${name}`);
    const files = fs.readdirSync(panelImagesPath);
    const images = [];
    for (const file of files) {
        images.push(path.join(panelImagesPath, file));
    }
    const success = [];
    const failed = [];
    for (const id of ids) {
        const index = Number(id) - 1;
        if (index < 0 || index >= images.length) {
            failed.push(id);
            continue;
        }
        const imagePath = images[index];
        fs.unlinkSync(imagePath);
        success.push(id);
    }
    const msgs = [
        `成功删除ID为${success.join(',')}的图片`,
        failed.length ? `删除失败ID为${failed.join(',')}` : '无失败ID',
        '删除后会重新排序ID，若想要再次删除，请重新获取图片列表，否则可能会删除错误的图片。'
    ];
    return e.reply(await common.makeForwardMsg(e, msgs));
}
