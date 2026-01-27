import type MysZZZApi from './mysapi.js'
import type { Mys } from '#interface'
import { ZZZAvatarBasic, ZZZAvatarInfo } from '../model/avatar.js'
import { getPanelData, savePanelData } from './db.js'
import settings from './settings.js'
import { char } from './convert.js'
import _ from 'lodash'

/**
 * 获取角色基础信息列表
 * @param api
 * @param deviceFp
 * @param origin 是否返回原始数据
 */
export async function getAvatarBasicList(api: MysZZZApi, deviceFp: string, origin?: false): Promise<ZZZAvatarBasic[] | null>
export async function getAvatarBasicList(api: MysZZZApi, deviceFp: string, origin: true): Promise<Mys.AvatarList['avatar_list'] | null>
export async function getAvatarBasicList(api: MysZZZApi, deviceFp: string, origin: boolean = false) {
  // 获取米游社角色列表
  const avatarBaseListData = await api.getFinalData('zzzAvatarList', {
    deviceFp,
  })
  if (!avatarBaseListData) return null
  // 是否返回原始数据
  if (origin) return avatarBaseListData.avatar_list
  // 格式化数据
  const result = avatarBaseListData.avatar_list.map(
    item => new ZZZAvatarBasic(item)
  )
  return result
}

/**
 * 获取角色详细信息列表
 * @param api
 * @param deviceFp
 * @param origin 是否返回原始数据
 */
export async function getAvatarInfoList(api: MysZZZApi, deviceFp: string, origin?: false): Promise<ZZZAvatarInfo[] | null>
export async function getAvatarInfoList(api: MysZZZApi, deviceFp: string, origin: true): Promise<Mys.Avatar[] | null>
export async function getAvatarInfoList(api: MysZZZApi, deviceFp: string, origin: boolean = false) {
  // 获取角色基础信息列表
  // @ts-expect-error
  const avatarBaseList = await getAvatarBasicList(api, deviceFp, origin)
  if (!avatarBaseList) return null
  // 获取角色详细信息列表
  const avatarInfoList = []
  for (const item of avatarBaseList) {
    const data = await api.getFinalData('zzzAvatarInfo', {
      deviceFp,
      query: {
        id_list: [item.id],
      },
    })
    if (!data || !data.avatar_list || data.avatar_list.length === 0) continue
    avatarInfoList.push(data.avatar_list[0])
    const time = _.get(settings.getConfig('panel'), 'roleInterval', 3000)
    let refresh
    if (time > 100) {
      refresh = time
    } else {
      refresh = 100
    }
    await new Promise(resolve => setTimeout(resolve, refresh))
  }
  if (!avatarInfoList?.length) return null
  // 是否返回原始数据
  if (origin) return avatarInfoList
  // 格式化数据
  const result = avatarInfoList.map(item => new ZZZAvatarInfo(item))
  return result
}

/**
 * 更新面板数据
 * @param uid 用户 ID
 * @param newData 新数据
 * @returns 合并后的数据
 */
export const updatePanelData = (uid: string, newData: Mys.Avatar[]) => {
  // 获取已保存数据
  const originData = getPanelData(uid)
  // 初始化最终数据
  const finalData = [...newData]
  // 如果有已保存的数据
  if (originData) {
    // 合并数据
    for (const item of originData) {
      if (!finalData.find(i => i.id === item.id)) {
        // 将已保存的数据添加到最终数据中（放在后面）
        finalData.push(item)
      }
    }
  }

  // 保存数据
  savePanelData(uid, finalData)

  // 标记新数据
  finalData.forEach(item => {
    item.isNew = !!newData.find(i => i.id === item.id)
  })

  return finalData
}

/**
 * 刷新面板
 * @param api
 * @param deviceFp
 */
export const refreshPanel = async (api: MysZZZApi, deviceFp: string) => {
  // 获取新数据
  const newData = await getAvatarInfoList(api, deviceFp, true)
  if (!newData) return null
  return mergePanel(api.uid, newData)
}

/**
 * 合并保存新面板
 * @param uid UID
 * @param newData 新数据
 */
export const mergePanel = async (uid: string, newData: Mys.Avatar[]) => {
  // 合并新旧数据
  const finalData = updatePanelData(uid, newData)
  const formattedData = finalData.map(item => new ZZZAvatarInfo(item))
  for (const item of formattedData) {
    // 下载图片资源
    await item.get_basic_assets()
  }
  return formattedData
}

/**
 * 获取面板数据
 */
export const getPanelList = (uid: string) => {
  const data = getPanelData(uid)
  return data.map(item => new ZZZAvatarInfo(item))
}

/**
 * 获取面板数据（原始数据）
 */
export const getPanelListOrigin = (uid: string) => {
  return getPanelData(uid)
}

/**
 * 获取某个角色的面板数据
 * @returns false name对应角色不存在 | null 无面板数据 | ZZZAvatarInfo 面板数据
 */
export const getPanel = (uid: string, name: string) => {
  // 通过名称（包括别名）获取角色 ID
  const id = char.aliasToId(name)
  if (!id) return false
  const _data = getPanelData(uid)
  // 获取所有面板数据
  const data = _data.map(item => new ZZZAvatarInfo(item))
  // 通过 ID 获取角色数据
  const result = data.find(item => item.id === id)
  if (!result) return null
  return result
}

/**
 * 获取某个角色的面板数据（原始数据）
 * @returns false name对应角色不存在 | null 无面板数据 | Mys.Avatar 面板数据
 */
export const getPanelOrigin = (uid: string, name: string) => {
  const id = char.aliasToId(name)
  if (!id) return false
  const data = getPanelData(uid)
  // 通过 ID 获取角色数据
  const result = data.find(item => item.id === id)
  if (!result) return null
  return result
}

/**
 * 将Mys.Avatar[]数据格式化为ZZZAvatarInfo[]
 */
export const formatPanelDatas = (data: Mys.Avatar[]) => {
  return data.map(item => new ZZZAvatarInfo(item))
}

/**
 * 将Mys.Avatar数据格式化为ZZZAvatarInfo
 */
export const formatPanelData = (data: Mys.Avatar) => {
  return new ZZZAvatarInfo(data)
}
