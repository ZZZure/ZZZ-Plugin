import type { MapJSON } from '#interface'
import { mapResourcesPath } from '../lib/path.js'
import fs from 'fs'

export function checkFolderExistAndCreate(folderPath: string) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
}

/**
 * 获取resources/map/资源数据
 * @param fileName json文件名（不含后缀）
 */
export function getMapData<T extends keyof MapJSON.KeyValue>(fileName: T): MapJSON.KeyValue[T] {
  const mapDataPath = `${mapResourcesPath}/${fileName}.json`
  const mapData = fs.readFileSync(mapDataPath, 'utf-8')
  return JSON.parse(mapData)
}
