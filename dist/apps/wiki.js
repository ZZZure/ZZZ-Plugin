import { getHakushCharacterData, isSkillLevelLegal } from '../lib/hakush.js';
import { rulePrefix } from '../lib/common.js';
import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
const displays = [
    {
        key: 'Basic',
        name: '普通攻击',
        icon: 'basic'
    },
    {
        key: 'Dodge',
        name: '闪避',
        icon: 'dodge'
    },
    {
        key: 'Assist',
        name: '支援技',
        icon: 'assist'
    },
    {
        key: 'Special',
        name: '特殊技',
        icon: 'special'
    },
    {
        key: 'Chain',
        name: '连携技',
        icon: 'chain'
    }
];
export class Wiki extends ZZZPlugin {
    constructor() {
        super({
            name: '[ZZZ-Plugin]wiki',
            dsc: 'zzzWiki',
            event: 'message',
            priority: _.get(settings.getConfig('priority'), 'wiki', 70),
            rule: [
                {
                    reg: `${rulePrefix}(.*)(天赋|技能)(.*)$`,
                    fnc: 'skills'
                },
                {
                    reg: `${rulePrefix}(.*)(意象影画|意象|影画|命座)$`,
                    fnc: 'cinema'
                }
            ]
        });
    }
    async skills() {
        const reg = new RegExp(`${rulePrefix}(.*)(?:天赋|技能)(.*)$`);
        const match = this.e.msg.match(reg);
        const charname = match?.[4]?.trim();
        if (!charname)
            return false;
        const levelsChar = match?.[5]?.trim();
        const levels = levelsChar
            ? levelsChar.split(/\.|\s+/).map(x => {
                const trimmed = x.trim();
                const _x = Number(trimmed);
                if (!_.isNaN(_x))
                    return _x;
                if (_.isString(trimmed) && trimmed.length > 0)
                    return trimmed.toUpperCase().charCodeAt(0) - 64;
                return undefined;
            })
            : [];
        const parsedLevels = levels;
        const [BasicLevel = 12, DodgeLevel = 12, AssistLevel = 12, SpecialLevel = 12, ChainLevel = 12, CoreLevel = 6] = parsedLevels;
        if (!isSkillLevelLegal('BasicLevel', BasicLevel) ||
            !isSkillLevelLegal('DodgeLevel', DodgeLevel) ||
            !isSkillLevelLegal('AssistLevel', AssistLevel) ||
            !isSkillLevelLegal('SpecialLevel', SpecialLevel) ||
            !isSkillLevelLegal('ChainLevel', ChainLevel) ||
            !isSkillLevelLegal('CoreLevel', CoreLevel)) {
            return false;
        }
        const charData = await getHakushCharacterData(charname);
        if (!charData) {
            return this.reply(`暂无${charname}角色数据`);
        }
        charData.Skill.getAllSkillData({
            BasicLevel,
            DodgeLevel,
            AssistLevel,
            SpecialLevel,
            ChainLevel
        });
        charData.Passive.getPassiveData(CoreLevel);
        await charData.get_assets();
        const finalData = {
            charData,
            displays
        };
        await this.render('skills/index.html', finalData);
    }
    async cinema() {
        const reg = new RegExp(`${rulePrefix}(.*)(意象影画|意象|影画|命座)$`);
        const match = this.e.msg.match(reg);
        const charname = match?.[4]?.trim();
        if (!charname)
            return false;
        const charData = await getHakushCharacterData(charname);
        const cinemaData = charData?.Talent;
        if (!cinemaData) {
            return this.reply(`未找到${charname}的数据`);
        }
        await charData.get_assets();
        const finalData = {
            charData
        };
        await this.render('cinema/index.html', finalData);
    }
}
//# sourceMappingURL=wiki.js.map