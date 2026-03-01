import type { MapJSON } from '#interface'
import { mapResourcesPath } from '../lib/path.js'
import fs from 'fs'

export function checkFolderExistAndCreate(folderPath: string) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
}

const mapDataCache: Partial<MapJSON.KeyValue> = {}

/**
 * 获取resources/map/资源数据
 * @param fileName json文件名（不含后缀）
 */
export function getMapData<T extends keyof MapJSON.KeyValue>(fileName: T, cache = true): MapJSON.KeyValue[T] {
  if (cache && mapDataCache[fileName]) {
    return mapDataCache[fileName]
  }
  const mapDataPath = `${mapResourcesPath}/${fileName}.json`
  const mapData = fs.readFileSync(mapDataPath, 'utf-8')
  const parsed = JSON.parse(mapData)
  if (cache) {
    mapDataCache[fileName] = parsed
  }
  return parsed
}
