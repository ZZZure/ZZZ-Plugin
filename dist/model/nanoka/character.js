import { getNanokaUI, getSquareAvatar } from '../../lib/download.js';
class Stats {
    Armor;
    ArmorGrowth;
    Attack;
    AttackGrowth;
    AvatarPieceId;
    BreakStun;
    Crit;
    CritDamage;
    CritDmgRes;
    CritRes;
    Defence;
    DefenceGrowth;
    ElementAbnormalPower;
    ElementMystery;
    Endurance;
    HpGrowth;
    HpMax;
    PenDelta;
    PenRate;
    Rbl;
    RblCorrectionFactor;
    RblProbability;
    Shield;
    ShieldGrowth;
    SpBarPoint;
    SpRecover;
    Stun;
    Tags;
    constructor(data) {
        this.Armor = data.armor;
        this.ArmorGrowth = data.armor_growth;
        this.Attack = data.attack;
        this.AttackGrowth = data.attack_growth;
        this.AvatarPieceId = data.avatar_piece_id;
        this.BreakStun = data.break_stun;
        this.Crit = data.crit;
        this.CritDamage = data.crit_damage;
        this.CritDmgRes = data.crit_dmg_res;
        this.CritRes = data.crit_res;
        this.Defence = data.defence;
        this.DefenceGrowth = data.defence_growth;
        this.ElementAbnormalPower = data.element_abnormal_power;
        this.ElementMystery = data.element_mystery;
        this.Endurance = data.endurance;
        this.HpGrowth = data.hp_growth;
        this.HpMax = data.hp_max;
        this.PenDelta = data.pen_delta;
        this.PenRate = data.pen_rate;
        this.Rbl = data.rbl;
        this.RblCorrectionFactor = data.rbl_correction_factor;
        this.RblProbability = data.rbl_probability;
        this.Shield = data.shield;
        this.ShieldGrowth = data.shield_growth;
        this.SpBarPoint = data.sp_bar_point;
        this.SpRecover = data.sp_recover;
        this.Stun = data.stun;
        this.Tags = data.tags;
    }
}
class Level {
    HpMax;
    Attack;
    Defence;
    LevelMax;
    LevelMin;
    Materials;
    constructor(data) {
        this.HpMax = data.hp_max;
        this.Attack = data.attack;
        this.Defence = data.defence;
        this.LevelMax = data.level_max;
        this.LevelMin = data.level_min;
        this.Materials = data.materials;
    }
}
class ExtraLevel {
    MaxLevel;
    Extra;
    constructor(data) {
        this.MaxLevel = data.max_level;
        this.Extra = {};
        for (const [key, value] of Object.entries(data.extra)) {
            this.Extra[key] = {
                Prop: value.prop,
                Name: value.name,
                Format: value.format,
                Value: value.value,
            };
        }
    }
}
class PartnerInfo {
    Birthday;
    FullName;
    Gender;
    IconPath;
    ImpressionF;
    ImpressionM;
    Name;
    OutlookDesc;
    ProfileDesc;
    Race;
    RoleIcon;
    Stature;
    UnlockCondition;
    constructor(data) {
        this.Birthday = data.birthday;
        this.FullName = data.full_name;
        this.Gender = data.gender;
        this.IconPath = data.icon_path;
        this.ImpressionF = data.impression_f;
        this.ImpressionM = data.impression_m;
        this.Name = data.name;
        this.OutlookDesc = data.outlook_desc;
        this.ProfileDesc = data.profile_desc;
        this.Race = data.race;
        this.RoleIcon = data.role_icon;
        this.Stature = data.stature;
        this.UnlockCondition = data.unlock_condition;
    }
}
const parseRichText = (text) => {
    return '<div class="line">' +
        text
            .replace(/<IconMap:Icon_(\w+)>/g, '<span class="skill-icon $1"></span>')
            .replace(/<color=#(\w+?)>(.+?)<\/color>/g, '<span style="color:#$1"><strong>$2</strong></span>')
            .split('\n')
            .join('</div><div class="line">') +
        '</div>';
};
const toNumber = (value) => {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'string') {
        const num = Number(value);
        return Number.isFinite(num) ? num : 0;
    }
    return 0;
};
const pickByKeys = (source, keys, fallback) => {
    for (const key of keys) {
        if (key in source) {
            return source[key];
        }
    }
    return fallback;
};
class SkillValue {
    Main;
    Growth;
    Format;
    AttackData;
    AttributeInfliction;
    DamagePercentage;
    DamagePercentageGrowth;
    FeverRecovery;
    FeverRecoveryGrowth;
    SpConsume;
    SpRecovery;
    SpRecoveryGrowth;
    StunRatio;
    StunRatioGrowth;
    constructor(data) {
        this.Main = toNumber(pickByKeys(data, ['main', 'Main'], 0));
        this.Growth = toNumber(pickByKeys(data, ['growth', 'Growth'], 0));
        this.Format = String(pickByKeys(data, ['format', 'Format'], ''));
        this.AttackData = pickByKeys(data, ['attack_data', 'AttackData'], []);
        this.AttributeInfliction = toNumber(pickByKeys(data, ['attribute_infliction', 'AttributeInfliction'], 0));
        this.DamagePercentage = toNumber(pickByKeys(data, ['damage_percentage', 'DamagePercentage'], 0));
        this.DamagePercentageGrowth = toNumber(pickByKeys(data, ['damage_percentage_growth', 'DamagePercentageGrowth'], 0));
        this.FeverRecovery = toNumber(pickByKeys(data, ['fever_recovery', 'FeverRecovery'], 0));
        this.FeverRecoveryGrowth = toNumber(pickByKeys(data, ['fever_recovery_growth', 'FeverRecoveryGrowth'], 0));
        this.SpConsume = toNumber(pickByKeys(data, ['sp_consume', 'SpConsume'], 0));
        this.SpRecovery = toNumber(pickByKeys(data, ['sp_recovery', 'SpRecovery'], 0));
        this.SpRecoveryGrowth = toNumber(pickByKeys(data, ['sp_recovery_growth', 'SpRecoveryGrowth'], 0));
        this.StunRatio = toNumber(pickByKeys(data, ['stun_ratio', 'StunRatio'], 0));
        this.StunRatioGrowth = toNumber(pickByKeys(data, ['stun_ratio_growth', 'StunRatioGrowth'], 0));
    }
}
class SkillParam {
    Name;
    Desc;
    Param;
    constructor(data) {
        this.Name = data.name;
        this.Desc = data.desc;
        if (data.param) {
            this.Param = {};
            for (const [key, value] of Object.entries(data.param)) {
                this.Param[key] = new SkillValue(value);
            }
        }
    }
}
class SkillDescription {
    Name;
    Desc;
    description;
    constructor(data) {
        this.Name = data.name;
        this.Desc = data.desc || '';
        this.description = parseRichText(this.Desc);
    }
}
class SkillDescription2 {
    Name;
    Param;
    constructor(data) {
        this.Name = data.name;
        this.Param = (data.param || []).map(param => new SkillParam(param));
    }
}
class SkillDetail {
    Description;
    Material;
    level;
    rate;
    constructor(data) {
        this.Description = data.description.map(desc => desc.param ? new SkillDescription2(desc) : new SkillDescription(desc));
        this.Material = data.material;
    }
    getDetailData(level = 12) {
        this.level = level;
        const rate = [];
        for (const desc of this.Description) {
            if (desc instanceof SkillDescription2) {
                const itemData = {
                    rate: [],
                    details: [],
                };
                for (const param of desc.Param) {
                    if (param.Param && Object.keys(param.Param).length > 0) {
                        const value = Object.values(param.Param)[0];
                        let final = value.Main + value.Growth * (level - 1);
                        if (value.Format === '%') {
                            final = `${final / 100}%`;
                        }
                        itemData.rate.push({
                            label: param.Name,
                            value: final,
                        });
                        itemData.details.push({
                            A: (value.Main + value.Growth * (level - 1)) / 100,
                            B: (value.StunRatio + value.StunRatioGrowth * (level - 1)) / 100,
                            C: (value.SpRecovery + value.SpRecoveryGrowth * (level - 1)) / 10000,
                            D: (value.FeverRecovery + value.FeverRecoveryGrowth * (level - 1)) / 10000,
                            E: value.AttributeInfliction / 100,
                            F: 0,
                            G: 0,
                        });
                    }
                    else {
                        itemData.rate.push({
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
class Skill {
    Basic;
    Dodge;
    Special;
    Chain;
    Assist;
    constructor(data) {
        this.Basic = new SkillDetail(data.basic);
        this.Dodge = new SkillDetail(data.dodge);
        this.Special = new SkillDetail(data.special);
        this.Chain = new SkillDetail(data.chain);
        this.Assist = new SkillDetail(data.assist);
    }
    getSkillData(skill, level = 12) {
        return this[skill === 'basic' ? 'Basic' :
            skill === 'dodge' ? 'Dodge' :
                skill === 'assist' ? 'Assist' :
                    skill === 'special' ? 'Special' : 'Chain'].getDetailData(level);
    }
    getAllSkillData(levels) {
        const { BasicLevel = 12, DodgeLevel = 12, AssistLevel = 12, SpecialLevel = 12, ChainLevel = 12, } = levels;
        return {
            Basic: this.getSkillData('basic', BasicLevel),
            Dodge: this.getSkillData('dodge', DodgeLevel),
            Assist: this.getSkillData('assist', AssistLevel),
            Special: this.getSkillData('special', SpecialLevel),
            Chain: this.getSkillData('chain', ChainLevel),
        };
    }
}
class PassiveLevel {
    Level;
    Id;
    Name;
    Desc;
    description;
    constructor(data) {
        this.Level = data.level;
        this.Id = data.id;
        this.Name = data.name;
        this.Desc = data.desc;
        this.description = data.desc.map(item => parseRichText(item));
    }
}
class Passive {
    Level;
    Materials;
    _level;
    currentLevel;
    constructor(data) {
        this.Level = {};
        this.Materials = data.materials;
        this._level = 0;
        this.currentLevel = null;
        for (const value of Object.values(data.level)) {
            this.Level[value.level - 1] = new PassiveLevel(value);
        }
    }
    getPassiveData(level = 6) {
        this._level = +level;
        this.currentLevel = this.Level[this._level] || null;
        return this.currentLevel;
    }
}
class TalentLevel {
    Level;
    Name;
    Desc;
    Desc2;
    description;
    description2;
    constructor(data) {
        this.Level = data.level;
        this.Name = data.name;
        this.Desc = data.desc;
        this.Desc2 = data.desc2;
        this.description = this.Desc ? parseRichText(this.Desc) : '';
        this.description2 = this.Desc2 ? parseRichText(this.Desc2) : '';
    }
}
export class Character {
    Id;
    Icon;
    Name;
    CodeName;
    Rarity;
    WeaponType;
    ElementType;
    HitType;
    Camp;
    Gender;
    PartnerInfo;
    Stats;
    Level;
    ExtraLevel;
    Talent;
    Skill;
    Passive;
    square_icon;
    cinema_image;
    constructor(data) {
        this.Id = data.id;
        this.Icon = data.icon;
        this.Name = data.name;
        this.CodeName = data.code_name;
        this.Rarity = data.rarity;
        this.WeaponType = data.weapon_type;
        this.ElementType = data.element_type;
        this.HitType = data.hit_type;
        this.Camp = data.camp;
        this.Gender = data.gender;
        this.PartnerInfo = new PartnerInfo(data.partner_info);
        this.Stats = new Stats(data.stats);
        this.Level = {};
        this.ExtraLevel = {};
        this.Talent = [];
        this.square_icon = null;
        this.cinema_image = null;
        for (const [key, value] of Object.entries(data.level)) {
            this.Level[key] = new Level(value);
        }
        for (const [key, value] of Object.entries(data.extra_level)) {
            this.ExtraLevel[key] = new ExtraLevel(value);
        }
        this.Skill = new Skill(data.skill);
        this.Passive = new Passive(data.passive);
        for (const value of Object.values(data.talent)) {
            this.Talent.push(new TalentLevel(value));
        }
    }
    async get_assets() {
        const result = await getSquareAvatar(this.Id);
        this.square_icon = result;
        await this.get_cinema_assets();
    }
    async get_cinema_assets() {
        const result = await getNanokaUI(`Mindscape_${this.Id}_3.webp`);
        this.cinema_image = result;
    }
}
//# sourceMappingURL=character.js.map