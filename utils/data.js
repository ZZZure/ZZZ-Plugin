import _ from 'lodash';
/**
 * 生成随机字符串
 * @param {number} length 长度
 * @returns {string}
 */
export const randomString = length => {
  let randomStr = '';
  for (let i = 0; i < length; i++) {
    randomStr += _.sample('abcdefghijklmnopqrstuvwxyz0123456789');
  }
  return randomStr;
};

/**
 * 生成随机种子
 * @param {number} length 长度
 * @returns {string}
 */
export const generateSeed = (length = 16) => {
  const characters = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  return result;
};
