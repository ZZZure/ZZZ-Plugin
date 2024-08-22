/**
 * 欧非分析
 * @param {number} ast
 * @param {number[]} lst
 */
export const getLevelFromList = (ast, lst) => {
  if (ast === 0) {
    return 2;
  }

  let level = 0;
  for (let numIndex = 0; numIndex < lst.length; numIndex++) {
    if (ast <= lst[numIndex]) {
      level = 4 - numIndex;
      break;
    }
  }
  return level;
};
