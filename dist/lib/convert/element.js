const ELEMENT_TYPE = {
    200: 'physdmg',
    201: 'fire',
    202: 'ice',
    203: 'thunder',
    205: 'dungeon',
};
const SUB_ELEMENT_TYPE = {
    1: 'frost',
    2: 'auricInk',
    4: 'honedEdge',
};
export const IDToElement = (id, sub_id) => {
    if (sub_id && SUB_ELEMENT_TYPE[sub_id])
        return SUB_ELEMENT_TYPE[sub_id];
    return ELEMENT_TYPE[id] || 'unknown';
};
