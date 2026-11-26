import { ZZZ_GET_GACHA_LOG_API, ZZZ_GET_GACHA_OS_LOG_API } from '../mysapi/api.js';
import { ZZZGachaLogResp } from '../../model/gacha.js';
import request from '../../utils/request.js';
const gachaRegions = {
    prod_gf_cn: 'nap_cn',
    prod_gf_us: 'nap_global',
    prod_gf_jp: 'nap_global',
    prod_gf_eu: 'nap_global',
    prod_gf_sg: 'nap_global',
};
export function parseGachaLink(input) {
    let url;
    try {
        url = new URL(input.trim());
    }
    catch {
        return null;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:')
        return null;
    const { searchParams } = url;
    const key = searchParams.get('authkey');
    const region = searchParams.get('region');
    const gameBiz = searchParams.get('game_biz');
    if (!key?.trim() || !region || !gameBiz || gachaRegions[region] !== gameBiz)
        return null;
    return { key, region, gameBiz };
}
export const getZZZGachaLink = async (authKey, gachaType = '2001', initLogGachaBaseType = '2', page = 1, endId = '0', serverId, game_biz) => {
    const region = serverId || 'prod_gf_cn';
    const gamebiz = game_biz || 'nap_cn';
    const url = gamebiz == 'nap_global' ? ZZZ_GET_GACHA_OS_LOG_API : ZZZ_GET_GACHA_LOG_API;
    const baseType = gachaType == '13001' ? '103' : gachaType == '12001' ? '102' : initLogGachaBaseType;
    const timestamp = Math.floor(Date.now() / 1000);
    const params = new URLSearchParams({
        authkey_ver: '1',
        sign_type: '2',
        auth_appid: 'webview_gacha',
        init_log_gacha_type: gachaType,
        init_log_gacha_base_type: baseType,
        gacha_id: '2c1f5692fdfbb733a08733f9eb69d32aed1d37',
        timestamp: timestamp.toString(),
        lang: 'zh-cn',
        device_type: 'mobile',
        plat_type: 'ios',
        region: region,
        authkey: authKey,
        game_biz: gamebiz,
        gacha_type: gachaType,
        real_gacha_type: baseType,
        page: page.toString(),
        size: '20',
        end_id: endId,
    });
    return `${url}?${params}`;
};
export const getZZZGachaLogByAuthkey = async (authKey, gachaType = '2001', initLogGachaBaseType = '2', page = 1, endId = '0', region, game_biz) => {
    const link = await getZZZGachaLink(authKey, gachaType, initLogGachaBaseType, page, endId, region, game_biz);
    let result;
    try {
        const response = await request(link, { method: 'GET' }, 3);
        result = await response.json();
    }
    catch {
        throw new Error('抽卡记录请求失败，请稍后重试');
    }
    const code = result?.retcode == null ? NaN : Number(result.retcode);
    if ([-100, -101, -110, -111].includes(code)) {
        throw new Error('抽卡链接的 AuthKey 无效或已过期，请重新获取链接');
    }
    if (Number.isFinite(code) && code !== 0) {
        throw new Error(`抽卡记录接口返回错误（${code}），请检查链接或稍后重试`);
    }
    if (code !== 0 || !Array.isArray(result?.data?.list)) {
        throw new Error('抽卡记录接口返回的数据格式异常，请稍后重试');
    }
    return new ZZZGachaLogResp(result.data);
};
//# sourceMappingURL=core.js.map