import { getHakushUI, getSquareAvatar } from '../../lib/download.js';
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
        this.Armor = data.Armor;
        this.ArmorGrowth = data.ArmorGrowth;
        this.Attack = data.Attack;
        this.AttackGrowth = data.AttackGrowth;
        this.AvatarPieceId = data.AvatarPieceId;
        this.BreakStun = data.BreakStun;
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
        this.PenDelta = data.PenDelta;
        this.PenRate = data.PenRate;
        this.Rbl = data.Rbl;
        this.RblCorrectionFactor = data.RblCorrectionFactor;
        this.RblProbability = data.RblProbability;
        this.Shield = data.Shield;
        this.ShieldGrowth = data.ShieldGrowth;
        this.SpBarPoint = data.SpBarPoint;
        this.SpRecover = data.SpRecover;
        this.Stun = data.Stun;
        this.Tags = data.Tags;
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
        this.HpMax = data.HpMax;
        this.Attack = data.Attack;
        this.Defence = data.Defence;
        this.LevelMax = data.LevelMax;
        this.LevelMin = data.LevelMin;
        this.Materials = data.Materials;
    }
}
class ExtraLevel {
    MaxLevel;
    Extra;
    constructor(data) {
        this.MaxLevel = data.MaxLevel;
        this.Extra = data.Extra;
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
class SkillParam {
    Name;
    Desc;
    Param;
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
class SkillDescription {
    Name;
    Desc;
    description;
    constructor(data) {
        this.Name = data.Name;
        this.Desc = data.Desc || '';
        this.description =
            '<div class="line">' +
                this.Desc.replace(/<IconMap:Icon_(\w+)>/g, '<span class="skill-icon $1"></span>')
                    .replace(/<color=#(\w+?)>(.+?)<\/color>/g, '<span style="color:#$1"><strong>$2</strong></span>')
                    .split('\n')
                    .join('</div><div class="line">') +
                '</div>';
    }
}
class SkillDescription2 {
    Name;
    Param;
    constructor(data) {
        this.Name = data.Name;
        this.Param = data.Param.map(param => new SkillParam(param));
    }
}
class SkillDetail {
    Description;
    Material;
    level;
    rate;
    constructor(data) {
        this.Description = data.Description.map(desc => desc.Param ? new SkillDescription2(desc) : new SkillDescription(desc));
        this.Material = data.Material;
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
                            C: (value.SpRecovery + value.SpRecoveryGrowth * (level - 1)) /
                                10000,
                            D: (value.FeverRecovery +
                                value.FeverRecoveryGrowth * (level - 1)) /
                                10000,
                            E: value.AttributeInfliction / 100,
                            F: 0,
                            G: 0,
                        });
                    }
                    else {
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
class Skill {
    Basic;
    Dodge;
    Special;
    Chain;
    Assist;
    constructor(data) {
        this.Basic = new SkillDetail(data.Basic);
        this.Dodge = new SkillDetail(data.Dodge);
        this.Special = new SkillDetail(data.Special);
        this.Chain = new SkillDetail(data.Chain);
        this.Assist = new SkillDetail(data.Assist);
    }
    getSkillData(skill, level = 12) {
        return this[skill].getDetailData(level);
    }
    getAllSkillData(levels) {
        const { BasicLevel = 12, DodgeLevel = 12, AssistLevel = 12, SpecialLevel = 12, ChainLevel = 12, } = levels;
        return {
            Basic: this.getSkillData('Basic', BasicLevel),
            Dodge: this.getSkillData('Dodge', DodgeLevel),
            Assist: this.getSkillData('Assist', AssistLevel),
            Special: this.getSkillData('Special', SpecialLevel),
            Chain: this.getSkillData('Chain', ChainLevel),
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
        this.Level = data.Level;
        this.Id = data.Id;
        this.Name = data.Name;
        this.Desc = data.Desc;
        this.description = data.Desc.map(item => '<div class="line">' +
            item
                .replace(/<IconMap:Icon_(\w+)>/g, '<span class="skill-icon $1"></span>')
                .replace(/<color=#(\w+?)>(.+?)<\/color>/g, '<span style="color:#$1"><strong>$2</strong></span>')
                .split('\n')
                .join('</div><div class="line">') +
            '</div>');
    }
}
class Passive {
    Level;
    Materials;
    _level;
    currentLevel;
    constructor(data) {
        this.Level = {};
        this.Materials = data.Materials;
        for (const [key, value] of Object.entries(data.Level)) {
            this.Level[value.Level - 1] = new PassiveLevel(value);
        }
    }
    getPassiveData(level = 6) {
        this._level = +level;
        this.currentLevel = this.Level[this._level];
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
        this.Level = data.Level;
        this.Name = data.Name;
        this.Desc = data.Desc;
        this.Desc2 = data.Desc2;
        this.description = this.Desc
            ? '<div class="line">' +
                this.Desc.replace(/<IconMap:Icon_(\w+)>/g, '<span class="skill-icon $1"></span>')
                    .replace(/<color=#(\w+?)>(.+?)<\/color>/g, '<span style="color:#$1"><strong>$2</strong></span>')
                    .split('\n')
                    .join('</div><div class="line">') +
                '</div>'
            : '';
        this.description2 = this.Desc2
            ? '<div class="line">' +
                this.Desc2.replace(/<IconMap:Icon_(\w+)>/g, '<span class="skill-icon $1"></span>')
                    .replace(/<color=#(\w+?)>(.+?)<\/color>/g, '<span style="color:#$1"><strong>$2</strong></span>')
                    .split('\n')
                    .join('</div><div class="line">') +
                '</div>'
            : '';
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
        this.Talent = [];
        for (const [key, value] of Object.entries(data.Level)) {
            this.Level[key] = new Level(value);
        }
        for (const [key, value] of Object.entries(data.ExtraLevel)) {
            this.ExtraLevel[key] = new ExtraLevel(value);
        }
        this.Skill = new Skill(data.Skill);
        this.Passive = new Passive(data.Passive);
        for (const [_, value] of Object.entries(data.Talent)) {
            this.Talent.push(new TalentLevel(value));
        }
    }
    async get_assets() {
        const result = await getSquareAvatar(this.Id);
        this.square_icon = result;
        await this.get_cinema_assets();
    }
    async get_cinema_assets() {
        const result = await getHakushUI(`Mindscape_${this.Id}_3.webp`);
        this.cinema_image = result;
    }
}
//# sourceMappingURL=character.js.map