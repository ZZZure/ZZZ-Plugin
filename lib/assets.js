import { findLowestLatencyUrl } from '../utils/network.js';

// 保存上次找的节点
let lastFindFastestUrl = {
  url: null,
  time: 0,
};

// 节点列表
const URL_LIB = {
  '[JPFRP]': 'http://jp-3.lcf.1l1.icu:17217',
  '[HKFRP]': 'http://hk-1.lcf.1l1.icu:10200',
  '[USFRP]': 'http://us-6.lcf.1l1.icu:28596',
  '[XiaoWu]': 'http://frp.xiaowuap.com:63481',
  '[Chuncheon]': 'https://kr.qxqx.cf',
  '[Seoul]': 'https://kr-s.qxqx.cf',
  '[Singapore]': 'https://sg.qxqx.cf',
};

// 文件类型路径
const TYPE_PATH = {
  wiki: 'wiki',
  resource: 'resource',
  guide: 'guide',
};

// 资源路径
const RESOURCE_PATH = {
  role: 'role',
  role_circle: 'role_circle',
  weapon: 'weapon',
};

// 图鉴路径
const GUIDE_PATH = {
  flower: 'flower',
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
 * Get resource remote path
 * @param {keyof TYPE_PATH} type
 * @param {keyof RESOURCE_PATH | keyof GUIDE_PATH} label
 * @param {string} name
 * @returns
 */
export const getRemotePath = async (type, label, name) => {
  const url = await getFatestUrl();
  return `${url}/ZZZeroUID/${type}/${label}/${name}`;
};

// 获取资源远程路径
export const getResourceRemotePath = async (label, name) => {
  return getRemotePath(TYPE_PATH.resource, label, name);
};
