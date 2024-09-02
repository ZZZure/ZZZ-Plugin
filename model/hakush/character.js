import { getSquareAvatar } from '../../lib/download.js';
/**
 * @typedef {Object} StatsData
 * @property {number} Armor
 * @property {number} ArmorGrowth
 * @property {number} Attack
 * @property {number} AttackGrowth
 * @property {number} AvatarPieceId
 * @property {number} BreakStun
 * @property {number} BuffResistBurnPossibilityDelta
 * @property {number} BuffResistBurnPossibilityRatio
 * @property {number} BuffResistElectricPossibilityDelta
 * @property {number} BuffResistElectricPossibilityRatio
 * @property {number} BuffResistFrozenPossibilityDelta
 * @property {number} BuffResistFrozenPossibilityRatio
 * @property {number} Crit
 * @property {number} CritDamage
 * @property {number} CritDmgRes
 * @property {number} CritRes
 * @property {number} Defence
 * @property {number} DefenceGrowth
 * @property {number} ElementAbnormalPower
 * @property {number} ElementMystery
 * @property {number} Endurance
 * @property {number} HpGrowth
 * @property {number} HpMax
 * @property {number} Luck
 * @property {number} PenDelta
 * @property {number} PenRate
 * @property {number} Rbl
 * @property {number} RblCorrectionFactor
 * @property {number} RblProbability
 * @property {number} Shield
 * @property {number} ShieldGrowth
 * @property {number} SpBarPoint
 * @property {number} SpRecover
 * @property {number} StarInitial
 * @property {number} Stun
 * @property {string[]} Tags
 */

class Stats {
  /**
   * @param {StatsData} data
   */
  constructor(data) {
    this.Armor = data.Armor;
    this.ArmorGrowth = data.ArmorGrowth;
    this.Attack = data.Attack;
    this.AttackGrowth = data.AttackGrowth;
    this.AvatarPieceId = data.AvatarPieceId;
    this.BreakStun = data.BreakStun;
    this.BuffResistBurnPossibilityDelta = data.BuffResistBurnPossibilityDelta;
    this.BuffResistBurnPossibilityRatio = data.BuffResistBurnPossibilityRatio;
    this.BuffResistElectricPossibilityDelta =
      data.BuffResistElectricPossibilityDelta;
    this.BuffResistElectricPossibilityRatio =
      data.BuffResistElectricPossibilityRatio;
    this.BuffResistFrozenPossibilityDelta =
      data.BuffResistFrozenPossibilityDelta;
    this.BuffResistFrozenPossibilityRatio =
      data.BuffResistFrozenPossibilityRatio;
    this.Crit = data.Crit;
    this.CritDamage = data.CritDamage;
    this.CritDmgRes = data.CritDmgRes;
    this.CritRes = data.CritRes;
    this.Defence = data.Defence;
    this.DefenceGrowth = data.DefenceGrowth;
    this.ElementAbnormalPower = data.ElementAbnormalPower;
    this.ElementMystery = data.ElementMystery;
    this.Endurance = data.Endurance;
    this.HpGrowth = data.HpGrowth;
    this.HpMax = data.HpMax;
    this.Luck = data.Luck;
    this.PenDelta = data.PenDelta;
    this.PenRate = data.PenRate;
    this.Rbl = data.Rbl;
    this.RblCorrectionFactor = data.RblCorrectionFactor;
    this.RblProbability = data.RblProbability;
    this.Shield = data.Shield;
    this.ShieldGrowth = data.ShieldGrowth;
    this.SpBarPoint = data.SpBarPoint;
    this.SpRecover = data.SpRecover;
    this.StarInitial = data.StarInitial;
    this.Stun = data.Stun;
    this.Tags = data.Tags;
  }
}

/**
 * @typedef {Object} LevelUpMaterialsData
 * @property {number} _10
 * @property {number} _100215
 * @property {number} _100225
 * @property {number} _100235
 * @property {number} _100113
 * @property {number} _100123
 * @property {number} _100133
 * @property {number} _100941
 */

class LevelUpMaterials {
  /**
   * @param {LevelUpMaterialsData} data
   */
  constructor(data) {
    this._10 = data._10;
    this._100215 = data._100215;
    this._100225 = data._100225;
    this._100235 = data._100235;
    this._100113 = data._100113;
    this._100123 = data._100123;
    this._100133 = data._100133;
    this._100941 = data._100941;
  }
}

/**
 * @typedef {Object} LevelData
 * @property {number} HpMax
 * @property {number} Attack
 * @property {number} Defence
 * @property {number} LevelMax
 * @property {number} LevelMin
 * @property {LevelUpMaterialsData} Materials
 */

class Level {
  /**
   * @param {LevelData} data
   */
  constructor(data) {
    this.HpMax = data.HpMax;
    this.Attack = data.Attack;
    this.Defence = data.Defence;
    this.LevelMax = data.LevelMax;
    this.LevelMin = data.LevelMin;
    this.Materials = new LevelUpMaterials(data.Materials);
  }
}

/**
 * @typedef {Object} ExtraLevelData
 * @property {number} MaxLevel
 * @property {Record<string, Record<string, string|number|float>>} Extra
 */

class ExtraLevel {
  /**
   * @param {ExtraLevelData} data
   */
  constructor(data) {
    this.MaxLevel = data.MaxLevel;
    this.Extra = data.Extra;
  }
}

/**
 * @typedef {Object} PartnerInfoData
 * @property {string} Birthday
 * @property {string} FullName
 * @property {string} Gender
 * @property {string} IconPath
 * @property {string} ImpressionF
 * @property {string} ImpressionM
 * @property {string} Name
 * @property {string} OutlookDesc
 * @property {string} ProfileDesc
 * @property {string} Race
 * @property {string} RoleIcon
 * @property {string} Stature
 * @property {string[]} UnlockCondition
 */

class PartnerInfo {
  /**
   * @param {PartnerInfoData} data
   */
  constructor(data) {
    this.Birthday = data.Birthday;
    this.FullName = data.FullName;
    this.Gender = data.Gender;
    this.IconPath = data.IconPath;
    this.ImpressionF = data.ImpressionF;
    this.ImpressionM = data.ImpressionM;
    this.Name = data.Name;
    this.OutlookDesc = data.OutlookDesc;
    this.ProfileDesc = data.ProfileDesc;
    this.Race = data.Race;
    this.RoleIcon = data.RoleIcon;
    this.Stature = data.Stature;
    this.UnlockCondition = data.UnlockCondition;
  }
}

/**
 * @typedef {Object} SkillValueData
 * @property {number} Main
 * @property {number} Growth
 * @property {string} Format
 * @property {number[]} AttackData
 * @property {number} AttributeInfliction
 * @property {number} FeverRecovery
 * @property {number} FeverRecoveryGrowth
 * @property {number} SpConsume
 * @property {number} SpRecovery
 * @property {number} SpRecoveryGrowth
 * @property {number} StunRatio
 * @property {number} StunRatioGrowth
 * @property {number} DamagePercentage
 * @property {number} DamagePercentageGrowth
 */

class SkillValue {
  /**
   * @param {SkillValueData} data
   */
  constructor(data) {
    this.Main = data.Main;
    this.Growth = data.Growth;
    this.Format = data.Format;
    this.AttackData = data.AttackData;
    this.AttributeInfliction = data.AttributeInfliction;
    this.DamagePercentage = data.DamagePercentage;
    this.DamagePercentageGrowth = data.DamagePercentageGrowth;
    this.FeverRecovery = data.FeverRecovery;
    this.FeverRecoveryGrowth = data.FeverRecoveryGrowth;
    this.SpConsume = data.SpConsume;
    this.SpRecovery = data.SpRecovery;
    this.SpRecoveryGrowth = data.SpRecoveryGrowth;
    this.StunRatio = data.StunRatio;
    this.StunRatioGrowth = data.StunRatioGrowth;
  }
}

/**
 * @typedef {Object} SkillParamData
 * @property {string} Name
 * @property {string} Desc
 * @property {Record<string, SkillValueData>} Param
 */

class SkillParam {
  /**
   * @param {SkillParamData} data
   */
  constructor(data) {
    this.Name = data.Name;
    this.Desc = data.Desc;
    if (data.Param) {
      this.Param = {};
      for (const [key, value] of Object.entries(data.Param)) {
        this.Param[key] = new SkillValue(value);
      }
    }
  }
}

/**
 * @typedef {Object} SkillDescriptionData
 * @property {string} Name
 * @property {string} Desc
 */

class SkillDescription {
  /**
   * @param {SkillDescriptionData} data
   */
  constructor(data) {
    this.Name = data.Name;
    this.Desc = data.Desc;
    /** @type {string} */
    this.description =
      '<div class="line">' +
      this.Desc.replace(
        /<IconMap:Icon_(\w+)>/g,
        '<span class="skill-icon $1"></span>'
      )
        .replace(
          /<color=#(\w+?)>(.+?)<\/color>/g,
          '<span style="color:#$1"><strong>$2</strong></span>'
        )
        .split('\n')
        .join('</div><div class="line">') +
      '</div>';
  }
}

/**
 * @typedef {Object} SkillDescription2Data
 * @property {string} Name
 * @property {SkillParamData[]} Param
 */

class SkillDescription2 {
  /**
   * @param {SkillDescription2Data} data
   */
  constructor(data) {
    this.Name = data.Name;
    this.Param = data.Param.map(param => new SkillParam(param));
  }
}

/**
 * @typedef {Object} SkillDetailData
 * @property {(SkillDescriptionData|SkillDescription2Data)[]} Description
 * @property {Recordstring, Record<string, number>>} Material
 */

class SkillDetail {
  /**
   * @param {SkillDetailData} data
   */
  constructor(data) {
    this.Description = data.Description.map(desc =>
      desc.Param ? new SkillDescription2(desc) : new SkillDescription(desc)
    );
    this.Material = data.Material;
  }

  /**
   * 获取技能详情数据
   * @param {number} level
   * @returns {Record<string, string|number>}
   */
  getDetailData(level = 12) {
    this.level = level;
    const rate = [];
    for (const desc of this.Description) {
      if (desc.Param) {
        const itemData = {
          rate: [],
          details: [],
        };
        for (const param of desc.Param) {
          if (!!param.Param) {
            const value = Object.values(param.Param)[0];
            let final = value.Main + value.Growth * (level - 1);
            if (value.Format === '%') {
              final = `${final / 100}%`;
            }
            itemData['rate'].push({
              label: param.Name,
              value: final,
            });
            itemData['details'].push({
              A: (value.Main + value.Growth * (level - 1)) / 100,
              B: (value.StunRatio + value.StunRatioGrowth * (level - 1)) / 100,
              C:
                (value.SpRecovery + value.SpRecoveryGrowth * (level - 1)) /
                10000,
              D:
                (value.FeverRecovery +
                  value.FeverRecoveryGrowth * (level - 1)) /
                10000,
              E: value.AttributeInfliction / 100,
              F: 0,
              G: 0,
            });
          } else {
            itemData['rate'].push({
              label: param.Name,
              value: param.Desc,
            });
          }
        }
        rate.push({
          name: desc.Name,
          data: itemData,
        });
      }
    }
    this.rate = rate;
    return rate;
  }
}

/**
 * @typedef {Object} SkillData
 * @property {SkillDetailData} Basic
 * @property {SkillDetailData} Dodge
 * @property {SkillDetailData} Special
 * @property {SkillDetailData>} Chain
 * @property {SkillDetailData>} Assist
 */

class Skill {
  /**
   * @param {SkillData} data
   */
  constructor(data) {
    this.Basic = new SkillDetail(data.Basic);
    this.Dodge = new SkillDetail(data.Dodge);
    this.Special = new SkillDetail(data.Special);
    this.Chain = new SkillDetail(data.Chain);
    this.Assist = new SkillDetail(data.Assist);
  }

  /**
   * 获取技能数据
   * @param {string} skill
   * @param {number} level
   * @returns {Record<string, string|number>}
   */
  getSkillData(skill, level = 12) {
    return this[skill].getDetailData(level);
  }

  /**
   * 获取所有技能数据
   * @param {Record<string, number>} levels
   * @returns {Record<string, Record<'BasicLevel'|'DodgeLevel'|'AssistLevel'|'SpecialLevel'|'ChainLevel', number>>}
   */
  getAllSkillData(levels) {
    const {
      BasicLevel = 12,
      DodgeLevel = 12,
      AssistLevel = 12,
      SpecialLevel = 12,
      ChainLevel = 12,
    } = levels;
    return {
      Basic: this.getSkillData('Basic', BasicLevel),
      Dodge: this.getSkillData('Dodge', DodgeLevel),
      Assist: this.getSkillData('Assist', AssistLevel),
      Special: this.getSkillData('Special', SpecialLevel),
      Chain: this.getSkillData('Chain', ChainLevel),
    };
  }
}

/**
 * @typedef {Object} PassiveLevelData
 * @property {number} Level
 * @property {number} Id
 * @property {string[]} Name
 * @property {string[]} Desc
 */

class PassiveLevel {
  /**
   * @param {PassiveLevelData} data
   */
  constructor(data) {
    this.Level = data.Level;
    this.Id = data.Id;
    this.Name = data.Name;
    this.Desc = data.Desc;

    /** @type {string[]} */
    this.description = data.Desc.map(
      item =>
        '<div class="line">' +
        item
          .replace(
            /<IconMap:Icon_(\w+)>/g,
            '<span class="skill-icon $1"></span>'
          )
          .replace(
            /<color=#(\w+?)>(.+?)<\/color>/g,
            '<span style="color:#$1"><strong>$2</strong></span>'
          )
          .split('\n')
          .join('</div><div class="line">') +
        '</div>'
    );
  }
}

/**
 * @typedef {Object} PassiveData
 * @property {Record<number, PassiveLevelData>} Level
 * @property {Record<string, Record<string, number>>} Materials
 */

class Passive {
  /**
   * @param {PassiveData} data
   */
  constructor(data) {
    this.Level = {};
    this.Materials = data.Materials;

    for (const [key, value] of Object.entries(data.Level)) {
      this.Level[key] = new PassiveLevel(value);
    }
  }

  /** @type {PassiveLevel} */
  getPassiveData(level = 1) {
    this._level = level;
    this.currentLevel = this.Level[level];
    return this.currentLevel;
  }
}

/**
 * @typedef {Object} TalentLevelData
 * @property {number} Level
 * @property {string} Name
 * @property {string} Desc
 * @property {string} Desc2
 */

class TalentLevel {
  /**
   * @param {TalentLevelData} data
   */
  constructor(data) {
    this.Level = data.Level;
    this.Name = data.Name;
    this.Desc = data.Desc;
    this.Desc2 = data.Desc2;
  }
}

/**
 * @typedef {Object} CharacterData
 * @property {number} Id
 * @property {string} Icon
 * @property {string} Name
 * @property {string} CodeName
 * @property {number} Rarity
 * @property {Record<string, string>} WeaponType
 * @property {Record<string, string>} ElementType
 * @property {Record<string, string>} HitType
 * @property {Record<string, string>} Camp
 * @property {number} Gender
 * @property {PartnerInfoData} PartnerInfo
 * @property {StatsData} Stats
 * @property {Record<('1'|'2'|'3'|'4'|'5'|'6'), LevelData>} Level
 * @property {Record<('1'|'2'|'3'|'4'|'5'|'6'), ExtraLevelData>} ExtraLevel
 * @property {SkillData} Skill
 * @property {PassiveData} Passive
 * @property {Record<('1'|'2'|'3'|'4'|'5'|'6'),TalentLevel>} Talent
 */

export class Character {
  /**
   * @param {CharacterData} data
   */
  constructor(data) {
    this.Id = data.Id;
    this.Icon = data.Icon;
    this.Name = data.Name;
    this.CodeName = data.CodeName;
    this.Rarity = data.Rarity;
    this.WeaponType = data.WeaponType;
    this.ElementType = data.ElementType;
    this.HitType = data.HitType;
    this.Camp = data.Camp;
    this.Gender = data.Gender;
    this.PartnerInfo = new PartnerInfo(data.PartnerInfo);
    this.Stats = new Stats(data.Stats);
    this.Level = {};
    this.ExtraLevel = {};
    this.Talent = {};

    for (const [key, value] of Object.entries(data.Level)) {
      this.Level[key] = new Level(value);
    }
    for (const [key, value] of Object.entries(data.ExtraLevel)) {
      this.ExtraLevel[key] = new ExtraLevel(value);
    }
    this.Skill = new Skill(data.Skill);
    this.Passive = new Passive(data.Passive);

    for (const [key, value] of Object.entries(data.Talent)) {
      this.Talent[key] = new TalentLevel(value);
    }
  }

  async get_assets() {
    const result = await getSquareAvatar(this.Id);
    this.square_icon = result;
  }
}
