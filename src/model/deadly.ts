import type { Mys } from '#interface'
import request from '../utils/request.js'

export class Deadly {
  start_time: DeadlyTime
  end_time: DeadlyTime
  nick_name: string
  avatar_icon: string
  has_data: boolean
  zone_id: number
  total_star: number
  rank_percent: number
  total_score: number
  list: DeadlyList[]

  constructor(data: Mys.Deadly) {
    this.start_time = new DeadlyTime(data.start_time)
    this.end_time = new DeadlyTime(data.end_time)
    this.nick_name = data.nick_name
    this.avatar_icon = data.avatar_icon
    this.has_data = data.has_data
    this.zone_id = data.zone_id
    this.total_star = data.total_star
    this.rank_percent = data.rank_percent
    this.total_score = data.total_score
    this.list = data.list.map(item => new DeadlyList(item))
  }

  async get_assets() {
    const avatar_icon_b64 = await request
      .get(this.avatar_icon)
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      )
    this.avatar_icon = avatar_icon_b64
    await Promise.all(this.list.map(item => item.get_assets()))
  }

}

export class DeadlyList {
  star: number
  score: number
  boss: Bos[]
  buffer: DeadBuffer[]
  buddy: Buddy
  total_star: number
  challenge_time: DeadlyTime
  avatar_list: AvatarList[]

  constructor(data: Mys.Deadly['list'][number]) {
    this.star = data.star
    this.score = data.score
    this.boss = data.boss.map(b => new Bos(b))
    this.buffer = data.buffer.map(b => new DeadBuffer(b))
    this.buddy = data.buddy && new Buddy(data.buddy)
    this.total_star = data.total_star
    this.challenge_time = new DeadlyTime(data.challenge_time)
    this.avatar_list = data.avatar_list.map(item => new AvatarList(item))
  }

  async get_assets() {
    await Promise.all([
      this.buddy?.get_assets(),
      ...this.avatar_list.map(avatar => avatar.get_assets()),
      ...this.boss.map(boss => boss.get_assets()),
      ...this.buffer.map(buffer => buffer.get_assets()),
    ])
  }

}

export class AvatarList {
  rarity: string
  element_type: number
  avatar_profession: number
  id: number
  level: number
  rank: number
  role_square_url: string
  sub_element_type: number

  constructor(data: Mys.Deadly['list'][number]['avatar_list'][number]) {
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
    const role_square_b64 = await request
      .get(this.role_square_url)
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      )
    this.role_square_url = role_square_b64
  }

}

export class Buddy {
  id: number
  rarity: string
  level: number
  bangboo_rectangle_url: string

  constructor(data: Mys.Deadly['list'][number]['buddy']) {
    this.id = data.id
    this.rarity = data.rarity
    this.level = data.level
    this.bangboo_rectangle_url = data.bangboo_rectangle_url
  }

  async get_assets() {
    const bangboo_rectangle_b64 = await request
      .get(this.bangboo_rectangle_url)
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      )
    this.bangboo_rectangle_url = bangboo_rectangle_b64
  }

}

export class DeadBuffer {
  desc: string
  icon: string
  name: string

  constructor(data: Mys.Deadly['list'][number]['buffer'][number]) {
    this.desc = data.desc
    this.icon = data.icon
    this.name = data.name
  }

  async get_assets() {
    const icon_b64 = await request
      .get(this.icon)
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      )
    this.icon = icon_b64
  }

}

export class Bos {
  race_icon: string
  icon: string
  name: string
  bg_icon: string

  constructor(data: Mys.Deadly['list'][number]['boss'][number]) {
    this.race_icon = data.race_icon
    this.icon = data.icon
    this.name = data.name
    this.bg_icon = data.bg_icon
  }

  async get_assets() {
    let race_icon_b64
    if (this.race_icon) {
      race_icon_b64 = request
        .get(this.race_icon)
        .then(response => response.arrayBuffer())
        .then(
          buffer =>
            `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
        )
    }
    const icon_b64 = request
      .get(this.icon)
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      )
    const bg_icon_b64 = request
      .get(this.bg_icon)
      .then(response => response.arrayBuffer())
      .then(
        buffer =>
          `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`
      )
    const all = await Promise.all([race_icon_b64, icon_b64, bg_icon_b64])
    this.race_icon = all[0] || ''
    this.icon = all[1]
    this.bg_icon = all[2]
  }

}

export class DeadlyTime {
  hour: number
  minute: number
  second: number
  year: number
  month: number
  day: number

  constructor(data: Mys.Deadly['start_time']) {
    this.hour = data.hour
    this.minute = data.minute
    this.second = data.second
    this.year = data.year
    this.month = data.month
    this.day = data.day
  }

}
