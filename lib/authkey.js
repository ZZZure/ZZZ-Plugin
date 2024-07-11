import fs from 'fs';
import MysZZZApi from './mysapi.js';
import YAML from 'yaml';
let User;
try {
  User = (await import('../../xiaoyao-cvs-plugin/model/user.js')).default;
} catch (e) {
  logger.warn('建议安装逍遥插件以获得更佳体验');
}

/**
 * 获取 Stoken
 * @param {*} e yunzai Event
 * @param {string} mysid 米游社ID
 * @returns
 */
export function getStoken(e, mysid = '') {
  let userId = e.user_id;
  let user = new User(e);
  let file = `${user.stokenPath}${userId}.yaml`;
  try {
    let cks = fs.readFileSync(file, 'utf-8');
    cks = YAML.parse(cks);
    for (let ck in cks) {
      if (cks[ck]['stuid'] === mysid) {
        return cks[ck];
      }
    }
    return null;
  } catch (error) {
    logger.debug(`[zzz:error]getStoken`, error);
    return null;
  }
}

/**
 * 此方法依赖逍遥插件
 * @returns {Promise<void>}
 */
export async function getAuthKey(e, _user, zzzUid, authAppid = 'csc') {
  if (!User) {
    throw new Error('未安装逍遥插件，无法自动刷新抽卡链接');
  }
  const uidData = _user.getUidData(zzzUid, 'zzz', e);
  if (!uidData || uidData?.type != 'ck' || !uidData?.ltuid) {
    throw new Error(`当前UID${zzzUid}未绑定cookie，请切换UID后尝试`);
  }
  let ck = getStoken(e, uidData.ltuid);
  if (!ck) {
    throw new Error('获取cookie失败，请确认绑定了 cookie');
  }
  if (uidData.ltuid !== ck.stuid) {
    throw new Error(
      `当前UID${zzzUid}查询所使用的米游社ID${ck.stuid}与当前切换的米游社ID${uidData.ltuid}不匹配，请切换UID后尝试`
    );
  }
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
  logger.mark(type);
  const { url, headers, body } = api.getUrl(type);
  logger.mark(url);
  let res = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });
  res = await res.json();
  return res?.data?.authkey;
}
