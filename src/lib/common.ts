// @ts-ignore
import User from '../../../genshin/model/user.js'
import { getStoken } from './authkey.js'
import settings from './settings.js'

export const rulePrefix = '^((#|%|/)?(zzz|ZZZ|绝区零))'

/** 提示类消息默认撤回时间（秒） */
export const DEFAULT_RECALL_MSG = 100
/** Yunzai 支持的撤回时间上限（秒） */
export const MAX_RECALL_MSG = 120

/**
 * 提示类消息的自动撤回时间（秒）
 *
 * 读取 config.yaml 的 recallMsg，取值 0~120，0 为不撤回；
 * 配置缺失、留空或非法时回退到默认值
 */
export const getRecallMsg = (): number => {
  const raw: unknown = settings.getConfig('config')?.recallMsg
  // null、留空、布尔、数组等都按未配置处理，避免被 Number() 静默转成 0 而变成不撤回
  const value =
    typeof raw === 'number' || (typeof raw === 'string' && raw.trim() !== '')
      ? Number(raw)
      : NaN
  if (!Number.isFinite(value) || value < 0) return DEFAULT_RECALL_MSG
  return Math.min(MAX_RECALL_MSG, Math.floor(value))
}

export interface Cookie {
  ck: string
  uid: string
  qq: string
  ltuid: string
  device_id: string
  device?: string
}

/**
 * 获取米游社用户的 cookie
 * @param e yunzai事件
 * @param s 是否获取 stoken
 */
export const getCk = async (e: any, s = false): Promise<Record<string, Cookie> | undefined> => {
  e.isZZZ = true
  let stoken = ''
  const user = new User(e)
  if (s) {
    stoken = getStoken(e)?.stoken || ''
  }
  // @ts-ignore
  if (typeof user.getCk === 'function') {
    // @ts-ignore
    const ck = user.getCk()
    Object.keys(ck).forEach(k => {
      if (ck[k].ck) {
        ck[k].ck = `${stoken}${ck[k].ck}`
      }
    })
    return ck
  }
  const mysUser = await user.user()
  const zzzUser = mysUser.getMysUser('zzz')
  const uid = mysUser.getCkUid('zzz')
  let ck
  if (zzzUser) {
    ck = {
      default: {
        ck: `${stoken}${zzzUser.ck}`,
        uid: uid,
        qq: '',
        ltuid: zzzUser.ltuid,
        device_id: zzzUser.device,
      },
    }
  }
  return ck
}
