import { getMapData } from '../../utils/file.js';
const BangbooId2Data = getMapData('BangbooId2Data');
export const idToData = (bangboo_id) => {
    return BangbooId2Data[bangboo_id] || null;
};
export const idToName = (bangboo_id) => {
    return BangbooId2Data[bangboo_id]?.CHS || null;
};
export const idToSprite = (bangboo_id) => {
    return BangbooId2Data[bangboo_id]?.sprite_id || null;
};
export const getAllBangbooID = () => {
    return Object.keys(BangbooId2Data);
};
//# sourceMappingURL=bangboo.js.map