import { nameToId } from './convert/property.js';
import { getMapData } from '../utils/file.js';
import { char } from './convert.js';
export const baseValueData = getMapData('EquipBaseValue');
const elementType2propId = (elementType) => [31503, 31603, 31703, 31803, , 31903][elementType - 200];
export function formatScoreWeight(oriScoreWeight, charID) {
    if (!oriScoreWeight)
        return false;
    if (Array.isArray(oriScoreWeight))
        return oriScoreWeight;
    if (typeof oriScoreWeight !== 'object')
        return false;
    const weight = {};
    for (const propName in oriScoreWeight) {
        if (!oriScoreWeight[propName] && oriScoreWeight[propName] !== 0)
            continue;
        let propID;
        if (charID && propName === '属性伤害加成') {
            propID = elementType2propId(+char.idToData(charID)?.ElementType);
        }
        else {
            propID = +propName || nameToId(propName);
        }
        if (!propID)
            continue;
        weight[propID] = oriScoreWeight[propName];
    }
    ;
    return weight;
}
export const getEquipPropertyEnhanceCount = (propertyID, value) => {
    const baseValue = baseValueData[propertyID];
    const numericValue = +value.replace('%', '');
    return Math.trunc(numericValue / baseValue - 1 || 0);
};
//# sourceMappingURL=score.js.map