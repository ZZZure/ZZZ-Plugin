import { ZZZAvatarBasic, ZZZAvatarInfo } from '../model/avatar.js';
import MysZZZApi from './mysapi.js';
import { getPanelData, savePanelData } from './db.js';
import { char } from './convert.js';

/**
 * 获取角色基础信息列表
 * @param {MysZZZApi} api
 * @param {boolean} origin 是否返回原始数据
 * @returns {Promise<ZZZAvatarBasic[] | null>}
 */
export const getAvatarBasicList = async (api, origin = false) => {
  // 获取米游社角色列表
  const avatarBaseListData = await api.getFinalData('zzzAvatarList');
  if (!avatarBaseListData) return null;
  // 是否返回原始数据
  if (origin) return avatarBaseListData.avatar_list;
  // 格式化数据
  const result = avatarBaseListData.avatar_list.map(
    item => new ZZZAvatarBasic(item)
  );
  return result;
};

/**
 * 获取角色详细信息列表
 * @param {MysZZZApi} api
 * @returns {Promise<ZZZAvatarInfo[] | null>}
 * @param {boolean} origin 是否返回原始数据
 */
export const getAvatarInfoList = async (api, origin = false) => {
  // 获取角色基础信息列表
  const avatarBaseList = await getAvatarBasicList(api, origin);
  if (!avatarBaseList) return null;
  // 获取角色详细信息
  const avatarInfoList = await api.getFinalData('zzzAvatarInfo', {
    query: {
      id_list: avatarBaseList.map(item => item.id),
    },
  });
  if (!avatarInfoList) return null;
  // 是否返回原始数据
  if (origin) return avatarInfoList.avatar_list;
  // 格式化数据
  const result = avatarInfoList.avatar_list.map(
    item => new ZZZAvatarInfo(item)
  );
  return result;
};

/**
 * 刷新面板
 * @param {MysZZZApi} api
 * @returns {Promise<ZZZAvatarInfo[] | null>}
 */
export const refreshPanel = async api => {
  // 获取已保存数据
  const originData = getPanelData(api.uid);
  // 获取新数据
  const newData = await getAvatarInfoList(api, true);
  if (!newData) return null;
  // 初始化最终数据
  const finalData = [...newData];
  // 如果有已保存的数据
  if (originData) {
    // 合并数据
    for (const item of originData) {
      if (!finalData.find(i => i.id === item.id)) {
        // 将已保存的数据添加到最终数据中（放在后面）
        finalData.push(item);
      }
    }
  }
  // 保存数据
  savePanelData(api.uid, finalData);
  // 格式化数据
  finalData.forEach(item => {
    item.isNew = !!newData.find(i => i.id === item.id);
  });
  const formattedData = finalData.map(item => new ZZZAvatarInfo(item));
  for (const item of formattedData) {
    // 下载图片资源
    await item.get_basic_assets();
  }
  return formattedData;
};

/**
 *获取面板数据
 * @param {string} uid
 * @returns {ZZZAvatarInfo[]}
 */
export const getPanelList = uid => {
  const data = getPanelData(uid);
  return data.map(item => new ZZZAvatarInfo(item));
};

/**
 * 获取某个角色的面板数据
 * @param {string} uid
 * @param {string} name
 * @returns {ZZZAvatarInfo | null}
 */
export const getPanel = (uid, name) => {
  const _data = getPanelData(uid);
  // 获取所有面板数据
  const data = _data.map(item => new ZZZAvatarInfo(item));
  // 通过名称（包括别名）获取角色 ID
  const id = char.aliasToID(name);
  if (!id) return null;
  // 通过 ID 获取角色数据
  const result = data.find(item => item.id === id);
  if (!result) return null;
  return result;
};
