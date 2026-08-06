import path from 'path'
import { fileURLToPath } from 'url'

/** 获取当前模块的 URL */
const metaUrl = import.meta.url

/** 将 URL 转换为文件路径 */
const metaPath = fileURLToPath(new URL(metaUrl))

/** 插件路径 */
export const pluginPath = path.join(metaPath, '../../../')

/** Yunzai 根目录 */
export const yunzaiPath = path.join(pluginPath, '../..')

/** 插件源码路径 */
export const srcPath = path.join(pluginPath, 'src')

/** 构建后路径 */
export const distPath = path.join(pluginPath, 'dist')

/** apps 路径 */
export const appPath = path.join(distPath, 'apps')

/** 插件名 */
export const pluginName = path.basename(pluginPath)

/** resources */
export const resourcesPath = path.join(pluginPath, 'resources')

export const imageResourcesPath = path.join(resourcesPath, 'images')

export const dataResourcesPath = path.join(resourcesPath, 'data')

export const mapResourcesPath = path.join(resourcesPath, 'map')

/** config 路径 */
export const configPath = path.join(pluginPath, 'config')

/** 默认配置路径 */
export const defPath = path.join(pluginPath, 'defSet')

/** @deprecated 旧 data 路径（插件根目录下，迁移前） */
export const legacyDataPath = path.join(pluginPath, 'data')

/** 新 data 路径（Yunzai 根目录 data/ZZZ-Plugin） */
export const defaultDataPath = path.join(yunzaiPath, 'data', pluginName)

/**
 * data 路径
 * - 默认指向 Yunzai 根目录 `data/{pluginName}`
 * - 若启动迁移失败，可由 `migrateData` 临时回退为 `legacyDataPath`
 */
export let dataPath = defaultDataPath

/** 设置当前生效的 data 路径（供迁移回退使用） */
export function setDataPath(nextPath: string) {
  dataPath = nextPath
}
