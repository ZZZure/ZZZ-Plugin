import { getMonthlyData, saveMonthlyData } from './db.js';
import MysZZZApi from './mysapi.js';
import _ from 'lodash';

/**
 * 保存月度数据
 * @param {string} uid
 * @param {object} newData
 */
export const saveMonthlyNewData = (uid, ...newDatas) => {
  // 获取先前月度数据
  const savedData = getMonthlyData(uid);
  // 合并新旧数据
  const mergedData = _.unionBy(newDatas, savedData, 'data_month').sort(
    (a, b) => a.data_month - b.data_month
  );
  // 保存数据
  saveMonthlyData(uid, mergedData);
  return mergedData.reverse();
};

/**
 * 获取月度数据
 * @param {MysZZZApi} api
 * @param {string} month
 * @returns {Promise<object | null>}
 */
export const getMonthly = async (api, month) => {
  // 获取月度数据
  const data = await api.getFinalData('zzzMonthly', {
    query: { month },
  });
  saveMonthlyNewData(api.uid, data);
  return data;
};

/**
 * 月度数据（统计）
 * @param {MysZZZApi} api
 * @returns {Promise<object | null>}
 */
export const getMonthlyCollect = async api => {
  // 获取当前月度数据
  const currentData = await getMonthly(api, '');

  if (!currentData) return null;

  const newDatas = [currentData];
  // 获取所有可查询月份
  const availableData = currentData.optional_month.filter(
    month => month !== currentData.data_month
  );

  for (const month of availableData) {
    const data = await getMonthly(api, month);
    if (data) newDatas.push(data);
  }

  // 合并新旧数据
  const mergedData = saveMonthlyNewData(api.uid, ...newDatas);

  return mergedData;
};
