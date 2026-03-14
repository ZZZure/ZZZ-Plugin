export type * from './yunzai/global.d.ts'
export type * from './yunzai/message.d.ts'
export type * from '../model/damage/avatar.ts'
export type * from '../model/damage/BuffManager.ts'
export type * from '../model/damage/Calculator.ts'
export type * from '../model/score/Score.ts'
export type * from '../model/avatar.ts'

/** 插件配置 */
export namespace Config {

  export interface KeyValue {
    alias: alias
    config: config
    device: device
    gacha: gacha
    guide: guide
    panel: panel
    priority: priority
    remind: remind
    rank: rank
  }

  export interface alias {
    [name: string]: string[]
  }

  export interface config {
    render: {
      /** 渲染精度 */
      scale: number
    }
    query: {
      /** 允许查询他人信息 */
    }
    update: {
      /** 自动查询更新 */
      autoCheck: boolean
      /** 自动查询更新Cron表达式 */
      cron: string
    }
    /** 需要调用过🐎的接口code */
    mysCode: number[]
    /** 自定义绑定设备下载url */
    url: string
    /** 自定义enkaApi地址 */
    enkaApi: string
    /** 是否输出评分计算debug日志（debug模式下） */
    score_debug_log: boolean
    /** 是否输出伤害计算debug日志（debug模式下） */
    damage_debug_log: boolean
  }

  export interface device {
    productName: string
    productType: string
    modelName: string
    osVersion: string
    deviceInfo: string
    board: string
  }

  export interface gacha {
    /** 刷新抽卡记录的时间间隔（单位：秒） */
    interval: number
    /** 是否允许群组使用刷新抽卡功能 */
    allow_group: boolean
    /** 白名单群组 */
    white_list: number[]
    /** 黑名单群组 */
    black_list: number[]
  }

  export interface guide {
    default_guide: number
    max_forward_guides: number
  }

  export interface panel {
    /** 刷新面板的时间间隔（单位：秒） */
    interval: number
    /** 查询每个角色的间隔时间（单位：毫秒） */
    roleInterval: number
  }

  export interface priority {
    /** 玩家信息（卡片） */
    card: number
    /** 深渊 */
    abyss: number
    /** 危局 */
    deadly: number
    /** 临界推演 */
    voidFrontBattle: number
    /** 拟真鏖战试炼 */
    climbingTower: number
    /** 抽卡 */
    gachalog: number
    /** 攻略 */
    guide: number
    /** 帮助 */
    help: number
    /** 管理 */
    manage: number
    /** 体力 */
    note: number
    /** 面板 */
    panel: number
    /** 挑战提醒 */
    remind: number
    /** 更新 */
    update: number
    /** 账号操作 */
    user: number
    /** 菲林月历 */
    monthly: number
    /** 兑换码 */
    code: number
    /** 日历 */
    calendar: number
  }

  export interface remind {
    /** 功能总开关 */
    enable: boolean
    /** 全局提醒时间，用于没有个人设置的用户 */
    globalRemindTime: string
    /** 式舆防卫战提醒检查的最高关卡（用户可自行设置，最高为6。设置为6时会进一步检查第五层S+评价） */
    abyssCheckLevel: number
    /** 危局强袭战星数阈值 */
    deadlyStars: number
  }

  export interface rank {
    /** 是否允许群组使用群内排名功能 */
    allow_group: boolean
    /** 排名显示最大数量 */
    max_display: number
    /** 白名单群组 */
    white_list: number[]
    /** 黑名单群组 */
    black_list: number[]
  }

}

/** 插件数据 */
export namespace ZZZ {

  /** 玩家信息 */
  export interface playerCard {
    avatar: string
    player: Mys.User['list'][number]
  }

  /** 插件data数据 */
  export interface DBMap {
    gacha: {
      音擎频段: Mys.Gacha['list']
      音擎回响: Mys.Gacha['list']
      独家频段: Mys.Gacha['list']
      独家重映: Mys.Gacha['list']
      常驻频段: Mys.Gacha['list']
      邦布频段: Mys.Gacha['list']
    }
    panel: Mys.Avatar[]
    monthly: Mys.Monthly[]
    abyss: {
      player: ZZZ.playerCard
      result: Mys.Abyss
    }
    deadly: {
      player: ZZZ.playerCard
      result: Mys.Deadly
    }
    voidFrontBattle: {
      player: ZZZ.playerCard
      result: Mys.VoidFrontBattleDetail
    }
    climbingTower: {
      player: ZZZ.playerCard
      result: Mys.ClimbingTower
    }
  }



}

/** mys接口数据 */
export namespace Mys {

  export interface KeyValue {
    zzzAvatarList: AvatarList
    zzzAvatarInfo: AvatarInfo
    zzzBuddyList: BuddyList
    zzzClimbingTower: ClimbingTower
    zzzIndex: Index
    zzzMonthly: Monthly
    zzzNote: Note
    zzzUser: User
    zzzGacha_Record: Gacha
    zzzChallenge: Abyss
    zzzChallengePeriod: Abyss
    zzzDeadly: Deadly
    zzzDeadlyPeriod: Deadly
    zzzVoidFrontBattleAbstractInfo: VoidFrontBattleAbstractInfo
    zzzVoidFrontBattle: {
      void_front_id: number
      void_front_battle_detail: VoidFrontBattleDetail
    }
    zzzVoidFrontBattlePeriod: {
      void_front_id: number
      void_front_battle_detail: VoidFrontBattleDetail
    }
  }

  /** 米游社UrlType */
  export type UrlType =
    | (keyof Mys.KeyValue & {})
    | 'zzzVoidFrontBattle' | 'getFp' | 'zzzAuthKey' | 'deviceLogin' | 'saveDevice'

  /** 面板角色列表 */
  export interface AvatarList {
    avatar_list: {
      id: number
      level: number
      name_mi18n: string
      full_name_mi18n: string
      element_type: number
      camp_name_mi18n: string
      avatar_profession: number
      rarity: string
      group_icon_path: string
      hollow_icon_path: string
      rank: number
      is_chosen: boolean
      role_square_url: string
      sub_element_type: number
      awaken_state: string
    }[]
  }

  /** 面板角色数据 */
  export interface AvatarInfo {
    avatar_list: Avatar[]
    equip_wiki: any
    weapon_wiki: any
    avatar_wiki: any
    strategy_wiki: any
    cultivate_index: {
      [id: string]: string
    }
    cultivate_equip: {
      [id: string]: string
    }
    special_skill_icon: {
      [id: string]: {
        special_skills: {
          skill_type: number
          icon: string
        }[]
      }
    }
  }

  /** 面板角色数据 */
  export interface Avatar {
    id: number
    level: number
    name_mi18n: string
    full_name_mi18n: string
    element_type: number
    camp_name_mi18n: string
    avatar_profession: number
    rarity: string
    group_icon_path: string
    hollow_icon_path: string
    equip: Equip[]
    weapon: Weapon | null
    properties: {
      property_name: string
      property_id: number
      base: string
      add: string
      final: string
    }[]
    skills: {
      level: number
      skill_type: number
      items: {
        title: string
        text: string
      }[]
    }[]
    rank: number
    ranks: {
      id: number
      name: string
      desc: string
      pos: number
      is_unlocked: boolean
    }[]
    role_vertical_painting_url: string
    equip_plan_info: EquipPlanInfo | null
    us_full_name: string
    vertical_painting_color: string
    sub_element_type: number
    skin_list: {
      skin_id: number
      skin_name: string
      skin_vertical_painting_url: string
      skin_square_url: string
      skin_hollow_icon_path: string
      skin_vertical_painting_color: string
      unlocked: boolean
      rarity: string
      is_original: boolean
    }[]
    role_square_url: string
    /** 插件更新面板标记 */
    isNew?: boolean
  }

  export interface Equip {
    id: number
    level: number
    name: string
    icon: string
    rarity: string
    properties: Property[]
    main_properties: Property[]
    equip_suit: EquipSuit
    equipment_type: number
    /** 未命中词条数 */
    invalid_property_cnt: number
    /** 词条全命中 */
    all_hit: boolean
  }

  export interface EquipSuit {
    suit_id: number
    name: string
    own: number
    desc1: string
    desc2: string
  }

  export interface Property {
    property_name: string
    property_id: number
    base: string
    level: number
    /** 是否是有效词条 */
    valid: boolean
    system_id: number
    add: number
  }

  export interface EquipPlanInfo {
    type: number
    game_default: {
      property_list: {
        id: number
        name: string
        full_name: string
        system_id: number
        is_select: boolean
      }[]
    }
    cultivate_info: {
      name: string
      plan_id: string
      is_delete: boolean
      old_plan: boolean
    }
    custom_info: {
      property_list: {
        id: number
        name: string
        full_name: string
        system_id: number
        is_select: boolean
      }[]
    }
    valid_property_cnt: number
    plan_only_special_property: boolean
    equip_rating: string
    plan_effective_property_list: {
      id: number
      name: string
      full_name: string
      system_id: number
      is_select: boolean
    }[]
    equip_rating_score: number
  }

  export interface Weapon {
    id: number
    level: number
    name: string
    star: number
    icon: string
    rarity: string
    properties: Property[]
    main_properties: Property[]
    talent_title: string
    talent_content: string
    profession: number
  }

  /** 邦布列表 */
  export interface BuddyList {
    list: {
      id: number
      name: string
      rarity: string
      level: number
      star: number
      bangboo_square_url: string
    }[]
    bangboo_wiki: {
      [bangboo_id: string]: string
    }
  }

  /** 爬塔数据 */
  export interface ClimbingTower {
    climbing_tower_s1: {
      climbing_tower_layer: number
      medal_icon: string
    }
    climbing_tower_s2: {
      climbing_tower_layer: number
      floor_mvp_num: number
      medal_icon: string
    }
    climbing_tower_s3: {
      layer_info: {
        climbing_tower_layer: number
        total_score: number
        medal_icon: string
      }
      mvp_info: {
        floor_mvp_num: number
        rank_percent: number
      }
      display_avatar_rank_list: {
        avatar_id: number
        icon: string
        name: string
        rarity: string
        rank_percent: number
        score: number
        display_rank: boolean
        selected: boolean
      }[]
    }
  }

  /** 首页数据 */
  export interface Index {
    stats: {
      active_days: number
      avatar_num: number
      world_level_name: string
      cur_period_zone_layer_count: number
      buddy_num: number
      commemorative_coins_list: {
        num: number
        name: string
        sort: number
        url: string
        wiki_url: string
      }[]
      achievement_count: number
      climbing_tower_layer: number
      next_hundred_layer: string
      memory_battlefield: {
        rank_percent: number
        total_score: number
        total_star: number
        zone_id: number
      }
      stable_zone_layer_count: number
      all_change_zone_layer_count: number
      climbing_tower_s2: {
        climbing_tower_layer: number
        floor_mvp_num: number
      }
      temple_data: {
        level: number
        sell_days: number
        total_sell_temple_coin: string
      }
      climbing_tower_s3: {
        layer_info: {
          climbing_tower_layer: number
          total_score: number
          icon: string
        }
        mvp_info: {
          floor_mvp_num: number
          rank_percent: number
          display_rank: boolean
        }
      }
      void_front_brief: {
        void_front_id: number
        has_ending_record: boolean
        ending_record_name: string
        total_score: number
        rank_percent: number
      }
      challenge_full_s_times: number
      memory_battlefield_full_stars_times: number
      hadal_brief: {
        hadal_ver: string
        hadal_brief_v2: {
          cur_period_zone_layer_count: number
          score: number
          rank_percent: number
          battle_time: number
          rating: string
          max_score: number
        }
      }
    }
    avatar_list: {
      id: number
      level: number
      name_mi18n: string
      full_name_mi18n: string
      element_type: number
      camp_name_mi18n: string
      avatar_profession: number
      rarity: string
      group_icon_path: string
      hollow_icon_path: string
      rank: number
      is_chosen: boolean
      role_square_url: string
      sub_element_type: number
      awaken_state: string
    }[]
    cur_head_icon_url: string
    buddy_list: {
      id: number
      name: string
      rarity: string
      level: number
      star: number
      bangboo_rectangle_url: string
    }[]
    cat_notes_list: any[]
    award_state: string
    game_data_show: {
      personal_title: string
      title_main_color: string
      title_bottom_color: string
      title_bg_url: string
      medal_list: string[]
      card_url: string
      medal_item_list: {
        medal_icon: string
        number: number
        medal_type: string
        name: string
        is_show: boolean
        medal_id: number
      }[]
      all_medal_list: {
        medal_icon: string
        number: number
        medal_type: string
        name: string
        is_show: boolean
        medal_id: number
      }[]
    }
    area_collections: {
      urban_area_id: number
      urban_area_group_id: number
      is_lock: boolean
      name: string
      icon: string
      collection_progress: number
    }[]
    challenge_schedule_list: {
      challenge_type: string
      start_ts: string
      end_ts: string
    }[]
  }

  /** 菲林月报 */
  export interface Monthly {
    uid: string
    region: string
    current_month: string
    data_month: string
    month_data: {
      list: {
        data_type: string
        count: number
        data_name: string
      }[]
      income_components: {
        action: string
        num: number
        percent: number
      }[]
    }
    optional_month: string[]
    role_info: {
      nickname: string
      avatar: string
    }
  }

  /** 札记 */
  export interface Note {
    energy: {
      progress: {
        max: number
        current: number
      }
      restore: number
      day_type: number
      hour: number
      minute: number
    }
    vitality: {
      max: number
      current: number
    }
    vhs_sale: {
      sale_state: string
    }
    card_sign: string
    bounty_commission: {
      num: number
      total: number
      refresh_time: number
    }
    survey_points: null
    abyss_refresh: number
    coffee: null
    weekly_task: {
      refresh_time: number
      cur_point: number
      max_point: number
    }
    member_card: {
      is_open: boolean
      member_card_state: string
      exp_time: string
    }
    is_sub: boolean
    is_other_sub: boolean
    temple_running: {
      expedition_state: string
      bench_state: string
      shelve_state: string
      level: number
      weekly_currency_max: string
      currency_next_refresh_ts: string
      current_currency: string
    }
  }

  /** 用户 */
  export interface User {
    list: {
      game_biz: string
      region: string
      game_uid: string
      nickname: string
      level: number
      is_chosen: boolean
      region_name: string
      is_official: boolean
      unmask: any[]
    }[]
  }

  /** 抽卡记录 */
  export interface Gacha {
    page: string
    size: string
    list: {
      uid: string
      gacha_id: string
      gacha_type: string
      item_id: string
      count: string
      time: string
      name: string
      lang: string
      item_type: string
      rank_type: string
      id: string
      square_icon: string
    }[]
    gacha_item_list?: {
      uid: string
      gacha_id: string
      gacha_type: string
      item_id: string
      count: string
      time: string
      name: string
      lang: string
      item_type: string
      rank_type: string
      id: string
      square_icon: string

      date?: {
        year: number
        month: number
        day: number
        hour: number
        minute: number
        second: number
      }
      item_name?: string
      rarity?: 'S' | 'A' | 'B'
    }[]
    region: string
    region_time_zone: number
  }

  interface AvatarlistItem {
    id: number
    level: number
    element_type: number
    avatar_profession: number
    rarity: string
    rank: number
    role_square_url: string
    sub_element_type: number
  }

  /** 式舆防卫战v2数据 */
  export interface Abyss {
    hadal_ver: string
    hadal_info_v2: {
      zone_id: number
      hadal_begin_time: Time
      hadal_end_time: Time
      pass_fifth_floor: boolean
      brief: {
        cur_period_zone_layer_count: number
        score: number
        rank_percent: number
        battle_time: number
        rating: string
        challenge_time: Time
        max_score: number
      }
      fitfh_layer_detail?: {
        layer_challenge_info_list: {
          layer_id: number
          rating: string
          buffer: {
            title: string
            text: string
          }
          score: number
          avatar_list: AvatarlistItem[]
          buddy: {
            id: number
            rarity: string
            level: number
            bangboo_rectangle_url: string
          }
          battle_time: number
          monster_pic: string
          max_score: number
        }[]
      }
      fourth_layer_detail?: AbyssLayerDetail
      third_layer_detail?: AbyssLayerDetail
      second_layer_detail?: AbyssLayerDetail
      first_layer_detail?: AbyssLayerDetail
      begin_time: string
      end_time: string
    }
    nick_name: string
    icon: string
  }

  interface Time {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
  }

  interface AbyssLayerDetail {
    buffer: {
      title: string
      text: string
    }
    challenge_time: Time
    rating: string
    layer_challenge_info_list: {
      layer_id: number
      battle_time: number
      avatar_list: AvatarlistItem[]
      buddy: {
        id: number
        rarity: string
        level: number
        bangboo_rectangle_url: string
      }
    }
  }

  /** 危局强袭战数据 */
  export interface Deadly {
    start_time: Time
    end_time: Time
    rank_percent: number
    list: {
      score: number
      star: number
      total_star: number
      challenge_time: Time
      boss: {
        icon: string
        name: string
        race_icon: string
        bg_icon: string
      }[]
      buffer: {
        icon: string
        desc: string
        name: string
      }[]
      avatar_list: AvatarlistItem[]
      buddy: {
        id: number
        rarity: string
        level: number
        bangboo_rectangle_url: string
      }
    }[]
    has_data: boolean
    nick_name: string
    avatar_icon: string
    total_score: number
    total_star: number
    zone_id: number
    total_max_score: number
    room_max_score: number
  }

  /** 临界推演摘要信息 */
  export interface VoidFrontBattleAbstractInfo {
    void_front_battle_abstract_info_brief: {
      void_front_id: number
      end_ts_over_42_days: boolean
      end_ts: number
      has_ending_record: boolean
      ending_record_name: string
      ending_record_bg_pic: string
      total_score: number
      rank_percent: number
      max_score: number
      left_ts: number
      ending_record_id: number
    }
    has_detail_record: boolean
  }

  /** 临界推演数据 */
  export interface VoidFrontBattleDetail {
    void_front_battle_abstract_info_brief: VoidFrontBattleAbstractInfo['void_front_battle_abstract_info_brief']
    boss_challenge_record: {
      boss_info: {
        icon: string
        name: string
        race_icon: string
        bg_icon: string
      }
      main_challenge_record: VoidFrontBattleMainchallengerecord
    }
    main_challenge_record_list: VoidFrontBattleMainchallengerecord[]
    role_basic_info: {
      server: string
      nickname: string
      icon: string
    }
  }

  interface VoidFrontBattleMainchallengerecord {
    battle_id: number
    node_id: number
    name: string
    score: number
    star: string
    score_ratio: string
    challenge_time: Time
    buffer: {
      icon: string
      desc: string
      name: string
    }
    max_score: number
    avatar_list: AvatarlistItem[]
    buddy: {
      id: number
      rarity: string
      level: number
      bangboo_rectangle_url: string
    }
    sub_challenge_record: {
      battle_id: number
      name: string
      star: string
      avatar_list: AvatarlistItem[]
      buddy: {
        id: number
        rarity: string
        level: number
        bangboo_rectangle_url: string
      }
      buffer: {
        icon: string
        desc: string
        name: string
      }
    }[]
  }

}

/** Enka面板数据 */
export namespace Enka {

  export interface Avatar {
    TalentToggles: boolean[]
    SkillLevelList: Skill[]
    EquippedList: Equip[]
    ClaimedRewards: number[]
    WeaponEffectState: number
    IsFavorite: boolean
    Id: number
    Level: number
    /** 突破数 */
    PromotionLevel: number
    Exp: number
    SkinId: number
    /** 影画数 */
    TalentLevel: number
    /** 核心技等级 */
    CoreSkillEnhancement: number
    WeaponUid: number
    ObtainmentTimestamp: number
    Weapon: Weapon | null
  }

  export interface Equip {
    Slot: number
    Equipment: Equipment
  }

  export interface Equipment {
    RandomPropertyList: Property[]
    MainPropertyList: Property[]
    IsAvailable: boolean
    IsLocked: boolean
    IsTrash: boolean
    Id: number
    Uid: number
    Level: number
    BreakLevel: number
    Exp: number
  }

  export interface Property {
    PropertyId: number
    PropertyValue: number
    PropertyLevel: number
  }

  export interface Skill {
    Level: number
    Index: number
  }

  export interface Weapon {
    IsAvailable: boolean
    IsLocked: boolean
    Id: number
    Uid: number
    Level: number
    BreakLevel: number
    Exp: number
    UpgradeLevel: number
  }

}

/** resources/map/*.json数据 */
export namespace MapJSON {

  export interface KeyValue {
    AnomalyData: AnomalyData[]
    BangbooId2Data: BangbooId2Data
    ElementData: ElementData[]
    EquipBaseValue: EquipBaseValue
    EquipMainStats: EquipMainStats
    EquipScore: EquipScore
    PartnerId2Data: PartnerId2Data
    Property2Name: Property2Name
    SuitData: SuitData
    WeaponId2Data: WeaponId2Data
  }

  export interface AnomalyData {
    name: string
    element: string
    element_type: number
    sub_element_type: number
    duration: number
    interval: number
    multiplier: number
    discover?: {
      multiplier: number
      fixed_multiplier: number
    }
  }

  export interface BangbooId2Data {
    [bangboo_id: string]: {
      sprite_id: string
      icon: string
      rank: number
      codename: string
      EN: string
      desc: string
      KO: string
      CHS: string
      JA: string
    }
  }

  export interface ElementData {
    element_type: number
    sub_element_type: number
    zh: string
    zh_sub: string
    en: string
    en_sub: string
    property_id: number
  }

  export interface EquipBaseValue {
    [propID: string]: number
  }

  export interface EquipMainStats {
    [partition: string]: number[]
  }

  export interface EquipScore {
    [charID: string]: string[] | { rules?: string[], [propID: string]: number }
  }

  export interface PartnerId2Data {
    [id: string]: {
      sprite_id: string
      name: string
      full_name: string
      en_name: string
      WeaponType: string
      ElementType: string
      Camp: string
      HitType: string
      Rarity: string
      Attack: number
      AttackGrowth: number
      BreakStun: number
      Defence: number
      DefenceGrowth: number
      HpMax: number
      HpGrowth: number
      Crit: number
      CritDamage: number
      ElementAbnormalPower: number
      ElementMystery: number
      PenDelta: number
      PenRate: number
      SpRecover: number
      /** 角色等级提升 */
      Level: {
        [level: string]: {
          HpMax: number
          Attack: number
          Defence: number
          LevelMax: number
          LevelMin: number
          Materials: { [key: string]: number }
        }
      }
      /** 核心技等级提升 */
      ExtraLevel: {
        [level: string]: {
          MaxLevel: number
          Extra: {
            [key: string]: {
              Prop: number
              Name: string
              Format: string
              Value: number
            }
          }
        }
      }
      /** 皮肤数据 */
      Skin: {
        [skin_id: string]: {
          Name: string
          Desc: string
          Image: string
        }
      }
    }
  }

  export interface Property2Name {
    [property_id: string]: [EN: string, ZH: string, ZH2: string, ZH3: string]
  }

  export interface SuitData {
    [suit_id: string]: {
      sprite_file: string
      name: string
      desc1: string
      desc2: string
      properties: Mys.Property[]
    }
  }

  export interface WeaponId2Data {
    [id: string]: {
      Id: number
      CodeName: string
      Name: string
      Desc: string
      Desc2: string
      Desc3: string
      Rarity: string
      Icon: string
      WeaponType: { [key: string]: string }
      BaseProperty: {
        Name: string
        Name2: string
        Format: string
        Value: number
        Id: number
      }
      RandProperty: {
        Name: string
        Name2: string
        Format: string
        Value: number
        Id: number
      }
      Level: {
        [key: string]: {
          Exp: number
          Rate: number
          Rate2: number
        }
      }
      Stars: {
        [key: string]: {
          StarRate: number
          RandRate: number
        }
      }
      Materials: string
      Talents: {
        [key: string]: {
          Name: string
          Desc: string
        }
      }
      Profession: number
    }
  }

}

/** Hakush接口数据 */
export namespace Hakush {

  export interface PartnerData {
    Id: number
    Icon: string
    Name: string
    CodeName: string
    Rarity: number
    WeaponType: {
      [profession_id: string]: string
    }
    ElementType: {
      [element_id: string]: string
    }
    SpecialElementType: {
      Name: string
      Title: string
      Desc: string
      Icon: string
    }
    HitType: {
      [hit_id: string]: string
    }
    Camp: {
      [id: string]: string
    }
    Gender: number
    PartnerInfo: {
      Birthday: string
      FullName: string
      Gender: string
      IconPath: string
      ImpressionF: string
      ImpressionM: string
      Name: string
      OutlookDesc: string
      ProfileDesc: string
      Race: string
      RoleIcon: string
      Stature: string
      UnlockCondition: string[]
      TrustLv: { [key: string]: string }
    }
    Skin: {
      [skin_id: string]: {
        Name: string
        Desc: string
        Image: string
      }
    }
    Stats: {
      Armor: number
      ArmorGrowth: number
      Attack: number
      AttackGrowth: number
      AvatarPieceId: number
      BreakStun: number
      Crit: number
      CritDamage: number
      CritDmgRes: number
      CritRes: number
      Defence: number
      DefenceGrowth: number
      ElementAbnormalPower: number
      ElementMystery: number
      Endurance: number
      HpGrowth: number
      HpMax: number
      PenDelta: number
      PenRate: number
      Rbl: number
      RblCorrectionFactor: number
      RblProbability: number
      Shield: number
      ShieldGrowth: number
      SpBarPoint: number
      SpRecover: number
      Stun: number
      Tags: string[]
      RpMax: number
      RpRecover: number
    }
    Level: {
      [key: string]: {
        HpMax: number
        Attack: number
        Defence: number
        LevelMax: number
        LevelMin: number
        Materials: { [key: string]: number }
      }
    }
    ExtraLevel: {
      [key: string]: {
        MaxLevel: number
        Extra: { [key: string]: Part4 }
      }
    }
    LevelEXP: number[]
    Skill: {
      Basic: {
        Description: AssistDescription[]
        Material: { [key: string]: { [key: string]: number } }
      }
      Dodge: {
        Description: AssistDescription[]
        Material: { [key: string]: { [key: string]: number } }
      }
      Special: {
        Description: AssistDescription[]
        Material: { [key: string]: { [key: string]: number } }
      }
      Chain: {
        Description: AssistDescription[]
        Material: { [key: string]: { [key: string]: number } }
      }
      Assist: {
        Description: AssistDescription[]
        Material: { [key: string]: { [key: string]: number } }
      }
    }
    SkillList: {
      [key: string]: {
        Name: string
        Desc: string
        ElementType: number
        HitType: number
        Potential: any[]
      }
    }
    Passive: {
      Level: {
        [key: string]: {
          Level: number
          Id: number
          Name: string[]
          Desc: string[]
          ExtraProperty: {}
          Potential: any[]
        }
      }
      Materials: { [key: string]: { [key: string]: number } }
    }
    Talent: {
      [key: string]: {
        Level: number
        Name: string
        Desc: string
        Desc2: string
      }
    }
    FairyRecommend: {
      Slot4: number
      Slot2: number
      SlotSub: number
      Part4: Part4
      Part5: Part4
      Part6: Part4
      PartSub: Part4
    }
    Potential: any[]
  }

  interface Part4 {
    Prop: number
    Name: string
    Format: string
    Value?: number
    Icon?: string
  }

  interface AssistDescription {
    Name: string
    Desc?: string
    Potential: any[]
    Param?: {
      Name: string
      Desc: string
      Param: {
        [key: string]: {
          Main: number
          Growth: number
          Format: string
          DamagePercentage: number
          DamagePercentageGrowth: number
          StunRatio: number
          StunRatioGrowth: number
          SpRecovery: number
          SpRecoveryGrowth: number
          FeverRecovery: number
          FeverRecoveryGrowth: number
          AttributeInfliction: number
          SpConsume: number
          AttackData: any[]
          RpRecovery: number
          RpRecoveryGrowth: number
        }
      }
      Potential: any[]
    }[]
  }

  export interface WeaponData {
    Id: number
    CodeName: string
    Name: string
    Desc: string
    Desc2: string
    Desc3: string
    Rarity: number
    Icon: string
    WeaponType: {
      [profession_id: string]: string
    }
    BaseProperty: {
      Name: string
      Name2: string
      Format: string
      Value: number
    }
    RandProperty: {
      Name: string
      Name2: string
      Format: string
      Value: number
    }
    Level: {
      [key: string]: {
        Exp: number
        Rate: number
        Rate2: number
      }
    }
    Stars: {
      [key: string]: {
        StarRate: number
        RandRate: number
      }
    }
    Materials: string
    Talents: {
      [key: string]: {
        Name: string
        Desc: string
      }
    }
  }

  export interface DeadlyBoss {
    Id: number
    Name: string
    Priority: number
    Zone: {

    }
    BossAdjust: {
      [key: string]: {
        HP: number
        ATK: number
        Points: number
      }
    }
  }

  export interface Boss {
    Name: string
    StageNum: number
    Tag: string[]
    MonsterLevel: number
    LayerBuff: {
      [key: string]: {
        Title: string
        Desc: string
      }
    }
    LayerRoom: {
      [id: string]: {
        MonsterIcon: string
        MonsterList: {
          [id: string]: {
            Id: number
            Name: string
            Image: string
            Element: {
              Ice: number
              Fire: number
              Electric: number
              Ether: number
              Physical: number
            }
            Stats: {
              Hp: number
              Attack: number
              Defence: number
              Stun: number
              AttributeInfliction: number
            }
          }
        }
        MonsterWeakness: {
          [propId: string]: string
        }
        WavesNum: number
      }
    }
    GoalType: number
    SRankGoal: number
    ARankGoal: number
    BRankGoal: number
    SelectableBuff: {
      [key: string]: {
        Title: string
        Desc: string
      }
    }
    Weather: string[]
  }

}

/** Nanoka接口数据 */
export namespace Nanoka {

  export interface PartnerData {
    id: number
    icon: string
    name: string
    code_name: string
    rarity: number
    weapon_type: {
      [profession_id: string]: string
    }
    element_type: {
      [element_id: string]: string
    }
    special_element_type: {
      name?: string
      title?: string
      desc?: string
      icon?: string
    }
    hit_type: {
      [hit_id: string]: string
    }
    camp: {
      [id: string]: string
    }
    gender: number
    partner_info: {
      birthday: string
      full_name: string
      gender: string
      icon_path: string
      impression_f: string
      impression_m: string
      name: string
      outlook_desc: string
      profile_desc: string
      race: string
      role_icon: string
      stature: string
      unlock_condition: string[]
      trust_lv: { [key: string]: string }
    }
    skin: {
      [skin_id: string]: {
        name: string
        desc: string
        image: string
      }
    }
    stats: {
      armor: number
      armor_growth: number
      attack: number
      attack_growth: number
      avatar_piece_id: number
      break_stun: number
      crit: number
      crit_damage: number
      crit_dmg_res: number
      crit_res: number
      defence: number
      defence_growth: number
      element_abnormal_power: number
      element_mystery: number
      endurance: number
      hp_growth: number
      hp_max: number
      pen_delta: number
      pen_rate: number
      rbl: number
      rbl_correction_factor: number
      rbl_probability: number
      shield: number
      shield_growth: number
      sp_bar_point: number
      sp_recover: number
      stun: number
      tags: string[]
      rp_max: number
      rp_recover: number
    }
    level: {
      [key: string]: {
        hp_max: number
        attack: number
        defence: number
        level_max: number
        level_min: number
        materials: { [key: string]: number }
      }
    }
    extra_level: {
      [key: string]: {
        max_level: number
        extra: {
          [key: string]: {
            prop: number
            name: string
            format: string
            value: number
          }
        }
      }
    }
    level_exp: number[]
    skill: {
      basic: {
        description: AssistDescription[]
        material: { [key: string]: { [key: string]: number } }
      }
      dodge: {
        description: AssistDescription[]
        material: { [key: string]: { [key: string]: number } }
      }
      special: {
        description: AssistDescription[]
        material: { [key: string]: { [key: string]: number } }
      }
      chain: {
        description: AssistDescription[]
        material: { [key: string]: { [key: string]: number } }
      }
      assist: {
        description: AssistDescription[]
        material: { [key: string]: { [key: string]: number } }
      }
    }
    skill_list: {
      [key: string]: {
        name: string
        desc: string
        element_type: number
        hit_type: number
        potential: any[]
      }
    }
    passive: {
      level: {
        [key: string]: {
          level: number
          id: number
          name: string[]
          desc: string[]
          extra_property: {}
          potential: any[]
        }
      }
      materials: { [key: string]: { [key: string]: number } }
    }
    talent: {
      [key: string]: {
        level: number
        name: string
        desc: string
        desc2: string
      }
    }
    fairy_recommend: {
      slot4: number
      slot2: number
      slot_sub: number
      part4: Part4
      part5: Part4
      part6: Part4
      part_sub: Part4
    }
    potential: any[]
    potential_detail: {}
    live2_d: string
  }

  interface Part4 {
    prop: number
    name: string
    format: string
    icon: string
  }

  interface AssistDescription {
    name: string
    desc?: string
    potential: any[]
    param?: {
      name: string
      desc: string
      param: Param
      potential: any[]
    }[]
  }

  export interface WeaponData {
    id: number
    code_name: string
    name: string
    desc: string
    desc2: string
    desc3: string
    rarity: number
    icon: string
    weapon_type: {
      [profession_id: string]: string
    }
    base_property: {
      name: string
      name2: string
      format: string
      value: number
    }
    rand_property: {
      name: string
      name2: string
      format: string
      value: number
    }
    level: {
      [level: string]: {
        exp: number
        rate: number
        rate2: number
      }
    }
    stars: {
      [star: string]: {
        star_rate: number
        rand_rate: number
      }
    }
    materials: string
    talents: {
      [talent: string]: {
        name: string
        desc: string
      }
    }
  }

  export interface EquipmentData {
    id: number
    name: string
    desc2: string
    desc4: string
    story: string
    icon: string
    icon2: string
  }

  export interface AllBangbooData {
    [bangboo_id: string]: {
      icon: string
      rank: number
      codename: string
      en: string
      desc: string
      ko: string
      zh: string
      ja: string
    }
  }

}