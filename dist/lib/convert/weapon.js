import { getMapData } from '../../utils/file.js';
const WeaponId2Data = getMapData('WeaponId2Data');
export const idToFileName = (id) => {
    const data = WeaponId2Data?.[id]?.CodeName;
    return data;
};
export const fileNameToId = (name) => {
    for (const [id, data] of Object.entries(WeaponId2Data)) {
        if (data.CodeName === name)
            return id;
    }
    return null;
};
export const getAllWeaponID = () => {
    return Object.keys(WeaponId2Data);
};
//# sourceMappingURL=weapon.js.map