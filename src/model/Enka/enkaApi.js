import { Enka2Mys } from './formater.js'
import settings from '../../lib/settings.js'
import fetch from 'node-fetch'

const config = settings.getConfig('config')
const EnkaApi = config.enkaApi

export function getGameRoles(uid, region = false) {
  const _uid = String(uid)
  switch (_uid.slice(0, -8)) {
    case '10':
      return region == true ? 'prod_gf_us' : 'America' // 美服
    case '15':
      return region == true ? 'prod_gf_eu' :'Europe' // 欧服
    case '13':
      return region == true ? 'prod_gf_jp' :'Asia' // 亚服
    case '17':
      return region == true ? 'prod_gf_sg' : 'TW,HK,MO' // 港澳台服
  }
  return region == true ? 'prod_gf_cn' : '新艾利都' // 官服
}

export function parsePlayerInfo(SocialDetail = {}) {
  const ProfileDetail = SocialDetail.ProfileDetail || {}
  const game_uid = ProfileDetail.Uid || SocialDetail.uid || '114514'
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
  }
}

/**
 * Enka更新面板
 * @param {string|number} uid
 */
export async function refreshPanelFromEnka(uid) {
  const res = await fetch(`${EnkaApi}${uid}`, {
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
  /** @type {import('#interface').Enka.Avatar[]} */
  const panelList = data?.PlayerInfo?.ShowcaseDetail?.AvatarList
  if (!panelList || !Array.isArray(panelList)) {
    logger.warn('Enka更新面板失败：获取面板数据失败')
    return res.status
  }
  return {
    playerInfo: parsePlayerInfo(data.PlayerInfo.SocialDetail),
    panelList: Enka2Mys(panelList)
  }
}

// import fs from 'fs'
// const uid = 11070609
// const res = await fetch(`${EnkaApi}${uid}`, {
//   method: 'GET',
//   headers: {
//     'User-Agent': 'ZZZ-Plugin/UCPr',
//   }
// })
// if (!res.ok) {
//   console.log(`Enka更新面板失败：${res.status} ${res.statusText}`)
// }
// const data = await res.json()
// console.log(data)
// fs.writeFileSync('enkaPanel1.json', JSON.stringify(data, null, 2))
