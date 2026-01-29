import request from '../utils/request.js';
import MysZZZApi from './mysapi.js';
import YAML from 'yaml';
import fs from 'fs';
const User = await (async () => {
    try {
        return (await import('../../../xiaoyao-cvs-plugin/model/user.js')).default;
    }
    catch (e) {
        logger.warn('建议安装逍遥插件以获得更佳体验');
    }
})();
export const getStoken = (e, mysid = '') => {
    const userId = e.user_id;
    if (!User) {
        throw new Error('未安装逍遥插件，无法获取stoken');
    }
    const user = new User(e);
    const filePath = `${user.stokenPath}${userId}.yaml`;
    try {
        const file = fs.readFileSync(filePath, 'utf-8');
        const cks = YAML.parse(file);
        for (const ck in cks) {
            if (cks?.[ck]?.['stuid'] && String(cks[ck]['stuid']) === String(mysid)) {
                return cks[ck];
            }
        }
        return null;
    }
    catch (error) {
        logger.debug(`[zzz:error]getStoken`, error);
        return null;
    }
};
export const getAuthKey = async (e, _user, zzzUid, authAppid = 'csc') => {
    if (!User) {
        throw new Error('未安装逍遥插件，无法自动刷新抽卡链接');
    }
    const uidData = _user.getUidData(zzzUid, 'zzz', e);
    if (!uidData || uidData?.type != 'ck' || !uidData?.ltuid) {
        throw new Error(`当前UID${zzzUid}未绑定cookie，请切换UID后尝试`);
    }
    const stoken = getStoken(e, uidData.ltuid);
    if (!stoken) {
        throw new Error('获取stoken失败，请确认绑定了stoken且查询的UID与stoken对应，请确认bot所使用的是绝区零UID');
    }
    if (String(uidData.ltuid) !== String(stoken.stuid)) {
        throw new Error(`当前UID${zzzUid}查询所使用的米游社ID${stoken.stuid}与当前切换的米游社ID${uidData.ltuid}不匹配，请切换UID后尝试`);
    }
    const ck = `stuid=${stoken.stuid};stoken=${stoken.stoken};mid=${stoken.mid};`;
    const api = new MysZZZApi(zzzUid, ck);
    let type = 'zzzAuthKey';
    switch (authAppid) {
        case 'csc': {
            type = 'zzzAuthKey';
            break;
        }
        default:
    }
    const result = api.getUrl(type);
    if (!result) {
        throw new Error('获取请求数据失败');
    }
    const { url, headers, body } = result;
    const _res = await request(url, {
        method: 'POST',
        headers,
        body,
    });
    const res = await _res.json();
    logger.debug(`[zzz:authkey]`, res);
    return res?.data?.authkey;
};
//# sourceMappingURL=authkey.js.map