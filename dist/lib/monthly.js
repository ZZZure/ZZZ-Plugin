import { getMonthlyData, saveMonthlyData } from './db.js';
import _ from 'lodash';
export const saveMonthlyNewData = (uid, ...newDatas) => {
    const savedData = getMonthlyData(uid);
    const mergedData = _.unionBy(newDatas, savedData, 'data_month').sort((a, b) => +a.data_month - +b.data_month);
    saveMonthlyData(uid, mergedData);
    return mergedData.reverse();
};
export const getMonthly = async (api, deviceFp, month) => {
    const data = await api.getFinalData('zzzMonthly', {
        deviceFp,
        query: { month },
    });
    if (data) {
        saveMonthlyNewData(api.uid, data);
    }
    return data;
};
export const getMonthlyCollect = async (api, deviceFp) => {
    const currentData = await getMonthly(api, deviceFp, '');
    if (!currentData)
        return null;
    const newDatas = [currentData];
    const availableData = currentData.optional_month.filter(month => month !== currentData.data_month);
    for (const month of availableData) {
        const data = await getMonthly(api, deviceFp, month);
        if (data)
            newDatas.push(data);
    }
    const mergedData = saveMonthlyNewData(api.uid, ...newDatas);
    return mergedData;
};
//# sourceMappingURL=monthly.js.map