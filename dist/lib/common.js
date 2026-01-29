import User from '../../../genshin/model/user.js';
import { getStoken } from './authkey.js';
export const rulePrefix = '^((#|%|/)?(zzz|ZZZ|绝区零))';
export const getCk = async (e, s = false) => {
    e.isZZZ = true;
    let stoken = '';
    const user = new User(e);
    if (s) {
        stoken = getStoken(e)?.stoken || '';
    }
    if (typeof user.getCk === 'function') {
        const ck = user.getCk();
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
//# sourceMappingURL=common.js.map