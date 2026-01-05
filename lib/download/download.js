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
 * @returns {Promise<string | null>} 保存路径
 */
export const downloadMysImage = async (base, localBase, filename) => {
  base = MysURL[base];
  localBase = LocalURI[localBase];
  const finalPath = path.join(localBase, filename);
  let url = `${base}/${filename}`;
  let result = await checkFile(url, finalPath);
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
  if (fs.existsSync(finalPath) && fs.statSync(finalPath).size > 0) {
    return finalPath;
  }
  // 防止短时间内重复请求同一无效节点资源
  const cdKey = `ZZZ:RESOURCE:API:CD:${remoteLabel}:${localBase}:${filename}:${replaceFilename}`;
  let result = null;
  if (!await redis.get(cdKey)) {
    const url = await getResourceRemotePath(remoteLabel, filename);
    result = await checkFile(url, finalPath);
    if (!result && !!replaceFilename) {
      const finalPath = path.join(localBase, replaceFilename);
      const url = await getResourceRemotePath(remoteLabel, replaceFilename);
      result = await checkFile(url, finalPath);
    }
    await redis.set(cdKey, '1', {
      EX: 3600 // CD 1小时
    });
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
  const oriBase = base;
  base = HakushURL[base];
  localBase = LocalURI[localBase];
  const finalPath = path.join(localBase, filename);
  let url = base;
  if (filename) {
    url += `/${filename}`;
  }
  // logger.debug('Hakush file url:', url);
  const filepath = await checkFile(url, finalPath);
  if (filepath) {
    // 如果是JSON文件，返回JSON对象
    if (filename.endsWith('.json')) {
      // 打开文件
      const file = fs.openSync(filepath, 'r');
      // 读取文件内容
      const content = fs.readFileSync(file).toString();
      // 关闭文件
      fs.closeSync(file);
      // 返回文件内容
      const data = JSON.parse(content);
      // 测试数据每次请求都重新下载
      if (
        content.includes('(Test') ||
        !data ||
        (oriBase === 'ZZZ_CHARACTER' && (
          data.PartnerInfo?.ImpressionF === '...' ||
          data.PartnerInfo?.ImpressionM === '...' ||
          !Object.keys(data.Skin || {}).length ||
          !Object.keys(data.SkillList || {}).length
        ))
      ) {
        logger.debug('Hakush test file, redownloading:', url);
        fs.rmSync(filepath);
        const filepath_new = await checkFile(url, finalPath);
        const file = fs.openSync(filepath_new, 'r');
        const content = fs.readFileSync(file).toString();
        fs.closeSync(file);
        return JSON.parse(content);
      }
      return data;
    } else {
      return filepath;
    }
  } else {
    return null;
  }
};
