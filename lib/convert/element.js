const ELEMENT_TYPE = {
  203: 'thunder',
  205: 'dungeon',
  202: 'ice',
  200: 'physdmg',
  201: 'fire',
};
/**
 *
 * @param {keyof ELEMENT_TYPE} id
 * @returns
 */
export const IDToElement = id => {
  return ELEMENT_TYPE[id];
};
