import { findLowestLatencyUrl } from '../utils/network.js'
import {
  URL_LIB,
  TYPE_PATH,
  RESOURCE_PATH,
  GUIDE_PATH,
} from './assets/const.js'

// 保存上次找的节点
let lastFindFastestUrl = {
  url: '',
  time: 0,
}

/**
 * 获取最快节点
 */
export const getFatestUrl = async () => {
  if (
    lastFindFastestUrl.url &&
    Date.now() - lastFindFastestUrl.time < 1000 * 60 * 5
  ) {
    // 如果上次找到的节点在 5 分钟内，直接返回
    return lastFindFastestUrl.url
  }
  // 获取最快节点
  const urls = Object.values(URL_LIB)
  const url = await findLowestLatencyUrl(urls)
  // 保存节点
  lastFindFastestUrl = {
    url,
    time: Date.now(),
  }
  // 返回节点
  return url
}

/**
 * 获取远程路径
 * @param type 资源类型
 * @param label 资源标签
 * @param name 资源名称
 */
export const getRemotePath = async (type: keyof typeof TYPE_PATH, label: keyof typeof RESOURCE_PATH | keyof typeof GUIDE_PATH, name: string) => {
  const url = await getFatestUrl()
  return `${url}/ZZZeroUID/${type}/${label}/${name}`
}

/**
 * 获取资源远程路径
 * @param label 资源标签
 * @param name 资源名称
 */
export const getResourceRemotePath = async (label: keyof typeof RESOURCE_PATH, name: string): Promise<string> => {
  return getRemotePath(TYPE_PATH.resource, label, name)
}
