import { getCk } from './common.js';
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
export const getAuthKey = async (e, user, zzzUid) => {
    const uidData = user.getUidData(zzzUid, 'zzz', e);
    if (!uidData || uidData.type !== 'ck' || !uidData.ltuid) {
        throw new Error(`当前UID${zzzUid}未绑定Cookie，请切换UID后尝试`);
    }
    const api = new MysZZZApi(zzzUid, '');
    const { server: region, apiTool: { gameBiz } } = api;
    const overseas = gameBiz === 'nap_global';
    let type;
    if (overseas) {
        const cookies = await getCk(e);
        const binding = Object.values(cookies ?? {}).find(item => item.ck &&
            String(item.uid) === String(zzzUid) &&
            String(MysZZZApi.getLtuid(item.ck) || item.ltuid) === String(uidData.ltuid));
        if (!binding || !/(?:^|;)\s*cookie_token(?:_v2)?=[^;\s]+/.test(binding.ck)) {
            throw new Error('当前UID未绑定包含 CookieToken 的 HoYoLAB Cookie，请重新绑定后尝试');
        }
        api.cookie = binding.ck;
        type = 'AuthKeyByCookieToken';
    }
    else {
        if (!User)
            throw new Error('未安装逍遥插件，无法获取国服抽卡链接');
        const stoken = getStoken(e, uidData.ltuid);
        if (!stoken)
            throw new Error('获取Stoken失败，请确认已绑定与当前绝区零UID对应的Stoken');
        api.cookie = `stuid=${stoken.stuid};stoken=${stoken.stoken};mid=${stoken.mid};`;
        type = 'zzzAuthKey';
    }
    const result = api.getUrl(type);
    if (!result)
        throw new Error('获取AuthKey请求参数失败');
    const { url, headers, body } = result;
    let res;
    try {
        res = await (await request(url, { method: 'POST', headers, body })).json();
    }
    catch {
        throw new Error('获取AuthKey请求失败，请稍后重试');
    }
    const authKey = res?.data?.authkey;
    if ((res?.retcode != null && Number(res.retcode) !== 0) || typeof authKey !== 'string' || !authKey.trim()) {
        throw new Error(`获取AuthKey失败，请检查${overseas ? 'HoYoLAB Cookie' : '国服Stoken'}是否过期`);
    }
    return { authKey, region, gameBiz };
};
//# sourceMappingURL=authkey.js.map