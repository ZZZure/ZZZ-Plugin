import { ZZZAvatarBasic, ZZZAvatarInfo } from '../model/avatar.js';
import MysZZZApi from './mysapi.js';
import { getPanelData, savePanelData } from './db.js';
import { char } from './convert.js';

/**
 * 获取角色基础信息列表
 * @param {*} e 消息事件
 * @param {MysZZZApi} api
 * @param {string} deviceFp
 * @param {boolean} origin 是否返回原始数据
 * @returns {Promise<ZZZAvatarBasic[] | null>}
 */
export async function getAvatarBasicList(e, api, deviceFp, origin = false) {
  const avatarBaseListData = await api.getFinalData(e, 'zzzAvatarList', {
    deviceFp,
  });
  if (!avatarBaseListData) return null;
  if (origin) return avatarBaseListData.avatar_list;
  const result = avatarBaseListData.avatar_list.map(
    item => new ZZZAvatarBasic(item)
  );
  return result;
}

/**
 * 获取角色详细信息列表
 * @param {*} e 消息事件
 * @param {MysZZZApi} api
 * @returns {Promise<ZZZAvatarInfo[] | null>}
 * @param {string} deviceFp
 * @param {boolean} origin 是否返回原始数据
 */
export async function getAvatarInfoList(e, api, deviceFp, origin = false) {
  const avatarBaseList = await getAvatarBasicList(e, api, deviceFp, origin);
  if (!avatarBaseList) return null;
  const avatarInfoList = await api.getFinalData(e, 'zzzAvatarInfo', {
    deviceFp,
    query: {
      id_list: avatarBaseList.map(item => item.id),
    },
  });
  if (!avatarInfoList) return null;
  if (origin) return avatarInfoList.avatar_list;
  const result = avatarInfoList.avatar_list.map(
    item => new ZZZAvatarInfo(item)
  );
  return result;
}

/**
 * 刷新面板
 * @param {*} e 消息事件
 * @param {MysZZZApi} api
 * @param {string} uid
 * @param {string} deviceFp
 * @returns {Promise<ZZZAvatarInfo[] | null>}
 */
export async function refreshPanel(e, api, uid, deviceFp) {
  const originData = getPanelData(uid);
  const newData = await getAvatarInfoList(e, api, deviceFp, true);
  if (!newData) return null;
  const finalData = [...newData];
  if (originData) {
    for (const item of originData) {
      if (!finalData.find(i => i.id === item.id)) {
        finalData.push(item);
      }
    }
  }
  savePanelData(uid, finalData);
  finalData.forEach(item => {
    item.isNew = newData.find(i => i.id === item.id);
  });
  const formattedData = finalData.map(item => new ZZZAvatarInfo(item));
  for (const item of formattedData) {
    await item.get_basic_assets();
  }
  return formattedData;
}

/**
 *获取面板数据
 * @param {string} uid
 * @returns {ZZZAvatarInfo[]}
 */
export function getPanelList(uid) {
  const data = getPanelData(uid);
  return data.map(item => new ZZZAvatarInfo(item));
}

/**
 * 获取某个角色的面板数据
 * @param {string} uid
 * @param {string} name
 * @returns {ZZZAvatarInfo | null}
 */
export function getPanel(uid, name) {
  logger.debug('获取面板数据', uid, name);
  const data = getPanelData(uid).map(item => new ZZZAvatarInfo(item));
  const id = char.atlasToID(name);
  logger.debug('获取角色ID', id);
  if (!id) return null;
  return data.find(item => item.id === id) || null;
}
