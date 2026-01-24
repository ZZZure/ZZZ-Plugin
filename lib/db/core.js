import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import fs from 'fs';
import { checkFolderExistAndCreate } from '../../utils/file.js';
import { dataPath } from '../path.js';
export const dbPath = {
  gacha: 'gacha',
  panel: 'panel',
  monthly: 'monthly',
  abyss: 'abyss',
  deadly: 'deadly',
};

/**
 * 读取数据库
 * @param {keyof dbPath} dbName
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
 * 写入数据库
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
    logger.error(`写入数据库失败: ${error.message}`);
  }
}

/**
 * 删除数据库
 * @param {keyof dbPath} dbName
 * @param {string} dbFile
 * @returns {boolean}
 */
export function removeDB(dbName, dbFile) {
  const db = dbPath[dbName];
  const dbFolder = path.join(dataPath, db);
  try {
    const dbPath = path.join(dbFolder, `${dbFile}.json`);
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      return true;
    }
  } catch (error) {
    logger.error(`删除数据库失败: ${error.message}`);
  }
  return false;
}

/**
 * 读取数据库下所有文件为 list
 * @param {keyof dbPath} dbName
 * @returns {Array<object>}
 */
export function getAllDB(dbName) {
  const db = dbPath[dbName];
  const dbFolder = path.join(dataPath, db);
  try {
    const files = fs.readdirSync(dbFolder);
    
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => JSON.parse(readFileSync(path.join(dbFolder, file), 'utf-8')));
  } catch (error) {
    logger.error(`读取数据库失败: ${error.message}`);
    return [];
  }
}

/**
 * 删除数据库下所有文件
 * @param {keyof dbPath} dbName
 * @returns {boolean}
 */
export function removeAllDB(dbName) {
  const db = dbPath[dbName];
  const dbFolder = path.join(dataPath, db);
  try {
    const files = fs.readdirSync(dbFolder);
    files
      .filter(file => file.endsWith('.json'))
      .forEach(file => fs.unlinkSync(path.join(dbFolder, file)));
    return true;
  } catch (error) {
    logger.debug(`删除数据库失败: ${error.message}`);
    return false;
  }
}