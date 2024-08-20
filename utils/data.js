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

/**
 * 将 Markdown 日志行转换为 HTML
 * @param {*} line
 * @returns
 */
export const mdLogLineToHTML = function (line) {
  // 去除行首空格和换行符
  line = line.replace(/(^\s*\*|\r)/g, '');
  // 替换行内代码块
  line = line.replace(/\s*`([^`]+`)/g, '<span class="cmd">$1');
  line = line.replace(/`\s*/g, '</span>');
  // 替换行内加粗
  line = line.replace(/\s*\*\*([^\*]+\*\*)/g, '<span class="strong">$1');
  line = line.replace(/\*\*\s*/g, '</span>');
  // 替换行内表示更新内容
  line = line.replace(/ⁿᵉʷ/g, '<span class="new"></span>');
  // 返回转换后的行内容（HTML）
  return line.trim();
};
