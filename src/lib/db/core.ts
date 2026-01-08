import { checkFolderExistAndCreate } from '../../utils/file.js'
import { readFileSync, writeFileSync } from 'fs'
import { dataPath } from '../path.js'
import path from 'path'
import { Mys } from '#interface'

export const dbPath = {
  gacha: 'gacha',
  panel: 'panel',
  monthly: 'monthly',
}

interface DBMap {
  gacha: {
    音擎频段: Mys.Gacha['list']
    独家频段: Mys.Gacha['list']
    常驻频段: Mys.Gacha['list']
    邦布频段: Mys.Gacha['list']
  }
  panel: Mys.Avatar[]
  monthly: Mys.Monthly[]
}

/**
 * 读取数据库
 * @param dbName 数据库名称
 * @param dbFile 数据库文件名
 */
export function getDB<
  T extends keyof DBMap
>(dbName: T, dbFile: string): DBMap[T] | null {
  const db = dbPath[dbName]
  const dbFolder = path.join(dataPath, db)
  try {
    const dbPath = path.join(dbFolder, `${dbFile}.json`)
    return JSON.parse(readFileSync(dbPath, 'utf-8'))
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
export function setDB(dbName: keyof typeof dbPath, dbFile: string, data: any) {
  const db = dbPath[dbName]
  const dbFolder = path.join(dataPath, db)
  try {
    checkFolderExistAndCreate(dbFolder)
    const dbPath = path.join(dbFolder, `${dbFile}.json`)
    writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (error: any) {
    logger.debug(`读取数据库失败: ${error.message}`)
  }
}
