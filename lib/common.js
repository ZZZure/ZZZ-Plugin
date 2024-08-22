import User from '../../genshin/model/user.js';
import { getStoken } from './authkey.js';

export const rulePrefix = '^((#|%|/)?(zzz|ZZZ|绝区零))';

/**
 * 获取米游社用户的 cookie
 * @param {Object} e yunzai事件
 * @param {boolean} s 是否获取 stoken
 * @returns {Promise<Object>}
 */
export const getCk = async (e, s = false) => {
  e.isZZZ = true;
  let stoken = '';
  const user = new User(e);
  if (s) {
    stoken = getStoken(e);
  }
  if (typeof user.getCk === 'function') {
    let ck = user.getCk();
    Object.keys(ck).forEach(k => {
      if (ck[k].ck) {
        ck[k].ck = `${stoken}${ck[k].ck}`;
      }
    });
    return ck;
  }
  const mysUser = await user.user();
  const zzzUser = mysUser.getMysUser('zzz');
  const uid = mysUser.getCkUid('zzz');
  let ck;
  if (zzzUser) {
    ck = {
      default: {
        ck: `${stoken}${zzzUser.ck}`,
        uid: uid,
        qq: '',
        ltuid: zzzUser.ltuid,
        device_id: zzzUser.device,
      },
    };
  }
  return ck;
};
