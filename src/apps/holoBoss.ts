import { isGroupRankAllowed, isUserRankAllowed, addUserToGroupRank, setUidAndQQ } from '../lib/rank.js'
import { rulePrefix } from '../lib/common.js'
import { getHoloBossData, saveHoloBossData } from '../lib/db.js'
import { ZZZPlugin } from '../lib/plugin.js'
import { HoloBoss } from '../model/holoBoss.js'
import settings from '../lib/settings.js'

export class holoBoss extends ZZZPlugin {
  isGroupRankAllowed: typeof isGroupRankAllowed

  constructor() {
    super({
      name: '[ZZZ-Plugin]holoBoss',
      dsc: 'zzz拟境湮灭战',
      event: 'message',
      priority: settings.getConfig('priority')?.holoBoss ?? 70,
      rule: [
        {
          reg: `${rulePrefix}(上期|往期)?(拟境湮灭战|拟境|湮灭|湮灭战)$`,
          fnc: 'holoBoss'
        }
      ]
    })
    this.isGroupRankAllowed = isGroupRankAllowed
  }

  async holoBoss() {
    const { api, deviceFp } = await this.getAPI()
    await this.getPlayerInfo()
    const method = this.e.msg.match(`(上期|往期)`) ? 'zzzHoloBossPeriod' : 'zzzHoloBoss'
    const holoBossData = await api.getFinalData(method, {
      deviceFp
    }).catch((e: Error) => {
      this.reply(e.message)
      throw e
    })
    if (!holoBossData?.unlock || !holoBossData?.list?.length) {
      return this.reply('没有拟境湮灭战数据')
    }
    // 持久化到文件
    const rank_type = 'HOLO_BOSS'
    const uid = await this.getUID()
    let userRankAllowed: boolean | null = null
    if (uid) {
      if (this.e?.group_id) {
        // 无论如何在当前群里面都探测到了 uid
        await addUserToGroupRank(rank_type, uid, this.e.group_id)
        const qq = (this.e.at && !this.e.atBot) ? this.e.at : this.e.user_id
        await setUidAndQQ(this.e.group_id, uid, qq)
        userRankAllowed = !!(await isUserRankAllowed(rank_type, uid, this.e.group_id))
      }

      // 存记录的时候先不管 userRankAllowed
      if (this.isGroupRankAllowed()) {
        const oldData = getHoloBossData(uid)
        let shouldSave = false
        const nowSec = Math.floor(Date.now() / 1000)

        if (!oldData?.result) {
          shouldSave = true
        } else {
          // 比较赛季
          const oldStartTime = oldData.result.start_time
          const newStartTime = holoBossData.start_time
          const isSameSeason = oldStartTime && newStartTime &&
            oldStartTime.year === newStartTime.year &&
            oldStartTime.month === newStartTime.month &&
            oldStartTime.day === newStartTime.day &&
            oldStartTime.hour === newStartTime.hour

          if (!isSameSeason) {
            shouldSave = true
          } else {
            // 计算新旧战绩的星数和用时
            const newStars = (holoBossData.list || []).reduce((sum, item) => sum + (item?.star || 0), 0)
            const newTimeSec = (holoBossData.list || []).reduce((sum, item) => sum + (item?.challenge_time?.minute || 0) * 60 + (item?.challenge_time?.second || 0), 0)
            const newNoInjured = (holoBossData.list || []).reduce((sum, item) => sum + (item?.boss?.medal?.is_no_injured ? 1 : 0), 0)

            const oldStars = (oldData.result?.list || []).reduce((sum, item) => sum + (item?.star || 0), 0)
            const oldTimeSec = (oldData.result?.list || []).reduce((sum, item) => sum + (item?.challenge_time?.minute || 0) * 60 + (item?.challenge_time?.second || 0), 0)
            const oldNoInjured = (oldData.result?.list || []).reduce((sum, item) => sum + (item?.boss?.medal?.is_no_injured ? 1 : 0), 0)

            // 取最优成绩：一定要更优才有资格覆盖
            if (newStars > oldStars) {
              shouldSave = true
            } else if (newStars === oldStars && newTimeSec < oldTimeSec) {
              shouldSave = true
            } else if (newStars === oldStars && newTimeSec === oldTimeSec && newNoInjured > oldNoInjured) {
              shouldSave = true
            }
          }
        }

        if (shouldSave) {
          saveHoloBossData(uid, {
            player: this.e.playerCard!,
            result: holoBossData,
            updateTime: nowSec
          })
        }
      }
    }
    const holoBossObj = new HoloBoss(holoBossData, this.e.playerCard)
    const timer = setTimeout(() => {
      if (this?.reply) {
        this.reply('查询成功，正在下载图片资源，请稍候。')
      }
    }, 5000)
    await holoBossObj.get_assets()
    clearTimeout(timer)
    const finalData = {
      holoBoss: holoBossObj,
      userRankAllowed
    }
    await this.render('holoBoss/index.html', finalData, this)
  }

}
