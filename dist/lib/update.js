import { mdLogLineToHTML } from '../utils/data.js';
import { pluginName } from './path.js';
import { exec } from 'child_process';
import _ from 'lodash';
let Update = null;
try {
    Update = (await import('../../../other/update.js').catch(e => null))?.update;
    Update ||= (await import('../../system/apps/update.js')).update;
}
catch (e) {
    logger.error(`[${pluginName}]未获取到更新js ${logger.yellow('更新功能')} 将无法使用`);
}
let ZZZUpdate = null;
if (Update) {
    ZZZUpdate = class ZZZUpdate extends Update {
        exec(cmd, plugin, opts = {}) {
            if (plugin)
                opts.cwd = `plugins/${plugin}`;
            return new Promise(resolve => {
                exec(cmd, { windowsHide: true, ...opts }, (error, stdout, stderr) => {
                    resolve({ error, stdout: stdout.toString().trim(), stderr: stderr.toString().trim() });
                });
            });
        }
        async handleLog(remote = false) {
            let cmdStr = 'git log -100 --pretty="%h||%cd||%s" --date=format:"%Y-%m-%d %H:%M:%S"';
            if (remote) {
                await this.exec('git fetch origin main', pluginName);
                cmdStr =
                    'git log -100 --pretty="%h||%cd||%s" --date=format:"%Y-%m-%d %H:%M:%S" origin/main';
            }
            const cm = await this.exec(cmdStr, pluginName);
            if (cm.error) {
                throw new Error(cm.error.message);
            }
            const logAll = cm.stdout.split('\n');
            if (!logAll.length) {
                throw new Error('未获取到更新日志');
            }
            const log = [];
            let current = true;
            for (const str of logAll) {
                if (!str)
                    continue;
                const sp = str.split('||');
                if (sp[0] === this.oldCommitId)
                    break;
                if (sp[2].includes('Merge'))
                    continue;
                const commit = {
                    commit: sp[0],
                    date: sp[1],
                    msg: mdLogLineToHTML(sp[2]),
                    local: !remote,
                    current: false,
                };
                if (!remote && current) {
                    commit.current = true;
                    current = false;
                }
                log.push(commit);
            }
            return log;
        }
        async getZZZLog() {
            const log = await this.handleLog();
            return log;
        }
        async getZZZRemoteLog() {
            const log = await this.handleLog(true);
            return log;
        }
        async getZZZAllLog() {
            const localLog = await this.getZZZLog();
            const remoteLog = await this.getZZZRemoteLog();
            const logs = _.unionBy(localLog, remoteLog, 'commit');
            logs.sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            return logs;
        }
        async hasUpdate() {
            const logs = await this.getZZZAllLog();
            const newLogs = logs.filter(log => !log.local);
            const result = {
                hasUpdate: false,
                logs: [],
            };
            if (newLogs.length) {
                result.hasUpdate = true;
                result.logs = newLogs;
            }
            return result;
        }
    };
}
export { ZZZUpdate };
