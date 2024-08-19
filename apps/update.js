import _ from 'lodash'
import { rulePrefix } from '../lib/common.js'
import { pluginName } from '../lib/path.js'
import settings from '../lib/settings.js'

let Update = null
try {
  Update = (await import("../../other/update.js").catch(e => null))?.update
  Update ||= (await import("../../system/apps/update.ts")).update
} catch (e) {
  logger.error(`[${pluginName}]未获取到更新js ${logger.yellow("更新功能")} 将无法使用`)
}

export class update extends plugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Update',
      dsc: 'zzzupdate',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'update', 70),
      rule: [
        {
          reg: `^${rulePrefix}(插件)?(强制)?更新(插件)?$`,
          fnc: 'update',
        },
        {
          reg: `^${rulePrefix}(插件)?更新日志$`,
          fnc: 'update_log',
        }
      ],
    })
  }

  async update(e = this.e) {
    if (!e.isMaster) return
    e.msg = `#${e.msg.includes("强制") ? "强制" : ""}更新${pluginName}`
    const up = new Update(e)
    up.e = e
    return up.update()
  }

  async update_log() {
    let Update_Plugin = new Update()
    Update_Plugin.e = this.e
    Update_Plugin.reply = this.reply

    if (Update_Plugin.getPlugin(pluginName)) {
      this.e.reply(await Update_Plugin.getLog(pluginName))
    }
    return true
  }
}
