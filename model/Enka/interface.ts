import type { Client, segment as segmentSource } from 'icqq'
import type redisM from 'redis'
import type chalk from 'chalk'

declare global {
  var Bot: typeof Client.prototype
  var redis: redisM.RedisClientType
  var segment: typeof segmentSource
  // @ts-expect-error
  var logger: {
    chalk: typeof chalk
    red: typeof chalk
    yellow: typeof chalk
    blue: typeof chalk
    magenta: typeof chalk
    cyan: typeof chalk
    green: typeof chalk
    trace: (...args: any[]) => void
    debug: (...args: any[]) => void
    info: (...args: any[]) => void
    error: (...args: any[]) => void
    warn: (...args: any[]) => void
    fatal: (...args: any[]) => void
    mark: (...args: any[]) => void
  }
}

export namespace Mys {

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
    properties: AvatarProperty[]
    skills: Skill[]
    rank: number
    ranks: Rank[]
    role_vertical_painting_url: string
    equip_plan_info: EquipPlanInfo | null
    us_full_name: string
    vertical_painting_color: string
    sub_element_type: number
    skin_list: Skin[]
    role_square_url: string
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
    game_default: CustomInfo
    cultivate_info: CultivateInfo
    custom_info: CustomInfo
    valid_property_cnt: number
    plan_only_special_property: boolean
    equip_rating: string
    plan_effective_property_list: PlanProperty[]
    equip_rating_score: number
  }

  export interface CultivateInfo {
    name: string
    plan_id: string
    is_delete: boolean
    old_plan: boolean
  }

  export interface CustomInfo {
    property_list: PlanProperty[]
  }

  export interface PlanProperty {
    id: number
    name: string
    full_name: string
    system_id: number
    is_select: boolean
  }

  export interface AvatarProperty {
    property_name: string
    property_id: number
    base: string
    add: string
    final: string
  }

  export interface Rank {
    id: number
    name: string
    desc: string
    pos: number
    is_unlocked: boolean
  }

  export interface Skill {
    level: number
    skill_type: number
    items: {
      title: string
      text: string
    }[]
  }

  export interface Skin {
    skin_id: number
    skin_name: string
    skin_vertical_painting_url: string
    skin_square_url: string
    skin_hollow_icon_path: string
    skin_vertical_painting_color: string
    unlocked: boolean
    rarity: string
    is_original: boolean
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
          avatar_list: {
            id: number
            level: number
            rarity: string
            element_type: number
            avatar_profession: number
            rank: number
            role_square_url: string
            sub_element_type: number
          }[]
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

  export interface Time {
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
  }

  export interface AbyssLayerDetail {
    buffer: {
      title: string
      text: string
    }
    challenge_time: Time
    rating: string
    layer_challenge_info_list: {
      layer_id: number
      battle_time: number
      avatar_list: {
        id: number
        level: number
        rarity: string
        element_type: number
        avatar_profession: number
        rank: number
        role_square_url: string
        sub_element_type: number
      }[]
      buddy: {
        id: number
        rarity: string
        level: number
        bangboo_rectangle_url: string
      }
    }
  }

}

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

export namespace Map {

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

  export interface SuitData {
    [suit_id: string]: {
      sprite_file: string
      name: string
      desc1: string
      desc2: string
      properties: Mys.Property[]
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

}

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
        Description: {
          Name: string
          Desc?: string
          Potential: any[]
          Param?: {
            Name: string
            Desc: string
            Param?: {
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
        }[]
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

}