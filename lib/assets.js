import { findLowestLatencyUrl } from '../utils/network.js';

let lastFindFastestUrl = {
  url: null,
  time: 0,
};

const URL_LIB = {
  '[JPFRP]': 'http://jp-3.lcf.1l1.icu:17217',
  '[HKFRP]': 'http://hk-1.lcf.1l1.icu:10200',
  '[USFRP]': 'http://us-6.lcf.1l1.icu:28596',
  '[XiaoWu]': 'http://frp.xiaowuap.com:63481',
  '[Chuncheon]': 'https://kr.qxqx.cf',
  '[Seoul]': 'https://kr-s.qxqx.cf',
  '[Singapore]': 'https://sg.qxqx.cf',
};

const TYPE_PATH = {
  wiki: 'wiki',
  resource: 'resource',
  guide: 'guide',
};

const RESOURCE_PATH = {
  role: 'role',
  role_circle: 'role_circle',
  weapon: 'weapon',
};

const GUIDE_PATH = {
  flower: 'flower',
};

export const getFatestUrl = async () => {
  if (
    lastFindFastestUrl.url &&
    Date.now() - lastFindFastestUrl.time < 1000 * 60 * 5
  ) {
    return lastFindFastestUrl.url;
  }
  const urls = Object.values(URL_LIB);
  const url = findLowestLatencyUrl(urls);
  lastFindFastestUrl = {
    url,
    time: Date.now(),
  };
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
