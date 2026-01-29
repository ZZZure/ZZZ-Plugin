import { getMapData } from '../../utils/file.js';
const SuitData = getMapData('SuitData');
export function idToSprite(equipId) {
    equipId = equipId.toString();
    if (equipId.length === 5) {
        const suitId = equipId.slice(0, 3) + '00';
        if (SuitData.hasOwnProperty(suitId)) {
            return SuitData[suitId]['sprite_file'];
        }
    }
    return null;
}
export function getAllSuitID() {
    return Object.keys(SuitData);
}
//# sourceMappingURL=equip.js.map