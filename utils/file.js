import fs from 'fs';
import { mapResourcesPath } from '../lib/path.js';
export function checkFolderExistAndCreate(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

/**
 *
 * @param {string} fileName 名称（不包含后缀）
 * @returns {object | null}
 */
export function getMapData(fileName) {
  const mapDataPath = `${mapResourcesPath}/${fileName}.json`;
  try {
    const mapData = fs.readFileSync(mapDataPath, 'utf-8');
    return JSON.parse(mapData);
  } catch (error) {
    return null;
  }
}
