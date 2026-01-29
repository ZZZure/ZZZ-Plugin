import settings from '../settings.js';
import { getMapData } from '../../utils/file.js';
const PartnerId2Data = getMapData('PartnerId2Data');
export const idToName = (id, full = true, en = false) => {
    const data = PartnerId2Data?.[id];
    if (!data)
        return null;
    if (en)
        return data?.['en_name'];
    if (full)
        return data?.['full_name'];
    return data?.['name'];
};
export const idToSprite = (id) => {
    const data = PartnerId2Data?.[id];
    if (!data)
        return null;
    return data?.['sprite_id'];
};
export const idToData = (id) => {
    return PartnerId2Data[id] || null;
};
export const nameToId = (name) => {
    for (const [id, data] of Object.entries(PartnerId2Data)) {
        if (data['name'] === name)
            return Number(id);
        if (data['full_name'] && data['full_name'] === name)
            return Number(id);
    }
    return null;
};
export const nameToSprite = (name) => {
    for (const [_id, data] of Object.entries(PartnerId2Data)) {
        if (data['name'] === name)
            return data['sprite_id'];
    }
    return null;
};
export const aliasToName = (_alias) => {
    const alias = settings.getConfig('alias');
    for (const [name, data] of Object.entries(alias)) {
        if (name === _alias)
            return name;
        if (data.includes(_alias))
            return name;
    }
    for (const [_, data] of Object.entries(PartnerId2Data)) {
        if (data['name'] === _alias)
            return data['name'];
        if (data['full_name'] && data['full_name'] === _alias)
            return data['name'];
    }
    return null;
};
export const aliasToSprite = (_alias) => {
    const name = aliasToName(_alias);
    return nameToSprite(name);
};
export const aliasToId = (name) => {
    const _name = aliasToName(name);
    const id = nameToId(_name);
    return id;
};
export const getAllCharactersID = () => {
    return Object.keys(PartnerId2Data).filter(id => id !== '2011' && id !== '2021');
};
export const skinIdToFilename = (id, skin_id) => {
    const data = PartnerId2Data?.[id];
    if (!data)
        return null;
    const skinData = data.Skin;
    return skinData?.[skin_id]?.Image || null;
};
//# sourceMappingURL=char.js.map