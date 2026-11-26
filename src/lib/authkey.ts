import type { Mys } from '#interface'
import { getCk } from './common.js'
// @ts-ignore
import type NoteUser from '../../../genshin/model/mys/NoteUser.js'
import request from '../utils/request.js'
import MysZZZApi from './mysapi.js'
import YAML from 'yaml'
import fs from 'fs'

const User = await (async () => {
  try {
    // @ts-ignore
    return (await import('../../../xiaoyao-cvs-plugin/model/user.js')).default
  } catch (e) {
    logger.warn('建议安装逍遥插件以获得更佳体验')
  }
})()

/**
 * 获取 Stoken
 * @param e yunzai Event
 * @param mysid 米游社ID
 */
export const getStoken = (e: any, mysid = '') => {
  // 获取QQ号
  const userId = e.user_id
  if (!User) {
    throw new Error('未安装逍遥插件，无法获取stoken')
  }
  // 实例化用户
  const user = new User(e)
  // 获取 sk 文件路径
  const filePath = `${user.stokenPath}${userId}.yaml`
  try {
    // 读取文件
    const file = fs.readFileSync(filePath, 'utf-8')
    // 解析文件
    const cks = YAML.parse(file) as Record<string, {
      stuid: string
      stoken: string
      ltoken: string
      mid: string
      uid: string
      userId: number
      is_sign: boolean
      region_name: string
      region: string
    }>
    for (const ck in cks) {
      if (cks?.[ck]?.['stuid'] && String(cks[ck]['stuid']) === String(mysid)) {
        // 如果 ck 存在并且 stuid 与 mysid 相同则返回
        return cks[ck]
      }
    }
    return null
  } catch (error) {
    logger.debug(`[zzz:error]getStoken`, error)
    return null
  }
}

/** 国服使用 Stoken（依赖逍遥插件），国际服使用当前角色绑定的 HoYoLAB Cookie。 */
export const getAuthKey = async (e: any, user: NoteUser, zzzUid: string) => {
  // @ts-ignore
  const uidData = user.getUidData(zzzUid, 'zzz', e)
  if (!uidData || uidData.type !== 'ck' || !uidData.ltuid) {
    throw new Error(`当前UID${zzzUid}未绑定Cookie，请切换UID后尝试`)
  }

  const api = new MysZZZApi(zzzUid, '')
  const { server: region, apiTool: { gameBiz } } = api
  const overseas = gameBiz === 'nap_global'
  let type: Mys.UrlType
  if (overseas) {
    const cookies = await getCk(e)
    const binding = Object.values(cookies ?? {}).find(item => item.ck &&
      String(item.uid) === String(zzzUid) &&
      String(MysZZZApi.getLtuid(item.ck) || item.ltuid) === String(uidData.ltuid))
    if (!binding || !/(?:^|;)\s*cookie_token(?:_v2)?=[^;\s]+/.test(binding.ck)) {
      throw new Error('当前UID未绑定包含 CookieToken 的 HoYoLAB Cookie，请重新绑定后尝试')
    }
    api.cookie = binding.ck
    type = 'AuthKeyByCookieToken'
  } else {
    if (!User) throw new Error('未安装逍遥插件，无法获取国服抽卡链接')
    const stoken = getStoken(e, uidData.ltuid)
    if (!stoken) throw new Error('获取Stoken失败，请确认已绑定与当前绝区零UID对应的Stoken')
    api.cookie = `stuid=${stoken.stuid};stoken=${stoken.stoken};mid=${stoken.mid};`
    type = 'zzzAuthKey'
  }

  const result = api.getUrl(type)
  if (!result) throw new Error('获取AuthKey请求参数失败')
  const { url, headers, body } = result
  let res: { retcode?: number | string; data?: { authkey?: string } }
  try {
    res = await (await request(url, { method: 'POST', headers, body })).json() as typeof res
  } catch {
    throw new Error('获取AuthKey请求失败，请稍后重试')
  }
  const authKey = res?.data?.authkey
  if ((res?.retcode != null && Number(res.retcode) !== 0) || typeof authKey !== 'string' || !authKey.trim()) {
    throw new Error(`获取AuthKey失败，请检查${overseas ? 'HoYoLAB Cookie' : '国服Stoken'}是否过期`)
  }
  return { authKey, region, gameBiz }
}
