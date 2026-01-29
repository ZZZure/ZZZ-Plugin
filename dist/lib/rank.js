import settings from './settings.js';
export const DEFAULT_RANK_ALLOWED = 1;
export function setGroupRankAllowed(allowed) {
    settings.setSingleConfig('rank', 'allow_group', !!allowed);
}
export function isGroupRankAllowed() {
    const allowGroup = settings.getConfig('rank').allow_group ?? DEFAULT_RANK_ALLOWED;
    const whiteList = settings.getConfig('rank').white_list ?? [];
    const blackList = settings.getConfig('rank').black_list ?? [];
    const e = this.e;
    if (!e?.isPrivate) {
        const currentGroup = e?.group_id;
        if (!currentGroup) {
            return false;
        }
        if (!allowGroup) {
            return !(whiteList.length <= 0 || !whiteList?.includes(currentGroup));
        }
        else {
            return !(blackList.length > 0 && blackList?.includes(currentGroup));
        }
    }
    else {
        return Boolean(allowGroup);
    }
}
export async function setUserRankAllowed(rank_type, uid, group_id, allowed) {
    await redis.set(`ZZZ:RANK:${rank_type}:${group_id}:${uid}`, Number(allowed));
}
export async function addUserToGroupRank(rank_type, uid, group_id) {
    await setUserRankAllowed(rank_type, uid, group_id, DEFAULT_RANK_ALLOWED);
}
export async function isUserRankAllowed(rank_type, uid, group_id) {
    const rankPermissionStr = await redis.get(`ZZZ:RANK:${rank_type}:${group_id}:${uid}`);
    if (rankPermissionStr == '0') {
        return 0;
    }
    else if (rankPermissionStr == '1') {
        return 1;
    }
    else {
        await setUserRankAllowed(rank_type, uid, group_id, DEFAULT_RANK_ALLOWED);
        return DEFAULT_RANK_ALLOWED;
    }
}
export async function getUsersInGroupRank(rank_type, group_id) {
    const users = await redis.keys(`ZZZ:RANK:${rank_type}:${group_id}:*`);
    return users
        .map((user) => user.split(':')[4])
        .filter((uid) => uid.match(/^[0-9]{8}$/));
}
export async function removeGroupRank(rank_type, group_id) {
    await redis.del(`ZZZ:RANK:${rank_type}:${group_id}`);
}
export async function removeUserRankRecord(rank_type, group_id, uid) {
    await redis.del(`ZZZ:RANK:${rank_type}:${group_id}:${uid}`);
}
export async function setUidAndQQ(group_id, uid, qq) {
    await redis.set(`ZZZ:RANK:UID2QQS:${group_id}:${uid}:${qq}`, 1);
}
export async function removeUidFromUid2QQ(group_id, uid) {
    const keys = await redis.keys(`ZZZ:RANK:UID2QQS:${group_id}:${uid}:*`);
    if (keys.length > 0) {
        await redis.del(keys);
    }
}
export async function removeUidAllRecord(group_id, uid) {
    for (const rank_type of ['ABYSS', 'DEADLY']) {
        await removeUserRankRecord(rank_type, group_id, uid);
    }
    await removeUidFromUid2QQ(group_id, uid);
}
export async function getUid2QQsMapping(group_id) {
    const keys = await redis.keys(`ZZZ:RANK:UID2QQS:${group_id}:*`);
    const uid2qqs = {};
    for (const key of keys) {
        const keys_part = key.split(':');
        if (keys_part.length !== 6) {
            await redis.del(key);
            continue;
        }
        const uid = keys_part[4];
        const qq = keys_part[5];
        if (uid in uid2qqs) {
            uid2qqs[uid].push(qq);
        }
        else {
            uid2qqs[uid] = [qq];
        }
    }
    return uid2qqs;
}
export async function removeUid2QQsMapping(group_id) {
    const keys = await redis.keys(`ZZZ:RANK:UID2QQS:${group_id}:*`);
    if (keys.length > 0) {
        await redis.del(keys);
    }
}
//# sourceMappingURL=rank.js.map