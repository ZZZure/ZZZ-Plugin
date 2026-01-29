import fs from 'fs';
import lodash from 'lodash';
import path from 'path';
import { pluginPath } from './path.js';
import { mdLogLineToHTML } from '../utils/data.js';
const _logPath = path.join(pluginPath, 'CHANGELOG.md');
const changelogs = [];
let currentVersion = '';
let versionCount = 4;
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
try {
    if (fs.existsSync(_logPath)) {
        const logs = (fs.readFileSync(_logPath, 'utf8') || '').split('\n');
        let temp = {};
        let lastLine = {};
        lodash.forEach(logs, line => {
            const versionRet = /^#\s*([0-9a-zA-Z\\.~\s]+?)\s*$/.exec(line);
            if (versionRet && versionRet[1]) {
                const v = versionRet[1].trim();
                if (!currentVersion) {
                    currentVersion = v;
                }
                else {
                    changelogs.push(temp);
                    if (/0\s*$/.test(v) && versionCount > 0) {
                        versionCount = 0;
                    }
                    else {
                        versionCount--;
                    }
                }
                temp = {
                    version: v,
                    logs: [],
                };
            }
            else {
                if (!line.trim()) {
                    return;
                }
                if (/^\*/.test(line)) {
                    lastLine = {
                        title: mdLogLineToHTML(line),
                        logs: [],
                    };
                    temp.logs.push(lastLine);
                }
                else if (/^\s{2,}\*/.test(line)) {
                    lastLine.logs.push(mdLogLineToHTML(line));
                }
            }
        });
    }
}
catch (e) {
}
const yunzaiVersion = packageJson.version;
const isV3 = yunzaiVersion[0] === '3';
let isMiao = false;
let name = 'Yunzai-Bot';
if (packageJson.name === 'miao-yunzai') {
    isMiao = true;
    name = 'Miao-Yunzai';
}
else if (packageJson.name === 'trss-yunzai') {
    isMiao = true;
    name = 'TRSS-Yunzai';
}
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
//# sourceMappingURL=version.js.map