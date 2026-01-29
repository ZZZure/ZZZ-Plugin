import request from '../../utils/request.js';
import path from 'path';
import fs from 'fs';
export const downloadFile = async (url, savePath) => {
    try {
        const download = await request(url, {}, 3);
        const arrayBuffer = await download.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (!fs.existsSync(path.dirname(savePath))) {
            fs.mkdirSync(path.dirname(savePath), { recursive: true });
        }
        fs.writeFileSync(savePath, buffer);
        return savePath;
    }
    catch (error) {
        return null;
    }
};
export const checkFile = async (url, savePath) => {
    if (fs.existsSync(savePath)) {
        const stats = fs.statSync(savePath);
        if (stats.size > 0) {
            return savePath;
        }
    }
    const download = await downloadFile(url, savePath);
    return download;
};
//# sourceMappingURL=core.js.map