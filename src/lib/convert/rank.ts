const RANK_MAP = {
  '4': 'S',
  '3': 'A',
  '2': 'B',
}

/**
 * 获取星级对应的字母
 * @param id
 */
export function getRankChar(id: keyof typeof RANK_MAP) {
  return RANK_MAP[id] || ''
}
