import { char } from '../../lib/convert.js';
import { downloadFile } from '../../lib/download.js';
import { imageResourcesPath } from '../../lib/path.js';
import path from 'path';
export async function uploadCharacterImg() {
  if (!this.e.isMaster) {
    this.reply('只有主人才能添加...');
    return false;
  }
  const reg = /(上传|添加)(.+)(角色|面板)图$/;
  const match = this.e.msg.match(reg);
  if (!match) {
    return false;
  }
  const charName = match[2].trim();
  const name = char.aliasToName(charName);
  const images = [];
  // 下面方法来源于miao-plugin/apps/character/ImgUpload.js
  for (const val of this.e.message) {
    if (val.type === 'image') {
      images.push(val);
    }
  }
  if (images.length === 0) {
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
    if (source) {
      for (const val of source.message) {
        if (val.type === 'image') {
          images.push(val);
        } else if (val.type === 'xml' || val.type === 'forward') {
          let resid;
          try {
            resid = val.data
              .match(/m_resid="(\d|\w|\/|\+)*"/)[0]
              .replace(/m_resid=|"/g, '');
          } catch (err) {
            resid = val.id;
          }
          if (!resid) break;
          let message = await this.e.bot.getForwardMsg(resid);
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
  logger.debug('images', images);
  if (images.length <= 0) {
    this.reply(
      '消息中未找到图片，请将要发送的图片与消息一同发送或引用要添加的图像。'
    );
    return false;
  }
  const resourcesImagesPath = imageResourcesPath;
  const panelImagesPath = path.join(resourcesImagesPath, `panel/${name}`);
  let success = 0;
  let failed = 0;
  for (const image of images) {
    let fileName = new Date().getTime().toString();
    let fileType = 'png';
    if (val.file) {
      fileName = val.file.substring(0, val.file.lastIndexOf('.'));
      fileType = val.file.substring(val.file.lastIndexOf('.') + 1);
    }
    if (response.headers.get('content-type') === 'image/gif') {
      fileType = 'gif';
    }
    const filePath = path.join(panelImagesPath, `${fileName}.${fileType}`);
    const result = await downloadFile(image.url, filePath);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }
  this.reply(`成功上传${success}张图片，失败${failed}张图片。`);
  return false;
}
