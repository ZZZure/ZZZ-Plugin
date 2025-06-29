import { Enka2Mys } from './formater.js'
import request from '../../utils/request.js'
import settings from '../../lib/settings.js'
import _ from 'lodash'

const config = settings.getConfig('config')
const EnkaApi = _.get(config, 'enkaApi') ?? 'https://enka.network/api/zzz/uid/'

export function parsePlayerInfo(SocialDetail = {}) {
  const ProfileDetail = SocialDetail.ProfileDetail || {}
  return {
    game_biz: 'nap_cn',
    region: 'prod_gf_cn',
    game_uid: ProfileDetail.Uid || SocialDetail.uid || '114514',
    nickname: ProfileDetail.Nickname || 'Fairy',
    level: ProfileDetail.Level || 60,
    is_chosen: true,
    region_name: '新艾利都',
    is_official: true,
    desc: SocialDetail.Desc || '',
  }
}

/**
 * Enka更新面板
 * @param {string|number} uid 
 */
export async function refreshPanelFromEnka(uid) {
  const res = await request(`${EnkaApi}${uid}`, {
    method: 'GET',
    headers: {
      'User-Agent': 'ZZZ-Plugin/UCPr',
    }
  })
  if (!res.ok) {
    logger.warn(`Enka更新面板失败：${res.status} ${res.statusText}`)
    return res.status
  }
  const data = await res.json()
  /** @type {import('./interface.ts').Enka.Avatar[]} */
  const panelList = data?.PlayerInfo?.ShowcaseDetail?.AvatarList
  if (!panelList || !Array.isArray(panelList)) {
    logger.warn('Enka更新面板失败：获取面板数据失败')
    return res.status
  }
  if (!panelList.length)
    console.log('面板列表为空')
  return {
    playerInfo: parsePlayerInfo(data.PlayerInfo.SocialDetail),
    panelList: Enka2Mys(panelList)
  }
}
