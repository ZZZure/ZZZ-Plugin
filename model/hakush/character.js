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
 * @property {Object.<string, Object.<string, string|number|float>>} Extra
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
 * @typedef {Object} SkillValueData
 * @property {number} Main
 * @property {number} Growth
 * @property {string} Format
 */

class SkillValue {
  /**
   * @param {SkillValueData} data
   */
  constructor(data) {
    this.Main = data.Main;
    this.Growth = data.Growth;
    this.Format = data.Format;
  }
}

/**
 * @typedef {Object} SkillParamData
 * @property {string} Name
 * @property {string} Desc
 * @property {Object.<string, SkillValueData>} Param
 */

class SkillParam {
  /**
   * @param {SkillParamData} data
   */
  constructor(data) {
    this.Name = data.Name;
    this.Desc = data.Desc;
    this.Param = {};
    for (const [key, value] of Object.entries(data.Param)) {
      this.Param[key] = new SkillValue(value);
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
  }
}

/**
 * @typedef {Object} SkillDescription2Data
 * @property {string} Name
 * @property {SkillParamData} Param
 */

class SkillDescription2 {
  /**
   * @param {SkillDescription2Data} data
   */
  constructor(data) {
    this.Name = data.Name;
    this.Param = new SkillParam(data.Param);
  }
}

/**
 * @typedef {Object} SkillDetailData
 * @property {(SkillDescriptionData|SkillDescription2Data)[]} Description
 * @property {Object.<string, Object.<string, number>>} Material
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
}

/**
 * @typedef {Object} SkillData
 * @property {Object.<string, SkillDetailData>} Basic
 * @property {Object.<string, SkillDetailData>} Dodge
 * @property {Object.<string, SkillDetailData>} Special
 * @property {Object.<string, SkillDetailData>} Chain
 * @property {Object.<string, SkillDetailData>} Assist
 */

class Skill {
  /**
   * @param {SkillData} data
   */
  constructor(data) {
    this.Basic = {};
    this.Dodge = {};
    this.Special = {};
    this.Chain = {};
    this.Assist = {};

    for (const [key, value] of Object.entries(data.Basic)) {
      this.Basic[key] = new SkillDetail(value);
    }
    for (const [key, value] of Object.entries(data.Dodge)) {
      this.Dodge[key] = new SkillDetail(value);
    }
    for (const [key, value] of Object.entries(data.Special)) {
      this.Special[key] = new SkillDetail(value);
    }
    for (const [key, value] of Object.entries(data.Chain)) {
      this.Chain[key] = new SkillDetail(value);
    }
    for (const [key, value] of Object.entries(data.Assist)) {
      this.Assist[key] = new SkillDetail(value);
    }
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
  }
}

/**
 * @typedef {Object} PassiveData
 * @property {Object.<number, PassiveLevelData>} Level
 * @property {Object.<string, Object.<string, number>>} Materials
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
 * @typedef {Object} TalentData
 * @property {TalentLevelData} Heroism
 * @property {TalentLevelData} YouthfulArrogance
 * @property {TalentLevelData} Insensitive
 * @property {TalentLevelData} OriginalAspiration
 * @property {TalentLevelData} LongingDistance
 * @property {TalentLevelData} Idealism
 */

class Talent {
  /**
   * @param {TalentData} data
   */
  constructor(data) {
    this.Heroism = new TalentLevel(data.Heroism);
    this.YouthfulArrogance = new TalentLevel(data.YouthfulArrogance);
    this.Insensitive = new TalentLevel(data.Insensitive);
    this.OriginalAspiration = new TalentLevel(data.OriginalAspiration);
    this.LongingDistance = new TalentLevel(data.LongingDistance);
    this.Idealism = new TalentLevel(data.Idealism);
  }
}

/**
 * @typedef {Object} CharacterData
 * @property {number} Id
 * @property {string} Icon
 * @property {string} Name
 * @property {string} CodeName
 * @property {number} Rarity
 * @property {Object.<string, string>} WeaponType
 * @property {Object.<string, string>} ElementType
 * @property {Object.<string, string>} HitType
 * @property {Object.<string, string>} Camp
 * @property {number} Gender
 * @property {Object} PartnerInfo
 * @property {StatsData} Stats
 * @property {Object.<('1'|'2'|'3'|'4'|'5'|'6'), LevelData>} Level
 * @property {Object.<('1'|'2'|'3'|'4'|'5'|'6'), ExtraLevelData>} ExtraLevel
 * @property {SkillData} Skill
 * @property {PassiveData} Passive
 * @property {TalentData} Talent
 */

class Character {
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
    this.PartnerInfo = data.PartnerInfo;
    this.Stats = new Stats(data.Stats);
    this.Level = {};
    this.ExtraLevel = {};

    for (const [key, value] of Object.entries(data.Level)) {
      this.Level[key] = new Level(value);
    }
    for (const [key, value] of Object.entries(data.ExtraLevel)) {
      this.ExtraLevel[key] = new ExtraLevel(value);
    }
    this.Skill = new Skill(data.Skill);
    this.Passive = new Passive(data.Passive);
    this.Talent = new Talent(data.Talent);
  }
}
