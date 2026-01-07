const ELEMENT_TYPE = {
  200: 'physdmg',
  201: 'fire',
  202: 'ice',
  203: 'thunder',
  205: 'dungeon',
}

const SUB_ELEMENT_TYPE = {
  1: 'frost',
  2: 'auricInk',
  4: 'honedEdge',
}

/**
 * 元素ID转元素类型名
 */
export const IDToElement = (id: keyof typeof ELEMENT_TYPE, sub_id: keyof typeof SUB_ELEMENT_TYPE) => {
  if (sub_id && SUB_ELEMENT_TYPE[sub_id])
    return SUB_ELEMENT_TYPE[sub_id]
  return ELEMENT_TYPE[id]
}
