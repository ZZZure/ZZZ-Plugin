import { ZZZ_GET_GACHA_LOG_API, ZZZ_GET_GACHA_OS_LOG_API } from '../mysapi/api.js';
import { ZZZGachaLogResp } from '../../model/gacha.js';
import request from '../../utils/request.js';
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
    const response = await request(link, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }, 3);
    const data = await response.json();
    if (!data || !data?.data)
        return null;
    return new ZZZGachaLogResp(data.data);
};
//# sourceMappingURL=core.js.map