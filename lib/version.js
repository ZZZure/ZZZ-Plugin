import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import { pluginPath } from './path.js';
import { mdLogLineToHTML } from '../utils/data.js';

// 更新日志文件位置
const _logPath = path.join(pluginPath, 'CHANGELOG.md');

// 存放日志
let logs = {};

// 存放更新日志
let changelogs = [];

// 当前版本
let currentVersion;

// 版本数量
let versionCount = 4;

// 读取 package.json（此处为读取Yunzai-Bot的package.json）
let packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// 尝试读取更新日志文件
try {
  if (fs.existsSync(_logPath)) {
    // 如果文件存在，读取文件内容
    logs = fs.readFileSync(_logPath, 'utf8') || '';
    // 将文件内容按行分割
    logs = logs.split('\n');

    // 遍历每一行，提取版本号和更新内容
    let temp = {};
    let lastLine = {};
    lodash.forEach(logs, line => {
      // 如果版本数量小于0，返回false
      // if (versionCount <= -1) {
      //   return false;
      // }
      // 匹配版本号
      const versionRet = /^#\s*([0-9a-zA-Z\\.~\s]+?)\s*$/.exec(line);
      if (versionRet && versionRet[1]) {
        // 如果匹配到版本号，提取版本号
        const v = versionRet[1].trim();
        if (!currentVersion) {
          // 如果当前版本号不存在，将当前版本号设置为匹配到的版本号
          currentVersion = v;
        } else {
          // 写入更新日志
          changelogs.push(temp);
          if (/0\s*$/.test(v) && versionCount > 0) {
            versionCount = 0;
          } else {
            versionCount--;
          }
        }
        temp = {
          version: v,
          logs: [],
        };
      } else {
        // 如果行为空，不继续执行
        if (!line.trim()) {
          return;
        }
        // 如果行以 * 开头，表示更新内容
        if (/^\*/.test(line)) {
          lastLine = {
            title: mdLogLineToHTML(line),
            logs: [],
          };
          temp.logs.push(lastLine);
        } else if (/^\s{2,}\*/.test(line)) {
          lastLine.logs.push(mdLogLineToHTML(line));
        }
      }
    });
  }
} catch (e) {
  // void error
}

// 读取Yunzai-Bot的版本号
const yunzaiVersion = packageJson.version;

// 判断是否为Yunzai-Bot v3
const isV3 = yunzaiVersion[0] === '3';

// 是否为喵（默认为否）
let isMiao = false;
// bot名称
let name = 'Yunzai-Bot';
if (packageJson.name === 'miao-yunzai') {
  // 如果是喵，将 isMiao 设置为 true，name 设置为 Miao-Yunzai
  isMiao = true;
  name = 'Miao-Yunzai';
} else if (packageJson.name === 'trss-yunzai') {
  // 如果是 TRSS-Yunzai，将 isMiao 设置为 true，name 设置为 TRSS-Yunzai
  isMiao = true;
  name = 'TRSS-Yunzai';
}

// 导出版本信息
const version = {
  isV3,
  isMiao,
  name,
  get version() {
    return currentVersion;
  },
  get yunzai() {
    return yunzaiVersion;
  },
  get changelogs() {
    return changelogs;
  },
};

export default version;
