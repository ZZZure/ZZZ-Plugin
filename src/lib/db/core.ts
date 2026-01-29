import type { ZZZ } from '#interface'
import { checkFolderExistAndCreate } from '../../utils/file.js'
import { dataPath } from '../path.js'
import path from 'path'
import fs from 'fs'

export const dbPath = {
  gacha: 'gacha',
  panel: 'panel',
  monthly: 'monthly',
  abyss: 'abyss',
  deadly: 'deadly',
  voidFrontBattle: 'voidFrontBattle',
}

/**
 * 读取数据库
 * @param dbName 数据库名称
 * @param dbFile 数据库文件名
 */
export function getDB<
  Key extends keyof ZZZ.DBMap
>(dbName: Key, dbFile: string): ZZZ.DBMap[Key] | null {
  const db = dbPath[dbName]
  const dbFolder = path.join(dataPath, db)
  try {
    const dbPath = path.join(dbFolder, `${dbFile}.json`)
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  } catch (error: any) {
    logger.debug(`读取数据库失败: ${error.message}`)
    return null
  }
}

/**
 * 写入数据库
 * @param dbName 数据库名称
 * @param dbFile 数据库文件名
 * @param data 数据
 */
export function setDB<
  Key extends keyof typeof dbPath
>(dbName: Key, dbFile: string, data: ZZZ.DBMap[Key]) {
  const db = dbPath[dbName]
  const dbFolder = path.join(dataPath, db)
  try {
    checkFolderExistAndCreate(dbFolder)
    const dbPath = path.join(dbFolder, `${dbFile}.json`)
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (error: any) {
    logger.debug(`写入数据库失败: ${error.message}`)
  }
}

/**
 * 删除数据库
 * @param dbName 数据库名称
 * @param dbFile 数据库文件名
 */
export function removeDB(dbName: keyof typeof dbPath, dbFile: string) {
  const db = dbPath[dbName]
  const dbFolder = path.join(dataPath, db)
  try {
    const dbPath = path.join(dbFolder, `${dbFile}.json`)
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
      return true
    }
  } catch (error: any) {
    logger.debug(`删除数据库失败: ${error.message}`)
  }
  return false
}

/**
 * 读取数据库下所有文件为 list
 * @param dbName 数据库名称
 */
export function getAllDB<
  Key extends keyof typeof dbPath
>(dbName: Key): ZZZ.DBMap[Key][] {
  const db = dbPath[dbName]
  const dbFolder = path.join(dataPath, db)
  try {
    const files = fs.readdirSync(dbFolder)
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => JSON.parse(fs.readFileSync(path.join(dbFolder, file), 'utf-8')))
  } catch (error: any) {
    logger.debug(`读取数据库失败: ${error.message}`)
    return []
  }
}

/**
 * 删除数据库下所有文件
 * @param dbName 数据库名称
 */
export function removeAllDB(dbName: keyof typeof dbPath) {
  const db = dbPath[dbName]
  const dbFolder = path.join(dataPath, db)
  try {
    const files = fs.readdirSync(dbFolder)
    files
      .filter(file => file.endsWith('.json'))
      .forEach(file => fs.unlinkSync(path.join(dbFolder, file)))
    return true
  } catch (error: any) {
    logger.debug(`删除数据库失败: ${error.message}`)
    return false
  }
}