import { ZZZAvatarBasic, ZZZAvatarInfo } from '../model/avatar.js';
import { getPanelData, savePanelData } from './db.js';
import settings from './settings.js';
import { char } from './convert.js';
import _ from 'lodash';
export async function getAvatarBasicList(api, deviceFp, origin = false) {
    const avatarBaseListData = await api.getFinalData('zzzAvatarList', {
        deviceFp,
    });
    if (!avatarBaseListData)
        return null;
    if (origin)
        return avatarBaseListData.avatar_list;
    const result = avatarBaseListData.avatar_list.map(item => new ZZZAvatarBasic(item));
    return result;
}
export async function getAvatarInfoList(api, deviceFp, origin = false) {
    const avatarBaseList = await getAvatarBasicList(api, deviceFp, origin);
    if (!avatarBaseList)
        return null;
    const avatarInfoList = [];
    for (const item of avatarBaseList) {
        const data = await api.getFinalData('zzzAvatarInfo', {
            deviceFp,
            query: {
                id_list: [item.id],
            },
        });
        if (!data || !data.avatar_list || data.avatar_list.length === 0)
            continue;
        avatarInfoList.push(data.avatar_list[0]);
        const time = _.get(settings.getConfig('panel'), 'roleInterval', 3000);
        let refresh;
        if (time > 100) {
            refresh = time;
        }
        else {
            refresh = 100;
        }
        await new Promise(resolve => setTimeout(resolve, refresh));
    }
    if (!avatarInfoList?.length)
        return null;
    if (origin)
        return avatarInfoList;
    const result = avatarInfoList.map(item => new ZZZAvatarInfo(item));
    return result;
}
export const updatePanelData = (uid, newData) => {
    const originData = getPanelData(uid);
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
        item.isNew = newData.some(i => i.id === item.id);
    });
    return finalData;
};
export const refreshPanel = async (api, deviceFp) => {
    const newData = await getAvatarInfoList(api, deviceFp, true);
    if (!newData)
        return null;
    return mergePanel(api.uid, newData);
};
export const mergePanel = async (uid, newData) => {
    const finalData = updatePanelData(uid, newData);
    const formattedData = finalData.map(item => new ZZZAvatarInfo(item));
    for (const item of formattedData) {
        await item.get_basic_assets();
    }
    return formattedData;
};
export const getPanelList = (uid) => {
    const data = getPanelData(uid);
    return data.map(item => new ZZZAvatarInfo(item));
};
export const getPanelListOrigin = (uid) => {
    return getPanelData(uid);
};
export const getPanel = (uid, name) => {
    const id = char.aliasToId(name);
    if (!id)
        return false;
    const _data = getPanelData(uid);
    const data = _data.map(item => new ZZZAvatarInfo(item));
    const result = data.find(item => item.id === id);
    if (!result)
        return null;
    return result;
};
export const getPanelOrigin = (uid, name) => {
    const id = char.aliasToId(name);
    if (!id)
        return false;
    const data = getPanelData(uid);
    const result = data.find(item => item.id === id);
    if (!result)
        return null;
    return result;
};
export const formatPanelDatas = (data) => {
    return data.map(item => new ZZZAvatarInfo(item));
};
export const formatPanelData = (data) => {
    return new ZZZAvatarInfo(data);
};
//# sourceMappingURL=avatar.js.map