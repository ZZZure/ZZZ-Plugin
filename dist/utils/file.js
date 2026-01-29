import { mapResourcesPath } from '../lib/path.js';
import fs from 'fs';
export function checkFolderExistAndCreate(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
}
export function getMapData(fileName) {
    const mapDataPath = `${mapResourcesPath}/${fileName}.json`;
    const mapData = fs.readFileSync(mapDataPath, 'utf-8');
    return JSON.parse(mapData);
}
//# sourceMappingURL=file.js.map