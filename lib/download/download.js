import path from 'path';
import fs from 'fs';
import { checkFile } from './core.js';
import { getResourceRemotePath } from '../assets.js';
import * as MysURL from '../assets/mysurl.js';
import * as HakushURL from '../assets/hakushurl.js';
import * as LocalURI from './const.js';
/**
 * 下载米游社图片
 * @param {keyof MysURL} base 远程地址
 * @param {keyof LocalURI} localBase 本地地址
 * @param {string} filename 文件名
 * @param {keyof MysURL} newBase 新远程地址
 * @returns {Promise<string | null>} 保存路径
 */
export const downloadMysImage = async (
  base,
  localBase,
  filename,
  newBase = ''
) => {
  base = MysURL[base];
  localBase = LocalURI[localBase];
  if (!!newBase) {
    newBase = MysURL[newBase];
  }
  const finalPath = path.join(localBase, filename);
  let url = `${base}/${filename}`;
  let result = await checkFile(url, finalPath);
  if (!result && !!newBase) {
    url = `${newBase}/${filename}`;
    result = await checkFile(url, finalPath);
  }
  return result;
};

/**
 * 下载资源库图片
 *  @param {Parameters<getResourceRemotePath>[0]} remoteLabel 远程地址
 *  @param {keyof LocalURI} localBase 本地地址
 *  @param {string} filename 文件名
 *  @param {string} replaceFilename 替换文件名(如果资源不存在)
 *  @returns {Promise<string | null>} 保存路径
 */
export const downloadResourceImage = async (
  remoteLabel,
  localBase,
  filename,
  replaceFilename = ''
) => {
  localBase = LocalURI[localBase];
  const finalPath = path.join(localBase, filename);
  const url = await getResourceRemotePath(remoteLabel, filename);
  let result = await checkFile(url, finalPath);
  if (!result && !!replaceFilename) {
    const finalPath = path.join(localBase, replaceFilename);
    const url = await getResourceRemotePath(remoteLabel, replaceFilename);
    result = await checkFile(url, finalPath);
  }
  return result;
};

/**
 * 下载Hakush文件
 * @param {keyof HakushURL} base 远程地址
 * @param {keyof LocalURI} localBase 本地地址
 * @param {string} filename 文件名
 * @returns {Promise<object | null>} 文件内容（JSON）
 */
export const downloadHakushFile = async (base, localBase, filename = '') => {
  base = HakushURL[base];
  localBase = LocalURI[localBase];
  const finalPath = path.join(localBase, filename);
  let url = base;
  if (filename) {
    url += `/${filename}`;
  }
  const filepath = await checkFile(url, finalPath);
  if (filepath) {
    // 打开文件
    const file = fs.openSync(filepath, 'r');
    // 读取文件内容
    const content = fs.readFileSync(file);
    // 关闭文件
    fs.closeSync(file);
    // 返回文件内容
    return JSON.parse(content.toString());
  } else {
    return null;
  }
};
