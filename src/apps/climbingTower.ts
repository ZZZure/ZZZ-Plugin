import type { Mys } from "#interface"
import { rulePrefix } from "../lib/common.js"
import { ZZZPlugin } from "../lib/plugin.js"
import settings from "../lib/settings.js"

export class ClimbingTower extends ZZZPlugin {
  constructor() {
    super({
      name: "[ZZZ-Plugin]climbingTower",
      dsc: "zzz爬塔",
      event: "message",
      priority: settings.getConfig("priority")?.climbingTower ?? 70,
      rule: [
        {
          reg: `${rulePrefix}(拟真鏖战试炼|鏖战|爬塔)$`,
          fnc: "climbingTower",
        },
      ],
    })
  }

  async climbingTower() {
    const { api, deviceFp } = await this.getAPI()
    await this.getPlayerInfo()

    const climbingTowerDetail = await api
      .getFinalData("zzzClimbingTower", {
        deviceFp,
      })
      .catch((e: Error) => {
        this.reply(e.message)
        throw e
      })
    if (!climbingTowerDetail) {
      return this.reply("暂无爬塔数据")
    }

    const finalData = {
      climbingTower: climbingTowerDetail,
    }
    await this.render("climbingTower/index.html", finalData, this)
  }

}