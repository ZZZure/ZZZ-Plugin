import path from 'path';
import fs from 'fs';
import request from '../../utils/request.js';

/**
 * 下载文件
 * @param {string} url 下载地址
 * @param {string} savePath 保存路径
 * @returns {Promise<string | null>} 保存路径
 */
export const downloadFile = async (url, savePath) => {
  // 下载文件
  try {
    const download = await request(url, {}, 5);
    const arrayBuffer = await download.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // 保存文件
    if (!fs.existsSync(path.dirname(savePath))) {
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
    }
    fs.writeFileSync(savePath, buffer);
    // 返回保存路径
    return savePath;
  } catch (error) {
    return null;
  }
};

/**
 * 查看文件是否存在，如果存在则返回路径，否则下载文件
 * @param {string} url 下载地址
 * @param {string} savePath 保存路径
 * @returns {Promise<string | null>} 保存路径
 */
export const checkFile = async (url, savePath) => {
  if (fs.existsSync(savePath)) {
    const stats = fs.statSync(savePath);
    if (stats.size > 0) {
      return savePath;
    }
  }
  const download = await downloadFile(url, savePath);
  return download;
};
