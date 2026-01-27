import { getMapData } from '../../utils/file.js'

const ElementData = getMapData('ElementData')

/**
 * 元素ID转元素数据
 * @param id element_type
 * @param sub_id sub_element_type
 */
export function idToData(id: string | number, sub_id: string | number = 0) {
  id = Number(id)
  sub_id = Number(sub_id)
  return ElementData.find(i => i.element_type === id && i.sub_element_type === sub_id) || null
}

/**
 * 获取元素名（en_sub）
 */
export function idToName(id: string | number, sub_id: string | number = 0) {
  const data = idToData(id, sub_id)
  if (!data) return ''
  return data.en_sub
}

/**
 * ID转属性ID
 */
export function idToPropertyId(id: string | number) {
  const data = idToData(id)
  if (!data) return null
  return data.property_id
}