import type { Mys } from '#interface'
import { ZZZAvatarBasic } from './avatar.js'
import { Buddy } from './bangboo.js'

/**
 * @class
 */
export class ZZZIndexResp {
  stats: { active_days: number; avatar_num: number; world_level_name: string; cur_period_zone_layer_count: number; buddy_num: number; commemorative_coins_list: { num: number; name: string; sort: number; url: string; wiki_url: string }[]; achievement_count: number; climbing_tower_layer: number; next_hundred_layer: string; memory_battlefield: { rank_percent: number; total_score: number; total_star: number; zone_id: number }; stable_zone_layer_count: number; all_change_zone_layer_count: number; climbing_tower_s2: { climbing_tower_layer: number; floor_mvp_num: number }; temple_data: { level: number; sell_days: number; total_sell_temple_coin: string }; climbing_tower_s3: { layer_info: { climbing_tower_layer: number; total_score: number; icon: string }; mvp_info: { floor_mvp_num: number; rank_percent: number; display_rank: boolean } }; void_front_brief: { void_front_id: number; has_ending_record: boolean; ending_record_name: string; total_score: number; rank_percent: number }; challenge_full_s_times: number; memory_battlefield_full_stars_times: number; hadal_brief: { hadal_ver: string; hadal_brief_v2: { cur_period_zone_layer_count: number; score: number; rank_percent: number; battle_time: number; rating: string; max_score: number } } }
  avatar_list: ZZZAvatarBasic[]
  cur_head_icon_url: string
  buddy_list: Buddy[]

  constructor(data: Mys.Index) {
    const { stats, avatar_list, cur_head_icon_url, buddy_list } = data
    this.stats = stats
    this.avatar_list = avatar_list.map(item => new ZZZAvatarBasic(item))
    this.cur_head_icon_url = cur_head_icon_url
    this.buddy_list = buddy_list.map(item => new Buddy(item))
  }

  async get_assets() {
    for (const avatar of this.avatar_list) {
      await avatar.get_assets()
    }
    for (const buddy of this.buddy_list) {
      await buddy.get_assets()
    }
  }

}
