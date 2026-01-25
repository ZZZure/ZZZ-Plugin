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

/**
 * 此方法依赖逍遥插件
 */
export const getAuthKey = async (e: any, _user: NoteUser, zzzUid: string, authAppid: string = 'csc'): Promise<string> => {
  if (!User) {
    throw new Error('未安装逍遥插件，无法自动刷新抽卡链接')
  }
  // 获取 UID 数据
  // @ts-ignore
  const uidData = _user.getUidData(zzzUid, 'zzz', e)
  if (!uidData || uidData?.type != 'ck' || !uidData?.ltuid) {
    throw new Error(`当前UID${zzzUid}未绑定cookie，请切换UID后尝试`)
  }
  // 获取 sk
  const stoken = getStoken(e, uidData.ltuid)
  if (!stoken) {
    throw new Error(
      '获取stoken失败，请确认绑定了stoken且查询的UID与stoken对应，请确认bot所使用的是绝区零UID'
    )
  }
  if (String(uidData.ltuid) !== String(stoken.stuid)) {
    throw new Error(
      `当前UID${zzzUid}查询所使用的米游社ID${stoken.stuid}与当前切换的米游社ID${uidData.ltuid}不匹配，请切换UID后尝试`
    )
  }
  // 拼接 sk
  const ck = `stuid=${stoken.stuid};stoken=${stoken.stoken};mid=${stoken.mid};`
  // 实例化 API
  const api = new MysZZZApi(zzzUid, ck)
  let type = 'zzzAuthKey'
  switch (authAppid) {
    case 'csc': {
      type = 'zzzAuthKey'
      break
    }
    default:
  }
  // 获取链接
  const result = api.getUrl(type)
  if (!result) {
    throw new Error('获取请求数据失败')
  }
  const { url, headers, body } = result
  // 发送请求
  const _res = await request(url, {
    method: 'POST',
    headers,
    body,
  })
  // 获取数据
  const res = await _res.json() as any
  logger.debug(`[zzz:authkey]`, res)
  // 返回 authkey
  return res?.data?.authkey
}
