import { findLowestLatencyUrl } from '../utils/network.js';
import {
  URL_LIB,
  TYPE_PATH,
  RESOURCE_PATH,
  GUIDE_PATH,
} from './assets/const.js';
// 保存上次找的节点
let lastFindFastestUrl = {
  url: null,
  time: 0,
};

/**
 * 获取最快节点
 * @returns {Promise<string>}
 */
export const getFatestUrl = async () => {
  if (
    lastFindFastestUrl.url &&
    Date.now() - lastFindFastestUrl.time < 1000 * 60 * 5
  ) {
    // 如果上次找到的节点在 5 分钟内，直接返回
    return lastFindFastestUrl.url;
  }
  // 获取最快节点
  const urls = Object.values(URL_LIB);
  const url = findLowestLatencyUrl(urls);
  // 保存节点
  lastFindFastestUrl = {
    url,
    time: Date.now(),
  };
  // 返回节点
  return url;
};

/**
 * 获取远程路径
 * @param {keyof TYPE_PATH} type 资源类型
 * @param {keyof RESOURCE_PATH | keyof GUIDE_PATH} label 资源标签
 * @param {string} name 资源名称
 * @returns
 */
export const getRemotePath = async (type, label, name) => {
  const url = await getFatestUrl();
  return `${url}/ZZZeroUID/${type}/${label}/${name}`;
};

/**
 * 获取资源远程路径
 * @param {keyof RESOURCE_PATH} label 资源标签
 * @param {string} name 资源名称
 * @returns {Promise<string>}
 */
export const getResourceRemotePath = async (label, name) => {
  return getRemotePath(TYPE_PATH.resource, label, name);
};
