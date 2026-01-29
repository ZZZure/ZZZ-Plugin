import { getMapData } from '../../utils/file.js';
const propertyData = getMapData('Property2Name');
const prop_id = {
    111: 'hpmax',
    121: 'attack',
    131: 'def',
    122: 'breakstun',
    201: 'crit',
    211: 'critdam',
    314: 'elementabnormalpower',
    312: 'elementmystery',
    231: 'penratio',
    232: 'penvalue',
    305: 'sprecover',
    310: 'spgetratio',
    115: 'spmax',
    315: 'physdmg',
    316: 'fire',
    317: 'ice',
    318: 'thunder',
    319: 'dungeonbuffether',
};
const pro_id = {
    1: 'attack',
    2: 'stun',
    3: 'anomaly',
    4: 'support',
    5: 'defense',
};
export function idToClassName(_id) {
    const propId = +_id.toString().slice(0, 3);
    const propIcon = prop_id[propId];
    if (!propIcon)
        return null;
    return propIcon;
}
export const idToSignName = (id) => {
    const result = propertyData[id];
    if (!result)
        return null;
    return result[0];
};
export const idToName = (id) => {
    const result = propertyData[id];
    if (!result)
        return null;
    return result[1];
};
export const idToShortName2 = (id) => {
    const result = propertyData[id];
    if (!result)
        return '';
    return result[2];
};
export const idToShortName3 = (id) => {
    const result = propertyData[id];
    if (!result)
        return '';
    return result[3];
};
export const nameToShortName3 = (propName) => {
    for (const id in propertyData) {
        if (propertyData[id][1] === propName)
            return propertyData[id][3];
    }
    ;
    return propName;
};
export const nameToId = (propName) => {
    for (const id in propertyData) {
        if (propertyData[id][1] === propName ||
            propertyData[id][1].replace('属性', '') === propName)
            return Number(id);
    }
    ;
    return 0;
};
export const nameZHToNameEN = (propNameZH) => {
    for (const id in propertyData) {
        if (propertyData[id]?.[1] === propNameZH)
            return propertyData[id][0];
    }
    ;
    return '';
};
//# sourceMappingURL=property.js.map