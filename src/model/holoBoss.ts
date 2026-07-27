import type { Mys, ZZZ } from '#interface'
import request from '../utils/request.js'

export class HoloBoss {
  start_time: HoloBossTime
  end_time: HoloBossTime
  list: HoloBossListItem[]
  unlock: boolean
  refresh_time: number
  total_star: number
  total_time_seconds: number
  total_time_str: string
  no_injured_count: number
  nick_name: string
  avatar_icon: string

  constructor(data: Mys.HoloBoss, playerCard?: ZZZ.playerCard) {
    this.start_time = new HoloBossTime(data.start_time)
    this.end_time = new HoloBossTime(data.end_time)
    this.unlock = data.unlock
    this.refresh_time = data.refresh_time
    this.list = (data.list || []).map(item => new HoloBossListItem(item))

    this.nick_name = playerCard?.player?.nickname || ''
    this.avatar_icon = playerCard?.avatar || ''

    this.total_star = this.list.reduce((sum, item) => sum + (item.star || 0), 0)
    this.total_time_seconds = this.list.reduce((sum, item) => sum + item.challenge_time_seconds, 0)
    this.no_injured_count = this.list.reduce((sum, item) => sum + (item.boss?.medal?.is_no_injured ? 1 : 0), 0)
    
    const minutes = Math.floor(this.total_time_seconds / 60)
    const seconds = this.total_time_seconds % 60
    this.total_time_str = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  async get_assets() {
    if (this.avatar_icon && this.avatar_icon.startsWith('http')) {
      const avatar_b64 = await request
        .get(this.avatar_icon)
        .then(response => response.arrayBuffer())
        .then(
          buffer =>
            `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
        )
        .catch(() => this.avatar_icon)
      this.avatar_icon = avatar_b64
    }
    await Promise.all(this.list.map(item => item.get_assets()))
  }
}

export class HoloBossListItem {
  rank: number
  rank_str: string
  rank_bg: number
  star: number
  challenge_time: HoloBossTime
  challenge_time_seconds: number
  challenge_time_str: string
  boss: HoloBossDetailBoss
  avatar_list: HoloBossAvatar[]

  constructor(data: Mys.HoloBoss['list'][number]) {
    this.rank = data.rank
    if (typeof data.rank === 'number' && data.rank >= 0) {
      const pct = data.rank > 100 ? data.rank / 100 : data.rank
      this.rank_str = `${pct.toFixed(2)}%`
      if (pct < 1) {
        this.rank_bg = 1
      } else if (pct < 5) {
        this.rank_bg = 2
      } else if (pct < 10) {
        this.rank_bg = 3
      } else if (pct < 50) {
        this.rank_bg = 4
      } else {
        this.rank_bg = 5
      }
    } else {
      this.rank_str = ''
      this.rank_bg = 5
    }

    this.star = data.star
    this.challenge_time = new HoloBossTime(data.challenge_time)
    this.challenge_time_seconds = (data.challenge_time.minute || 0) * 60 + (data.challenge_time.second || 0)
    const mm = String(data.challenge_time.minute || 0).padStart(2, '0')
    const ss = String(data.challenge_time.second || 0).padStart(2, '0')
    this.challenge_time_str = `${mm}:${ss}`
    this.boss = new HoloBossDetailBoss(data.boss)
    this.avatar_list = (data.avatar_list || []).map(item => new HoloBossAvatar(item))
  }

  async get_assets() {
    await Promise.all([
      this.boss.get_assets(),
      ...this.avatar_list.map(avatar => avatar.get_assets())
    ])
  }
}

export class HoloBossDetailBoss {
  icon: string
  name: string
  medal?: HoloBossMedal

  constructor(data: Mys.HoloBoss['list'][number]['boss']) {
    this.icon = data.icon
    this.name = data.name
    if (data.medal) {
      this.medal = new HoloBossMedal(data.medal)
    }
  }

  async get_assets() {
    let icon_b64 = ''
    if (this.icon) {
      icon_b64 = await request
        .get(this.icon)
        .then(response => response.arrayBuffer())
        .then(
          buffer =>
            `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
        )
        .catch(() => this.icon)
      this.icon = icon_b64
    }
    if (this.medal) {
      await this.medal.get_assets()
    }
  }
}

export class HoloBossMedal {
  medal_icon: string
  medal_id: number
  is_no_injured: boolean

  constructor(data: Mys.HoloBoss['list'][number]['boss']['medal']) {
    this.medal_icon = data.medal_icon
    this.medal_id = data.medal_id
    this.is_no_injured = data.is_no_injured
  }

  async get_assets() {
    if (this.medal_icon) {
      const medal_b64 = await request
        .get(this.medal_icon)
        .then(response => response.arrayBuffer())
        .then(
          buffer =>
            `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
        )
        .catch(() => this.medal_icon)
      this.medal_icon = medal_b64
    }
  }
}

export class HoloBossAvatar {
  rarity: string
  element_type: number
  avatar_profession: number
  id: number
  level: number
  rank: number
  role_square_url: string
  sub_element_type: number

  constructor(data: Mys.HoloBoss['list'][number]['avatar_list'][number]) {
    this.rarity = data.rarity
    this.element_type = data.element_type
    this.avatar_profession = data.avatar_profession
    this.id = data.id
    this.level = data.level
    this.rank = data.rank
    this.role_square_url = data.role_square_url
    this.sub_element_type = data.sub_element_type
  }

  async get_assets() {
    if (this.role_square_url) {
      const role_square_b64 = await request
        .get(this.role_square_url)
        .then(response => response.arrayBuffer())
        .then(
          buffer =>
            `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
        )
        .catch(() => this.role_square_url)
      this.role_square_url = role_square_b64
    }
  }
}

export class HoloBossTime {
  hour: number
  minute: number
  second: number
  year: number
  month: number
  day: number

  constructor(data: Mys.HoloBoss['start_time']) {
    this.hour = data.hour
    this.minute = data.minute
    this.second = data.second
    this.year = data.year
    this.month = data.month
    this.day = data.day
  }
}
