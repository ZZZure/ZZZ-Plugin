import { getMapData } from '../../utils/file.js';
const BangbooId2Data = getMapData('BangbooId2Data');
export const bangbooIdToData = (bangboo_id) => {
    return BangbooId2Data[bangboo_id] || null;
};
export const bangbooIdToName = (bangboo_id) => {
    return BangbooId2Data[bangboo_id]?.CHS || null;
};
export const bangbooIdToSprite = (bangboo_id) => {
    return BangbooId2Data[bangboo_id]?.sprite_id || null;
};
export const getAllBangbooID = () => {
    return Object.keys(BangbooId2Data);
};
