import _ from 'lodash'

/**
 * 生成随机字符串
 * @param length 长度
 */
export const randomString = (length: number) => {
  let randomStr = ''
  for (let i = 0; i < length; i++) {
    randomStr += _.sample('abcdefghijklmnopqrstuvwxyz0123456789')
  }
  return randomStr
}

/**
 * 生成随机种子
 * @param length 长度
 */
export const generateSeed = (length: number = 16) => {
  const characters = '0123456789abcdef'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)]
  }
  return result
}

/**
 * 将 Markdown 日志行转换为 HTML
 */
export const mdLogLineToHTML = function (line: string): string {
  // 去除行首空格和换行符
  line = line.replace(/(^\s*\*|\r)/g, '')
  // 替换行内代码块
  line = line.replace(/\s*`([^`]+`)/g, '<span class="cmd">$1')
  line = line.replace(/`\s*/g, '</span>')
  // 替换行内加粗
  line = line.replace(/\s*\*\*([^\*]+\*\*)/g, '<span class="strong">$1')
  line = line.replace(/\*\*\s*/g, '</span>')
  // 替换行内表示更新内容
  line = line.replace(/ⁿᵉʷ/g, '<span class="new"></span>')
  // 返回转换后的行内容（HTML）
  return line.trim()
}
