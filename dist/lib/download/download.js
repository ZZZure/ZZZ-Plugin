import { getResourceRemotePath } from '../assets.js';
import * as MysURL from '../assets/mysurl.js';
import * as LocalURI from './const.js';
import { checkFile } from './core.js';
import path from 'path';
import fs from 'fs';
export const downloadMysImage = async (_base, _localBase, filename) => {
    const base = MysURL[_base];
    const localBase = LocalURI[_localBase];
    const finalPath = path.join(localBase, filename);
    const url = `${base}/${filename}`;
    const result = await checkFile(url, finalPath);
    return result;
};
export const downloadResourceImage = async (remoteLabel, _localBase, filename, replaceFilename = '') => {
    const localBase = LocalURI[_localBase];
    const finalPath = path.join(localBase, filename);
    if (fs.existsSync(finalPath) && fs.statSync(finalPath).size > 0) {
        return finalPath;
    }
    const cdKey = `ZZZ:RESOURCE:API:CD:${remoteLabel}:${localBase}:${filename}:${replaceFilename}`;
    let result = null;
    if (!await redis.get(cdKey)) {
        const url = await getResourceRemotePath(remoteLabel, filename);
        result = await checkFile(url, finalPath);
        if (!result && !!replaceFilename) {
            const finalPath = path.join(localBase, replaceFilename);
            const url = await getResourceRemotePath(remoteLabel, replaceFilename);
            result = await checkFile(url, finalPath);
        }
        await redis.set(cdKey, '1', {
            EX: 3600
        });
    }
    return result;
};
export const downloadHakushFile = async (_base, _localBase, filename = '') => {
    return null;
};
//# sourceMappingURL=download.js.map