import type MysZZZApi from './mysapi.js'
import type { Mys } from '#interface'
import { getMonthlyData, saveMonthlyData } from './db.js'
import _ from 'lodash'

/**
 * 保存月度数据
 */
export const saveMonthlyNewData = (uid: string, ...newDatas: Mys.Monthly[]) => {
  // 获取先前月度数据
  const savedData = getMonthlyData(uid)
  // 合并新旧数据
  const mergedData = _.unionBy(newDatas, savedData, 'data_month').sort(
    (a, b) => +a.data_month - +b.data_month
  )
  // 保存数据
  saveMonthlyData(uid, mergedData)
  return mergedData.reverse()
}

/**
 * 获取月度数据
 * @param api
 * @param deviceFp
 * @param month 月份
 */
export const getMonthly = async (api: MysZZZApi, deviceFp: string, month: string) => {
  // 获取月度数据
  const data = await api.getFinalData('zzzMonthly', {
    deviceFp,
    query: { month },
  })
  if (data) {
    saveMonthlyNewData(api.uid, data)
  }
  return data
}

/**
 * 月度数据（统计）
 */
export const getMonthlyCollect = async (api: MysZZZApi, deviceFp: string) => {
  // 获取当前月度数据
  const currentData = await getMonthly(api, deviceFp, '')
  if (!currentData) return null
  const newDatas = [currentData]
  // 获取所有可查询月份
  const availableData = currentData.optional_month.filter(
    month => month !== currentData.data_month
  )
  for (const month of availableData) {
    const data = await getMonthly(api, deviceFp, month)
    if (data) newDatas.push(data)
  }
  // 合并新旧数据
  const mergedData = saveMonthlyNewData(api.uid, ...newDatas)
  return mergedData
}
