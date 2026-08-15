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
        {
          reg: `${rulePrefix}(迷宫诡域|迷宫|诡域|搜打撤|塔科夫|塔可夫|塔克夫|鸭科夫|绝科夫)(战绩|记录|详情|回顾)$`,
          fnc: 'zenkovDetail',
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

  /**
   * 格式化时间对象 { year, month, day, hour, minute, second } 为 YYYY-MM-DD HH:mm:ss
   */
  formatDateTimeObj(timeObj: { year: number; month: number; day: number; hour: number; minute: number; second: number }): string {
    if (!timeObj) return '-'
    const y = timeObj.year
    const m = String(timeObj.month).padStart(2, '0')
    const d = String(timeObj.day).padStart(2, '0')
    const hh = String(timeObj.hour).padStart(2, '0')
    const mm = String(timeObj.minute).padStart(2, '0')
    const ss = String(timeObj.second).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
  }

  /**
   * 格式化挑战时长对象为 MM:SS 或 HH:MM:SS
   */
  formatDurationObj(timeObj: { hour: number; minute: number; second: number }): string {
    if (!timeObj) return '00:00'
    const hh = timeObj.hour ? String(timeObj.hour).padStart(2, '0') + ':' : ''
    const mm = String(timeObj.minute || 0).padStart(2, '0')
    const ss = String(timeObj.second || 0).padStart(2, '0')
    return `${hh}${mm}:${ss}`
  }

  /**
   * 格式化带出物资总价值（千分位）
   */
  formatNumberCommas(val: string | number): string {
    if (val === undefined || val === null || val === '') return '0'
    const num = Number(val)
    if (isNaN(num)) return String(val)
    return num.toLocaleString('en-US')
  }

  /**
   * 格式化本赛季最高排名
   * - is_show_percent=true:  百分比展示 XX.YY%（%防卫战风格底图+数字，按百分比映射 rank 背景阶级）
   * - is_show_percent=false: 绝对排名展示 TOP XXX（金色文字）
   * - 无有效数据: 占位 "-"
   */
  formatMaxRank(data: any): void {
    let formattedRank = '-'
    let rankBg = 5
    if (data?.max_rank !== undefined && data?.max_rank !== null) {
      const numRank = Number(data.max_rank)
      if (!isNaN(numRank)) {
        if (data.is_show_percent) {
          const pct = numRank / 100
          formattedRank = `${pct.toFixed(2)}%`
          if (pct < 1) rankBg = 1
          else if (pct < 5) rankBg = 2
          else if (pct < 10) rankBg = 3
          else if (pct < 50) rankBg = 4
          else rankBg = 5
        } else {
          formattedRank = `TOP ${Math.floor(numRank)}`
        }
      }
    }
    data.formatted_max_rank = formattedRank
    data.rank_bg = rankBg
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

    // 格式化最高排名 (is_show_percent=true: 百分比底图; =false: TOP 绝对排名)
    this.formatMaxRank(zenkovDetail)

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

    const finalData = {
      zenkov: zenkovDetail,
    }

    await this.render('zenkov/index.html', finalData, this)
  }

  async zenkovDetail() {
    const { api, deviceFp } = await this.getAPI()
    await this.getPlayerInfo()

    const zenkovDetailData = await api
      .getFinalData('zzzZenkovDetail', {
        deviceFp,
      })
      .catch((e: Error) => {
        this.reply(e.message)
        throw e
      })

    if (!zenkovDetailData) {
      return this.reply('暂无迷宫诡域详细战绩数据')
    }

    // 格式化最高排名 (is_show_percent=true: 百分比底图; =false: TOP 绝对排名)
    this.formatMaxRank(zenkovDetailData)

    // 格式化地图撤离率
    if (Array.isArray(zenkovDetailData.map_list)) {
      zenkovDetailData.map_list.forEach((mapItem: any) => {
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

    // 格式化战绩记录列表
    if (Array.isArray(zenkovDetailData.record_list)) {
      zenkovDetailData.record_list.forEach((record: any) => {
        record.formatted_start_time = this.formatDateTimeObj(record.start_time)
        record.formatted_challenge_time = this.formatDurationObj(record.challenge_time)
        record.formatted_material_total_value = this.formatNumberCommas(record.material_total_value)

        // 难度映射
        if (record.difficult === 'Hell') {
          record.formatted_difficult = '高危'
        } else if (record.difficult === 'Hard') {
          record.formatted_difficult = '困难'
        } else {
          record.formatted_difficult = record.difficult || '普通'
        }

        // 物品品质背景类名映射 (5 -> rarity-5, 4 -> rarity-4, 3 -> rarity-3, 2,1,0 -> no-bg)
        if (Array.isArray(record.item_list)) {
          record.item_list.forEach((item: any) => {
            if (item.rarity === 5) item.rarity_class = 'rarity-5'
            else if (item.rarity === 4) item.rarity_class = 'rarity-4'
            else if (item.rarity === 3) item.rarity_class = 'rarity-3'
            else item.rarity_class = 'no-bg'
          })
        }
      })
    }

    const finalData = {
      zenkov: zenkovDetailData,
    }

    await this.render('zenkov/detail.html', finalData, this)
  }
}
