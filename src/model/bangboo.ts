import type { Mys } from '#interface'
import { getSquareBangboo } from '../lib/download.js'

/**
 * @class
 */
export class Buddy {
  id: number
  name: string
  rarity: string
  level: number
  star: number
  square_icon: string | null

  constructor(data: Mys.Index['buddy_list'][number]) {
    const { id, name, rarity, level, star } = data
    this.id = id
    this.name = name
    this.rarity = rarity
    this.level = level
    this.star = star
  }

  async get_assets() {
    const result = await getSquareBangboo(this.id)
    this.square_icon = result
  }

}

/**
 * @class
 */
export class Item {
  id: number
  name: string
  rarity: string
  level: number
  star: number
  square_icon: string | null

  constructor(id: number, name: string, rarity: string, level: number, star: number) {
    this.id = id
    this.name = name
    this.rarity = rarity
    this.level = level
    this.star = star
  }

  async get_assets() {
    const result = await getSquareBangboo(this.id)
    this.square_icon = result
  }

}

/**
 * @class
 */
export class BangbooWiki {
  item_id: string
  wiki_url: string

  constructor(item_id: string, wiki_url: string) {
    this.item_id = item_id
    this.wiki_url = wiki_url
  }

}

/**
 * @class
 */
export class ZZZBangbooResp {
  items: Item[]
  bangboo_wiki: BangbooWiki

  constructor(items: Item[], bangboo_wiki: BangbooWiki) {
    this.items = items
    this.bangboo_wiki = bangboo_wiki
  }

  async get_assets() {
    for (const item of this.items) {
      await item.get_assets()
    }
  }

}
