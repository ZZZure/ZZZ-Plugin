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
export const IDToElement = (id: string | number, sub_id?: string | number) => {
  if (sub_id && SUB_ELEMENT_TYPE[sub_id as keyof typeof SUB_ELEMENT_TYPE])
    return SUB_ELEMENT_TYPE[sub_id as keyof typeof SUB_ELEMENT_TYPE]
  return ELEMENT_TYPE[id as keyof typeof ELEMENT_TYPE] || 'unknown'
}
