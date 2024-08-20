import _ from 'lodash';
import { pluginName } from '../lib/path.js';
import { mdLogLineToHTML } from '../utils/data.js';
import { exec } from 'child_process';
let Update = null;
try {
  Update = (await import('../../other/update.js').catch(e => null))?.update;
  Update ||= (await import('../../system/apps/update.ts')).update;
} catch (e) {
  logger.error(
    `[${pluginName}]未获取到更新js ${logger.yellow('更新功能')} 将无法使用`
  );
}
let ZZZUpdate = null;
/**
 * @typedef {Object} CommitLog
 * @property {string} commit 提交ID
 * @property {string} date 提交时间
 * @property {string} msg 提交信息
 * @property {boolean} local 是否本地记录
 * @property {current} boolean 是否当前版本
 */
/**
 * @typedef {Object} UpdateInfo
 * @property {boolean} hasUpdate 是否有更新
 * @property {CommitLog[]} logs 更新日志
 */
if (Update) {
  ZZZUpdate = class ZZZUpdate extends Update {
    exec(cmd, plugin, opts = {}) {
      if (plugin) opts.cwd = `plugins/${plugin}`;
      return new Promise(resolve => {
        exec(cmd, { windowsHide: true, ...opts }, (error, stdout, stderr) => {
          stdout = stdout.trim();
          resolve({ error, stdout, stderr });
        });
      });
    }

    async handleLog(remote = false) {
      let cmdStr =
        'git log -100 --pretty="%h||%cd||%s" --date=format:"%Y-%m-%d %H:%M:%S"';
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
      /** @type CommitLog[] */
      const log = [];
      let current = true;
      for (let str of logAll) {
        if (!str) continue;
        str = str.split('||');
        if (str[0] === this.oldCommitId) break;
        if (str[2].includes('Merge')) continue;
        /** @type CommitLog */
        const commit = {
          commit: str[0],
          date: str[1],
          msg: mdLogLineToHTML(str[2]),
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
        return new Date(b.date) - new Date(a.date);
      });
      return logs;
    }

    async hasUpdate() {
      const logs = await this.getZZZAllLog();
      const newLogs = logs.filter(log => !log.local);
      /** @type UpdateInfo */
      let result = {
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
