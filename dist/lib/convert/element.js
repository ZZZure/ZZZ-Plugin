import { getMapData } from '../../utils/file.js';
const ElementData = getMapData('ElementData');
export function idToData(id, sub_id = 0) {
    id = Number(id);
    sub_id = Number(sub_id);
    return ElementData.find(i => i.element_type === id && i.sub_element_type === sub_id) || null;
}
export function idToName(id, sub_id = 0) {
    const data = idToData(id, sub_id);
    if (!data)
        return '';
    return data.en_sub;
}
export function idToPropertyId(id) {
    const data = idToData(id);
    if (!data)
        return null;
    return data.property_id;
}
//# sourceMappingURL=element.js.map