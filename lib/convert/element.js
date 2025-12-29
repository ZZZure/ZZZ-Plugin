const ELEMENT_TYPE = {
  203: 'thunder',
  205: 'dungeon',
  202: 'ice',
  200: 'physdmg',
  201: 'fire',
};
const SUB_ELEMENT_TYPE = {
  1: 'frost',
  2: 'auricInk',
  3: 'rimeEdge',
};
/**
 *
 * @param {keyof ELEMENT_TYPE} id
 * @param {keyof SUB_ELEMENT_TYPE} sub_id
 * @returns
 */
export const IDToElement = (id, sub_id) => {
  if (sub_id && SUB_ELEMENT_TYPE[sub_id])
    return SUB_ELEMENT_TYPE[sub_id];
  return ELEMENT_TYPE[id];
};
