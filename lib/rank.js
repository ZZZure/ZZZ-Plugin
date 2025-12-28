import settings from './settings.js';
import _ from 'lodash';

export const DEFAULT_RANK_ALLOWED = 1;

export function setGroupRankAllowed(allowed) {
  settings.setConfig('rank', 'allow_group', allowed);
}

export function isGroupRankAllowed() {
  const allowGroup = _.get(settings.getConfig('rank'), 'allow_group', DEFAULT_RANK_ALLOWED);
  const whiteList = _.get(settings.getConfig('rank'), 'white_list', []);
  const blackList = _.get(settings.getConfig('rank'), 'black_list', []);
  if (!this.e.isPrivate) {
    const currentGroup = this.e?.group_id;
    if (!currentGroup) {
      return false;
    }
    if (!allowGroup) {
      return !(whiteList.length <= 0 || !whiteList?.includes(currentGroup));
    } else {
      return !(blackList.length > 0 && blackList?.includes(currentGroup));
    }
  } else {
    return allowGroup;
  }
}

export async function setUserRankAllowed(uid, group_id, allowed) {
  await redis.set(`ZZZ:RANK:${group_id}:${uid}`, Number(allowed));
}

export async function addUserToGroupRank(uid, group_id) {
  await setUserRankAllowed(uid, group_id, DEFAULT_RANK_ALLOWED);
}

export async function isUserRankAllowed(uid, group_id) {
  const rankPermissionStr = await redis.get(`ZZZ:RANK:${group_id}:${uid}`);
  if (rankPermissionStr == 0) {
    return 0;
  } else if (rankPermissionStr == 1) {
    return 1;
  } else {
    // Add user to group rank
    await setUserRankAllowed(uid, group_id, DEFAULT_RANK_ALLOWED);
    return DEFAULT_RANK_ALLOWED;
  }
}

export async function getUsersInGroupRank(group_id) {
  const users = await redis.keys(`ZZZ:RANK:${group_id}:*`);
  return users
    .map(user => user.split(':')[3])
    .filter(uid => uid.match(/^[0-9]{8}$/));
}