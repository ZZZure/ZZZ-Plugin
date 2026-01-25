import User from '../../../genshin/model/user.js'
import { getStoken } from './authkey.js'

export const rulePrefix = '^((#|%|/)?(zzz|ZZZ|绝区零))'

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
