import { mdLogLineToHTML } from '../utils/data.js'
import { pluginName } from './path.js'
import { exec } from 'child_process'
import _ from 'lodash'

let Update = null
try {
  // @ts-ignore
  Update = (await import('../../../other/update.js').catch(e => null))?.update
  // @ts-ignore
  Update ||= (await import('../../system/apps/update.js')).update
} catch (e) {
  logger.error(
    `[${pluginName}]未获取到更新js ${logger.yellow('更新功能')} 将无法使用`
  )
}
let ZZZUpdate = null

type CommitLog = {
  /** 提交ID */
  commit: string
  /** 提交时间 */
  date: string
  /** 提交信息 */
  msg: string
  /** 是否本地记录 */
  local: boolean
  /** 是否当前版本 */
  current: boolean
}

interface UpdateInfo {
  /** 是否有更新 */
  hasUpdate: boolean
  /** 更新日志 */
  logs: CommitLog[]
}

if (Update) {
  ZZZUpdate = class ZZZUpdate extends Update {

    exec(cmd: string, plugin: string, opts: any = {}): Promise<{ error: Error | null, stdout: string, stderr: string }> {
      if (plugin) opts.cwd = `plugins/${plugin}`
      return new Promise(resolve => {
        exec(cmd, { windowsHide: true, ...opts }, (error, stdout, stderr) => {
          resolve({ error, stdout: stdout.toString().trim(), stderr: stderr.toString().trim() })
        })
      })
    }

    async handleLog(remote = false) {
      let cmdStr =
        'git log -100 --pretty="%h||%cd||%s" --date=format:"%Y-%m-%d %H:%M:%S"'
      if (remote) {
        await this.exec('git fetch origin main', pluginName)
        cmdStr =
          'git log -100 --pretty="%h||%cd||%s" --date=format:"%Y-%m-%d %H:%M:%S" origin/main'
      }
      const cm = await this.exec(cmdStr, pluginName)
      if (cm.error) {
        throw new Error(cm.error.message)
      }

      const logAll = cm.stdout.split('\n')
      if (!logAll.length) {
        throw new Error('未获取到更新日志')
      }
      const log = []
      let current = true
      for (let str of logAll) {
        if (!str) continue
        const sp = str.split('||')
        if (sp[0] === this.oldCommitId) break
        if (sp[2].includes('Merge')) continue
        /** @type CommitLog */
        const commit = {
          commit: sp[0],
          date: sp[1],
          msg: mdLogLineToHTML(sp[2]),
          local: !remote,
          current: false,
        }
        if (!remote && current) {
          commit.current = true
          current = false
        }
        log.push(commit)
      }
      return log
    }
    async getZZZLog() {
      const log = await this.handleLog()
      return log
    }

    async getZZZRemoteLog() {
      const log = await this.handleLog(true)
      return log
    }

    async getZZZAllLog() {
      const localLog = await this.getZZZLog()
      const remoteLog = await this.getZZZRemoteLog()
      const logs = _.unionBy(localLog, remoteLog, 'commit')
      logs.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      return logs
    }

    async hasUpdate() {
      const logs = await this.getZZZAllLog()
      const newLogs = logs.filter(log => !log.local)
      const result: UpdateInfo = {
        hasUpdate: false,
        logs: [],
      }
      if (newLogs.length) {
        result.hasUpdate = true
        result.logs = newLogs
      }
      return result
    }
  }
}

export { ZZZUpdate }
