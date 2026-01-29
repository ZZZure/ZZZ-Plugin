import { Enka2Mys } from './formater.js';
import settings from '../../lib/settings.js';
import fetch from 'node-fetch';
export function getGameRoles(uid, region = false) {
    const _uid = String(uid);
    switch (_uid.slice(0, -8)) {
        case '10':
            return region == true ? 'prod_gf_us' : 'America';
        case '15':
            return region == true ? 'prod_gf_eu' : 'Europe';
        case '13':
            return region == true ? 'prod_gf_jp' : 'Asia';
        case '17':
            return region == true ? 'prod_gf_sg' : 'TW,HK,MO';
    }
    return region == true ? 'prod_gf_cn' : '新艾利都';
}
export function parsePlayerInfo(SocialDetail = {}) {
    const ProfileDetail = SocialDetail.ProfileDetail || {};
    const game_uid = ProfileDetail.Uid || SocialDetail.uid || '114514';
    return {
        game_biz: String(game_uid).length < 10 ? 'nap_cn' : 'nap_global',
        region: getGameRoles(game_uid, true),
        game_uid: game_uid,
        nickname: ProfileDetail.Nickname || 'Fairy',
        level: ProfileDetail.Level || 60,
        is_chosen: true,
        region_name: getGameRoles(game_uid, false),
        is_official: true,
        desc: SocialDetail.Desc || '',
    };
}
export async function refreshPanelFromEnka(uid) {
    const res = await fetch(`${settings.getConfig('config').enkaApi}${uid}`, {
        method: 'GET',
        headers: {
            'User-Agent': 'ZZZ-Plugin/UCPr',
        }
    });
    if (!res.ok) {
        logger.warn(`Enka更新面板失败：${res.status} ${res.statusText}`);
        return res.status;
    }
    const data = await res.json();
    const panelList = data?.PlayerInfo?.ShowcaseDetail?.AvatarList;
    if (!panelList || !Array.isArray(panelList)) {
        logger.warn('Enka更新面板失败：获取面板数据失败');
        return res.status;
    }
    return {
        playerInfo: parsePlayerInfo(data.PlayerInfo.SocialDetail),
        panelList: Enka2Mys(panelList)
    };
}
//# sourceMappingURL=enkaApi.js.map