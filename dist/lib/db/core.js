import { checkFolderExistAndCreate } from '../../utils/file.js';
import { dataPath } from '../path.js';
import path from 'path';
import fs from 'fs';
export const dbPath = {
    gacha: 'gacha',
    panel: 'panel',
    monthly: 'monthly',
    abyss: 'abyss',
    deadly: 'deadly',
    voidFrontBattle: 'voidFrontBattle',
};
export function getDB(dbName, dbFile) {
    const db = dbPath[dbName];
    const dbFolder = path.join(dataPath, db);
    try {
        const dbPath = path.join(dbFolder, `${dbFile}.json`);
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
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
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    }
    catch (error) {
        logger.debug(`写入数据库失败: ${error.message}`);
    }
}
export function removeDB(dbName, dbFile) {
    const db = dbPath[dbName];
    const dbFolder = path.join(dataPath, db);
    try {
        const dbPath = path.join(dbFolder, `${dbFile}.json`);
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
            return true;
        }
    }
    catch (error) {
        logger.debug(`删除数据库失败: ${error.message}`);
    }
    return false;
}
export function getAllDB(dbName) {
    const db = dbPath[dbName];
    const dbFolder = path.join(dataPath, db);
    try {
        const files = fs.readdirSync(dbFolder);
        return files
            .filter(file => file.endsWith('.json'))
            .map(file => JSON.parse(fs.readFileSync(path.join(dbFolder, file), 'utf-8')));
    }
    catch (error) {
        logger.debug(`读取数据库失败: ${error.message}`);
        return [];
    }
}
export function removeAllDB(dbName) {
    const db = dbPath[dbName];
    const dbFolder = path.join(dataPath, db);
    try {
        const files = fs.readdirSync(dbFolder);
        files
            .filter(file => file.endsWith('.json'))
            .forEach(file => fs.unlinkSync(path.join(dbFolder, file)));
        return true;
    }
    catch (error) {
        logger.debug(`删除数据库失败: ${error.message}`);
        return false;
    }
}
//# sourceMappingURL=core.js.map