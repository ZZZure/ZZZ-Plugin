import { mapResourcesPath } from '../lib/path.js';
import fs from 'fs';
export function checkFolderExistAndCreate(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
}
const mapDataCache = {};
export function getMapData(fileName, cache = true) {
    if (cache && mapDataCache[fileName]) {
        return mapDataCache[fileName];
    }
    const mapDataPath = `${mapResourcesPath}/${fileName}.json`;
    const mapData = fs.readFileSync(mapDataPath, 'utf-8');
    const parsed = JSON.parse(mapData);
    if (cache) {
        mapDataCache[fileName] = parsed;
    }
    return parsed;
}
//# sourceMappingURL=file.js.map