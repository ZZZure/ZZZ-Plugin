const RANK_MAP = {
  4: 'S',
  3: 'A',
  2: 'B',
};

/**
 * 获取星级对应的字母
 * @param {string | number} id
 * @returns {string}
 */
export function getRankChar(id) {
  return RANK_MAP[id] || '';
}
