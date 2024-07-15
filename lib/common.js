import User from '../../genshin/model/user.js';
import { getStoken } from './authkey.js';

export const rulePrefix = '^((#|\\%)?(zzz|ZZZ|绝区零))';

/**
 * 获取米游社用户的 cookie
 * @param {Object} e yunzai事件
 * @param {boolean} s 是否获取 stoken
 * @returns {Promise<Object>}
 */
export const getCk = async (e, s = false) => {
  e.isSr = true;
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
  const mysUser = (await user.user()).getMysUser('zzz');
  let ck;
  if (mysUser) {
    ck = {
      default: {
        ck: `${stoken}${mysUser.ck}`,
        uid: mysUser.getUid('zzz'),
        qq: '',
        ltuid: mysUser.ltuid,
        device_id: mysUser.device,
      },
    };
  }
  return ck;
};
