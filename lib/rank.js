import settings from './settings.js';
import _ from 'lodash';

export const DEFAULT_RANK_ALLOWED = true;

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

