import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { checkFolderExistAndCreate } from '../utils/file.js';
import { dataPath } from './path.js';
const dbPath = {
  gacha: 'gacha',
  panel: 'panel',
};

/**
 *
 * @param {string} dbName
 * @param {string} dbFile
 * @returns {object | Array<object> | null}
 */
export function getDB(dbName, dbFile) {
  const db = dbPath[dbName];
  const dbFolder = path.join(dataPath, db);
  try {
    const dbPath = path.join(dbFolder, `${dbFile}.json`);
    return JSON.parse(readFileSync(dbPath, 'utf-8'));
  } catch (error) {
    logger.debug(`读取数据库失败: ${error.message}`);
    return null;
  }
}

/**
 *
 * @param {string} dbName
 * @param {string} dbFile
 * @param {object} data
 */
export function setDB(dbName, dbFile, data) {
  const db = dbPath[dbName];
  const dbFolder = path.join(dataPath, db);
  try {
    checkFolderExistAndCreate(dbFolder);
    const dbPath = path.join(dbFolder, `${dbFile}.json`);
    writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    logger.debug(`读取数据库失败: ${error.message}`);
  }
}

/**
 * @param {string} uid
 * @returns {object}
 */
export function getGachaLog(uid) {
  return getDB('gacha', uid);
}

/**
 * @param {string} uid
 * @param {object} data
 */
export function saveGachaLog(uid, data) {
  setDB('gacha', uid, data);
}

/**
 * @param {string} uid
 * @returns {Array<object>}
 */
export function getPanelData(uid) {
  return getDB('panel', uid) || [];
}

/**
 * @param {string} uid
 * @param {Array<object>} data
 */
export function savePanelData(uid, data) {
  setDB('panel', uid, data);
}
