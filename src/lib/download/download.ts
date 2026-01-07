import { getResourceRemotePath } from '../assets.js'
import * as HakushURL from '../assets/hakushurl.js'
import * as MysURL from '../assets/mysurl.js'
import * as LocalURI from './const.js'
import { checkFile } from './core.js'
import path from 'path'
import fs from 'fs'

/**
 * 下载米游社图片
 * @param base 远程地址
 * @param localBase 本地地址
 * @param filename 文件名
 */
export const downloadMysImage = async (
  _base: keyof typeof MysURL,
  _localBase: keyof typeof LocalURI,
  filename: string
) => {
  const base = MysURL[_base]
  const localBase = LocalURI[_localBase]
  const finalPath = path.join(localBase, filename)
  let url = `${base}/${filename}`
  let result = await checkFile(url, finalPath)
  return result
}

/**
 * 下载资源库图片
 *  @param remoteLabel 远程地址
 *  @param localBase 本地地址
 *  @param filename 文件名
 *  @param replaceFilename 替换文件名(如果资源不存在)
 *  @returns 保存路径
 */
export const downloadResourceImage = async (
  remoteLabel: Parameters<typeof getResourceRemotePath>[0],
  _localBase: keyof typeof LocalURI,
  filename: string,
  replaceFilename: string = ''
): Promise<string | null> => {
  const localBase = LocalURI[_localBase]
  const finalPath = path.join(localBase, filename)
  if (fs.existsSync(finalPath) && fs.statSync(finalPath).size > 0) {
    return finalPath
  }
  // 防止短时间内重复请求同一无效节点资源
  const cdKey = `ZZZ:RESOURCE:API:CD:${remoteLabel}:${localBase}:${filename}:${replaceFilename}`
  let result = null
  if (!await redis.get(cdKey)) {
    const url = await getResourceRemotePath(remoteLabel, filename)
    result = await checkFile(url, finalPath)
    if (!result && !!replaceFilename) {
      const finalPath = path.join(localBase, replaceFilename)
      const url = await getResourceRemotePath(remoteLabel, replaceFilename)
      result = await checkFile(url, finalPath)
    }
    await redis.set(cdKey, '1', {
      EX: 3600 // CD 1小时
    })
  }
  return result
}

/**
 * 下载Hakush文件
 * @param base 远程地址
 * @param localBase 本地地址
 * @param filename 文件名
 */
export const downloadHakushFile = async (
  _base: keyof typeof HakushURL,
  _localBase: keyof typeof LocalURI,
  filename: string = ''
) => {
  const base = HakushURL[_base]
  const localBase = LocalURI[_localBase]
  const finalPath = path.join(localBase, filename)
  let url = base
  if (filename) {
    url += `/${filename}`
  }
  // logger.debug('Hakush file url:', url);
  const filepath = await checkFile(url, finalPath)
  if (filepath) {
    // 如果是JSON文件，返回JSON对象
    if (filename.endsWith('.json')) {
      // 打开文件
      const file = fs.openSync(filepath, 'r')
      // 读取文件内容
      const content = fs.readFileSync(file).toString()
      // 关闭文件
      fs.closeSync(file)
      // 返回文件内容
      const data = JSON.parse(content)
      // 测试数据每次请求都重新下载
      if (
        content.includes('(Test') ||
        !data ||
        (_base === 'ZZZ_CHARACTER' && (
          data.PartnerInfo?.ImpressionF === '...' ||
          data.PartnerInfo?.ImpressionM === '...' ||
          !Object.keys(data.Skin || {}).length ||
          !Object.keys(data.SkillList || {}).length
        ))
      ) {
        logger.debug('Hakush test file, redownloading:', url)
        fs.rmSync(filepath)
        const filepath_new = await checkFile(url, finalPath)
        if (!filepath_new) {
          return data
        }
        const file = fs.openSync(filepath_new, 'r')
        const content = fs.readFileSync(file).toString()
        fs.closeSync(file)
        return JSON.parse(content)
      }
      return data
    } else {
      return filepath
    }
  } else {
    return null
  }
}
