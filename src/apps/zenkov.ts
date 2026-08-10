import type { Mys } from '#interface'
import { rulePrefix } from '../lib/common.js'
import { ZZZPlugin } from '../lib/plugin.js'
import settings from '../lib/settings.js'

export class Zenkov extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]zenkov',
      dsc: 'zzz迷宫诡域',
      event: 'message',
      priority: settings.getConfig('priority')?.zenkov ?? 70,
      rule: [
        {
          reg: `${rulePrefix}(迷宫诡域|迷宫|诡域|搜打撤|塔科夫|塔可夫|塔克夫|鸭科夫|绝科夫)$`,
          fnc: 'zenkov',
        },
      ],
    })
  }

  /**
   * 格式化剩余秒数为 "XX天YY时"
   */
  formatTimeDaysHours(seconds: number): string {
    if (!seconds || seconds <= 0) return '00天00时'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    return `${days.toString().padStart(2, '0')}天${hours.toString().padStart(2, '0')}时`
  }

  /**
   * 格式化倒计时（秒）为 "X天"
   */
  formatTimeDays(seconds: number): string {
    if (!seconds || seconds <= 0) return '0天'
    const days = Math.floor(seconds / 86400)
    return `${days}天`
  }

  async zenkov() {
    const { api, deviceFp } = await this.getAPI()
    await this.getPlayerInfo()

    const zenkovDetail = await api
      .getFinalData('zzzZenkov', {
        deviceFp,
      })
      .catch((e: Error) => {
        this.reply(e.message)
        throw e
      })

    if (!zenkovDetail) {
      return this.reply('暂无迷宫诡域数据')
    }

    // 格式化时间
    if (zenkovDetail.refresh_time) {
      ;(zenkovDetail as any).formatted_weekly_refresh_time =
        this.formatTimeDaysHours(zenkovDetail.refresh_time)
    }
    if (zenkovDetail.season_data?.refresh_time) {
      ;(zenkovDetail as any).season_data.formatted_refresh_time =
        this.formatTimeDays(zenkovDetail.season_data.refresh_time)
    }

    // 格式化最高排名 (%防卫战 风格: 底图+数字，显示XX.YY%，不要+)
    let formattedRank = '-'
    let rankBg = 5
    if (zenkovDetail.is_show_percent && zenkovDetail.max_rank !== undefined && zenkovDetail.max_rank !== null) {
      const numRank = Number(zenkovDetail.max_rank)
      if (!isNaN(numRank)) {
        const pct = numRank > 100 ? numRank / 100 : numRank
        formattedRank = `${pct.toFixed(2)}%`
        if (pct < 1) rankBg = 1
        else if (pct < 5) rankBg = 2
        else if (pct < 10) rankBg = 3
        else if (pct < 50) rankBg = 4
        else rankBg = 5
      }
    }
    ;(zenkovDetail as any).formatted_max_rank = formattedRank
    ;(zenkovDetail as any).rank_bg = rankBg

    // 格式化地图撤离率 (原数据如 10000 -> 100%)
    if (Array.isArray(zenkovDetail.map_list)) {
      zenkovDetail.map_list.forEach((mapItem: any) => {
        if (mapItem.leave_percent !== undefined && mapItem.leave_percent !== null) {
          const rawVal = Number(mapItem.leave_percent)
          if (!isNaN(rawVal)) {
            const pct = rawVal / 100
            const formatted = `${pct.toFixed(pct % 1 === 0 ? 0 : 2)}%`
            mapItem.formatted_leave_percent = formatted
            mapItem.leave_percent_display = formatted
          } else {
            mapItem.leave_percent_display = `${mapItem.leave_percent}`
          }
        } else {
          mapItem.leave_percent_display = '0%'
        }
      })
    }

    // 注释：如果后续接口增加关卡详细阵容或详细战绩（如 zenkov_detail），在此处添加逻辑

    const finalData = {
      zenkov: zenkovDetail,
    }

    await this.render('zenkov/index.html', finalData, this)
  }
}
