import { checkFolderExistAndCreate } from '../../utils/file.js';
import { readFileSync, writeFileSync } from 'fs';
import { dataPath } from '../path.js';
import path from 'path';
export const dbPath = {
    gacha: 'gacha',
    panel: 'panel',
    monthly: 'monthly',
};
export function getDB(dbName, dbFile) {
    const db = dbPath[dbName];
    const dbFolder = path.join(dataPath, db);
    try {
        const dbPath = path.join(dbFolder, `${dbFile}.json`);
        return JSON.parse(readFileSync(dbPath, 'utf-8'));
    }
    catch (error) {
        logger.debug(`读取数据库失败: ${error.message}`);
        return null;
    }
}
export function setDB(dbName, dbFile, data) {
    const db = dbPath[dbName];
    const dbFolder = path.join(dataPath, db);
    try {
        checkFolderExistAndCreate(dbFolder);
        const dbPath = path.join(dbFolder, `${dbFile}.json`);
        writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }
    catch (error) {
        logger.debug(`读取数据库失败: ${error.message}`);
    }
}
