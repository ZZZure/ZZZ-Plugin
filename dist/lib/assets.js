import { findLowestLatencyUrl } from '../utils/network.js';
import { URL_LIB, TYPE_PATH, } from './assets/const.js';
let lastFindFastestUrl = {
    url: '',
    time: 0,
};
export const getFatestUrl = async () => {
    if (lastFindFastestUrl.url &&
        Date.now() - lastFindFastestUrl.time < 1000 * 60 * 5) {
        return lastFindFastestUrl.url;
    }
    const urls = Object.values(URL_LIB);
    const url = await findLowestLatencyUrl(urls);
    lastFindFastestUrl = {
        url,
        time: Date.now(),
    };
    return url;
};
export const getRemotePath = async (type, label, name) => {
    const url = await getFatestUrl();
    return `${url}/ZZZeroUID/${type}/${label}/${name}`;
};
export const getResourceRemotePath = async (label, name) => {
    return getRemotePath(TYPE_PATH.resource, label, name);
};
//# sourceMappingURL=assets.js.map