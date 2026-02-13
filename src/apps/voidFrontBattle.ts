import type { Mys } from "#interface"
import { rulePrefix } from "../lib/common.js"
import { ZZZPlugin } from "../lib/plugin.js"
import settings from "../lib/settings.js"
import { saveVoidFrontBattleData } from "../lib/db.js"
import {
  isGroupRankAllowed,
  isUserRankAllowed,
  addUserToGroupRank,
  setUidAndQQ,
} from "../lib/rank.js"

export class VoidFrontBattle extends ZZZPlugin {
  isGroupRankAllowed: typeof isGroupRankAllowed

  constructor() {
    super({
      name: "[ZZZ-Plugin]voidFrontBattle",
      dsc: "zzz临界推演",
      event: "message",
      priority: settings.getConfig("priority")?.voidFrontBattle ?? 70,
      rule: [
        {
          reg: `${rulePrefix}(临界推演|临界|推演)$`,
          fnc: "voidFrontBattle",
        },
      ],
    })
    this.isGroupRankAllowed = isGroupRankAllowed
  }

  async voidFrontBattle() {
    const { api, deviceFp } = await this.getAPI()
    await this.getPlayerInfo()

    const voidFrontBattleAbstractInfo = await api
      .getFinalData("zzzVoidFrontBattleAbstractInfo", {
        deviceFp,
      })
      .catch((e: Error) => {
        this.reply(e.message)
        throw e
      })
    if (!voidFrontBattleAbstractInfo?.has_detail_record) {
      return this.reply("暂无临界推演数据")
    }
    const abstractInfoBrief = voidFrontBattleAbstractInfo?.void_front_battle_abstract_info_brief

    const voidFrontBattleDetail = await api
      .getFinalData("zzzVoidFrontBattleDetail", {
        deviceFp,
        void_front_id: abstractInfoBrief.void_front_id,
      })
      .catch((e: Error) => {
        this.reply(e.message)
        throw e
      })
    if (!voidFrontBattleDetail) {
      return this.reply("获取临界推演详情失败")
    }

    const rank_type = "VOID_FRONT_BATTLE"
    const uid = await this.getUID()
    let userRankAllowed: boolean | null = null
    if (uid) {
      if (this.e?.group_id) {
        await addUserToGroupRank(rank_type, uid, this.e.group_id)
        const qq = this.e.at && !this.e.atBot ? this.e.at : this.e.user_id
        await setUidAndQQ(this.e.group_id, uid, qq)
        userRankAllowed = !!(await isUserRankAllowed(rank_type, uid, this.e.group_id))
      }

      if (this.isGroupRankAllowed()) {
        saveVoidFrontBattleData(uid, {
          player: this.e.playerCard!,
          result: voidFrontBattleDetail,
        })
      }
    }
    const voidFrontBattle = processVoidFrontBattleData(voidFrontBattleDetail)
    const finalData = {
      voidFrontBattle,
      userRankAllowed,
    }
    await this.render("voidFrontBattle/index.html", finalData, this)
  }

}

function processVoidFrontBattleData(
  voidFrontBattle: Mys.VoidFrontBattleDetail & {
    [key: string]: any
  }
) {
  const rankPercent = voidFrontBattle.void_front_battle_abstract_info_brief.rank_percent / 100
  if (rankPercent < 1) {
    voidFrontBattle.rankBg = 1
  } else if (rankPercent < 5) {
    voidFrontBattle.rankBg = 2
  } else if (rankPercent < 10) {
    voidFrontBattle.rankBg = 3
  } else if (rankPercent < 50) {
    voidFrontBattle.rankBg = 4
  } else {
    voidFrontBattle.rankBg = 5
  }
  voidFrontBattle.formatTime = function (time: {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
  }) {
    const pad = (num: number) => num.toString().padStart(2, "0")
    return `${time.year}-${pad(time.month)}-${pad(time.day)} ${pad(time.hour)}:${pad(time.minute)}:${pad(time.second)}`
  }
  return voidFrontBattle
}
