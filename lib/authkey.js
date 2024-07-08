import fetch from 'node-fetch';
import MysZZZApi from './mysapi.js';
let User;
try {
  User = (await import('../../xiaoyao-cvs-plugin/model/user.js')).default;
} catch (e) {
  logger.warn('建议安装逍遥插件以获得更佳体验');
}

/**
 * 此方法依赖逍遥插件
 * @returns {Promise<void>}
 */
export async function getAuthKey(e, zzzUid, authAppid = 'csc') {
  if (!User) {
    throw new Error('未安装逍遥插件，无法自动刷新抽卡链接');
  }
  const user = new User(e);
  await user.getCookie(e);
  let ck = await user.getStoken(e.user_id);
  ck = `stuid=${ck.stuid};stoken=${ck.stoken};mid=${ck.mid};`;
  const api = new MysZZZApi(zzzUid, ck);
  let type = 'zzzAuthKey';
  switch (authAppid) {
    case 'csc': {
      type = 'zzzAuthKey';
      break;
    }
    default:
  }
  const { url, headers, body } = api.getUrl(type);
  let res = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });
  res = await res.json();
  return res?.data?.authkey;
}

export async function getStoken(e) {
  if (!User) {
    throw new Error('未安装逍遥插件，无法自动刷新抽卡链接');
  }
  let user = new User(e);
  // set uid
  await user.getCookie(e);
  let ck = await user.getStoken(e.user_id);
  ck = `stuid=${ck.stuid};stoken=${ck.stoken};mid=${ck.mid};`;
  return ck;
}
