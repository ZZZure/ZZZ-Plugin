import { aliasToName } from '../lib/convert/char.js'
import common from '../../../lib/common/common.js'
import { rulePrefix } from '../lib/common.js'
import { ZZZPlugin } from '../lib/plugin.js'
import settings from '../lib/settings.js'
import fetch from 'node-fetch'

const DATA_URL = 'https://raw.githubusercontent.com/iaoongin/GachaClock/main/spider/data/zzz/history.json'

export class PoolHistory extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]PoolHistory',
      dsc: '查询绝区零全角色/武器卡池记录',
      event: 'message',
      priority: settings.getConfig('priority')?.panel ?? 70,
      rule: [
        {
          reg: `${rulePrefix}.+(复刻|卡池)(统计|记录|历史)$`,
          fnc: 'dispatchHandler'
        },
        {
          reg: `${rulePrefix}(当前|本期|当期)?卡池$`,
          fnc: 'queryCurrentPool'
        },
        {
          reg: `${rulePrefix}(复刻|卡池)(统计|记录|历史)$`,
          fnc: 'queryAllPool'
        },
        {
          reg: `${rulePrefix}v?(\\d+\\.\\d+)(上半|下半)?卡池$`,
          fnc: 'queryVersionPool'
        }
      ]
    })
    this.dataCacheKey = 'ZZZ:PoolHistory:Data'
    this.dataCacheExpireKey = 'ZZZ:PoolHistory:Data:Expire'
    this.queryAllPoolMsgCacheKey = 'ZZZ:PoolHistory:queryAllPoolMsg'
  }

  parseTime(pool) {
    const { startTime, endTime } = pool
    if (!startTime || !endTime) return { startTime: null, endTime: null }
    return { startTime: new Date(startTime), endTime: new Date(endTime) }
  }

  async dispatchHandler() {
    const rawContent = this.parseMsgPrefix().replace(/(复刻|卡池)(统计|记录|历史)$/, '').trim()
    if (/^(五星|S级?)?(角色|代理人)$/i.test(rawContent)) {
      return await this.handleSummary('S', '角色')
    }
    if (/^(四星|A级?)?(角色|代理人)$/i.test(rawContent)) {
      return await this.handleSummary('A', '角色')
    }
    if (/^(五星|S级?)(武器|音擎)$/i.test(rawContent)) {
      return await this.handleSummary('S', '武器')
    }
    if (/^(四星|A级?)(武器|音擎)$/i.test(rawContent)) {
      return await this.handleSummary('A', '武器')
    }
    const name = aliasToName(rawContent) || rawContent
    return await this.handleHistoryQuery(name)
  }

  async handleSummary(targetRank, targetType) {
    const data = await this.fetchData()
    if (!data) return this.reply('卡池历史记录数据获取失败')
    const now = new Date()
    const itemMap = new Map()
    data.forEach(pool => {
      if (pool.type !== targetType) return
      const { startTime, endTime } = this.parseTime(pool)
      if (!endTime) return
      let targets = []
      if (targetRank === 'S') {
        if (pool.s) targets.push(pool.s)
      } else {
        if (Array.isArray(pool.a)) targets = pool.a
      }
      targets.forEach(name => {
        if (!itemMap.has(name) || endTime > itemMap.get(name).endTime) {
          itemMap.set(name, { startTime, endTime })
        }
      })
    })
    const currentList = []
    const historyList = []
    itemMap.forEach((timeInfo, name) => {
      if (now >= timeInfo.startTime && now <= timeInfo.endTime) {
        currentList.push(name)
      } else {
        if (now < timeInfo.startTime) return
        const diff = now - timeInfo.endTime
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        historyList.push({ name, days: days > 0 ? days : 0 })
      }
    })
    historyList.sort((a, b) => b.days - a.days)
    const historyStr = historyList.map(r => `${r.name}: ${String(r.days).padStart(3, ' ')}天未复刻`).join('\n')
    const displayType = targetType === '武器' ? '音擎' : '代理人'
    return this.reply(`【 ${targetRank}级${displayType}复刻统计 】\n${historyStr}`)
  }

  async handleHistoryQuery(queryName) {
    const data = await this.fetchData()
    if (!data) return this.reply('卡池历史记录数据获取失败')
    const records = data.filter(pool => {
      if (pool.s === queryName) return true
      if (Array.isArray(pool.a) && pool.a.includes(queryName)) return true
      return false
    })
    if (records.length === 0) {
      return this.reply(`未找到【${queryName}】卡池记录，请确保角色名称/别称存在`)
    }
    const firstHit = records[0]
    const isS = firstHit.s === queryName
    const typeStr = firstHit.type === '武器' ? '音擎' : '代理人'
    const rarityStr = isS ? 'S级' : 'A级'
    const listStr = records.map((pool, index) => {
      const timeRange = pool.timer.replace(/ \d{2}:\d{2}:\d{2}/g, '')
      return `${index + 1}. ${pool.version} (${timeRange})`
    }).join('\n')
    return this.reply(`【 ${queryName}(${rarityStr}${typeStr}) 卡池记录 】\n${listStr}`)
  }

  async queryCurrentPool() {
    const data = await this.fetchData()
    if (!data) return this.reply('卡池历史记录数据获取失败')
    const now = new Date()
    const activePools = data.filter(pool => {
      const { startTime, endTime } = this.parseTime(pool)
      return startTime && endTime && now >= startTime && now <= endTime
    })
    if (activePools.length === 0) return this.reply('当前没有正在进行的活动卡池。')
    const replyMsg = [`=== 📅 绝区零本期卡池 ===\n`]
    if (activePools.length > 0) {
      const sample = activePools[0]
      const { endTime } = this.parseTime(sample)
      const remainingDays = Math.ceil((endTime - now) / (1000 * 60 * 60 * 24))
      replyMsg.push(`版本：v${sample.version}\n时间：${sample.timer}\n时间：剩余约${remainingDays}天\n`)
    }
    const rolePools = activePools.filter(p => p.type === '角色')
    const weaponPools = activePools.filter(p => p.type === '武器')
    if (!rolePools.length && !weaponPools.length) {
      return this.reply('暂无卡池数据信息')
    }
    if (rolePools.length > 0) {
      replyMsg.push(`\n【 角色调频 】\n`)
      rolePools.forEach(p => {
        const aRoles = Array.isArray(p.a) ? p.a.join('，') : p.a
        replyMsg.push(`◈ S-${p.s} | A-${aRoles}\n`)
        replyMsg.push(segment.image(p.img))
      })
    }
    if (weaponPools.length > 0) {
      replyMsg.push(`\n【 音擎调频 】\n`)
      weaponPools.forEach(p => {
        const aWeapons = Array.isArray(p.a) ? p.a.join('，') : p.a
        replyMsg.push(`◈ S-${p.s} | A-${aWeapons}\n`)
        replyMsg.push(segment.image(p.img))
      })
    }
    return this.reply(replyMsg)
  }

  async queryAllPool() {
    const old = await redis.get(this.queryAllPoolMsgCacheKey)
    if (old) {
      try {
        return await this.reply(JSON.parse(old))
      } catch {
        redis.del(this.queryAllPoolMsgCacheKey)
      }
    }
    const data = await this.fetchData()
    if (!data) return this.reply('卡池历史记录数据获取失败')
    const versions = [...new Set(data.map(p => p.version.replace(/(上半|下半)$/, '')))]
    const title = '绝区零全版本卡池记录'
    const replyMsg = [title, ...versions.map(v => this.generatePoolMsg(data, v, '')).reverse()]
    const msg = await common.makeForwardMsg(this.e, replyMsg, title)
    redis.set(this.queryAllPoolMsgCacheKey, JSON.stringify(msg), {
      EX: 7 * 24 * 60 * 60 // 缓存7*24小时
    })
    return this.reply(msg)
  }

  async queryVersionPool() {
    const data = await this.fetchData()
    if (!data) return this.reply('卡池历史记录数据获取失败')
    const rawContent = this.parseMsgPrefix()
    const match = rawContent.match(/^v?(\d+\.\d+)(上半|下半)?卡池$/)
    const [, version, phase] = match
    const replyMsg = this.generatePoolMsg(data, version, phase)
    if (replyMsg) {
      return this.reply(replyMsg)
    }
  }

  generatePoolMsg(data, version, phase) {
    const pools = data.filter(pool => {
      if (!pool.version.startsWith(version)) return false
      if (phase && !pool.version.includes(phase)) return false
      return true
    })
    if (pools.length === 0) return this.reply(`未查询到绝区零${version}${phase || ''}版本的卡池数据`)
    const versionStages = [...new Set(pools.map(p => p.version))].sort((a, b) => {
      if (a.includes('上半') && b.includes('下半')) return -1
      if (a.includes('下半') && b.includes('上半')) return 1
      return a.localeCompare(b)
    })
    const replyMsg = [`【 绝区零 v${versionStages.length === 1 ? versionStages[0] : version} 卡池 】\n`]
    for (const stage of versionStages) {
      const stagePools = pools.filter(p => p.version === stage)
      const timerDisplay = stagePools[0]?.timer?.replace(/ \d{2}:\d{2}:\d{2}/g, '')
      const rolePools = stagePools.filter(p => p.type === '角色')
      const weaponPools = stagePools.filter(p => p.type === '武器')
      if (versionStages.length > 1) {
        replyMsg.push(`【 ${stage} 】\n`)
      }
      replyMsg.push(`⏱️ ${timerDisplay}\n`)
      if (rolePools.length > 0) {
        for (const p of rolePools) {
          const aRoles = Array.isArray(p.a) ? p.a.join('，') : p.a
          replyMsg.push(`◈ 角色：S-${p.s} | A-${aRoles}\n`)
          replyMsg.push(segment.image(p.img))
        }
      }
      if (weaponPools.length > 0) {
        for (const p of weaponPools) {
          const aWeapons = Array.isArray(p.a) ? p.a.join('，') : p.a
          replyMsg.push(`◈ 音擎：S-${p.s} | A-${aWeapons}\n`)
          replyMsg.push(segment.image(p.img))
        }
      }
    }
    return replyMsg
  }

  /** @returns {Promise<{
    img: string
    title: string
    type: string
    version: string
    timer: string
    s: string
    a: string[]
    img_path: string
    _endTimeStamp: number
    startTime: string
    endTime: string
    * }[]>} data
    */
  async fetchData() {
    const cacheValid = await redis.get(this.dataCacheExpireKey)
    if (cacheValid) {
      const cache = await redis.get(this.dataCacheKey)
      if (cache) {
        return JSON.parse(cache)
      }
      redis.del(this.dataCacheExpireKey)
      redis.del(this.dataCacheKey)
    }
    let rawData
    try {
      const response = await fetch(DATA_URL, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        timeout: 6000
      })
      if (!response.ok) {
        throw '请求失败：' + response.status
      }
      rawData = await response.json()
    } catch (err) {
      const cache = await redis.get(this.dataCacheKey)
      logger.error(err)
      if (cache) {
        return JSON.parse(cache)
      }
      return this.reply(`卡池历史记录数据获取失败: ${err.message || err}`)
    }
    const data = this.processData(rawData)
    if (data) {
      redis.set(this.dataCacheExpireKey, '1', {
        EX: 24 * 60 * 60 // 有效期24小时
      })
      redis.set(this.dataCacheKey, JSON.stringify(data))
      redis.del(this.queryAllPoolMsgCacheKey) // 清除全部卡池转发消息缓存
      return data
    }
  }

  /** @param {{
    img: string
    title: string
    type: string
    version: string
    timer: string
    s: string
    a: string[]
    img_path: string
    _endTimeStamp: number
    * }[]} data
    */
  processData(data) {
    // 临时处理缺失的1.0上半卡池数据
    if (!data.find(v => v.version === '1.0上半')) {
      data.push(
        {
          "img": "https://patchwiki.biligame.com/images/zzz/thumb/7/7f/8pesvtvchbs3t2jhqjhckd9k08pe7ui.png/900px-%E7%8B%AC%E5%AE%B6%E9%A2%91%E6%AE%B5001%E6%9C%9F.png",
          "title": "「慵懒逐浪」001期独家频段",
          "type": "角色",
          "version": "1.0上半",
          "timer": "公测开启后 ~ 2024/07/24 11:59:59",
          "s": "艾莲",
          "a": [
            "安东",
            "苍角"
          ],
          "img_path": "img/zzz/history/「慵懒逐浪」001期独家频段.png"
        },
        {
          "img": "https://patchwiki.biligame.com/images/zzz/thumb/3/32/gs2uajlo6v2h6pljzij84wdiwhu9fkj.png/900px-%E9%9F%B3%E6%93%8E%E9%A2%91%E6%AE%B5001%E6%9C%9F.png",
          "title": "「喧哗奏鸣」001期音擎频段",
          "type": "武器",
          "version": "1.0上半",
          "timer": "公测开启后 ~ 2024/07/24 11:59:59",
          "s": "深海访客",
          "a": [
            "含羞恶面",
            "旋钻机-赤轴"
          ],
          "img_path": "img/zzz/history/「喧哗奏鸣」001期音擎频段.png"
        })
    }
    data.forEach(pool => {
      const parts = pool.timer.split('~')
      if (parts.length >= 2) {
        const endStr = parts[1].trim()
        const endTime = new Date(endStr)
        pool._endTimeStamp = isNaN(endTime.getTime()) ? 0 : endTime.getTime()
      } else {
        pool._endTimeStamp = 0
      }
    })
    data.sort((a, b) => a._endTimeStamp - b._endTimeStamp)
    for (let i = 0; i < data.length; i++) {
      const pool = data[i]
      if (pool.timer.startsWith('公测开启后')) {
        pool.startTime = '2024/07/04 10:00:00'
        const parts = pool.timer.split('~')
        const endPart = parts[1].trim()
        pool.endTime = endPart
        pool.timer = `${pool.startTime} ~ ${pool.endTime}`
      } else if (pool.timer.includes('版本更新后')) {
        const parts = pool.timer.split('~')
        const endPart = parts[1].trim()
        let prevEndTime = 0
        for (let j = i - 1; j >= 0; j--) {
          const prev = data[j]
          if (prev._endTimeStamp > 0 && prev._endTimeStamp < pool._endTimeStamp) {
            prevEndTime = prev._endTimeStamp
            break
          }
        }
        if (!prevEndTime) {
          throw new Error(`无法根据“版本更新后”计算卡池起始时间，数据异常：${JSON.stringify(pool)}`)
        }
        const d = new Date(prevEndTime)
        d.setDate(d.getDate() + 1)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        pool.startTime = `${year}/${month}/${day} 11:00:00`
        pool.endTime = endPart
        pool.timer = `${pool.startTime} ~ ${pool.endTime}`
      } else {
        [pool.startTime, pool.endTime] = pool.timer.split('~').map(s => s.trim())
      }
    }
    return data
  }

}
