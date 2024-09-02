import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { rulePrefix } from '../lib/common.js';
import { getHakushCharacterData, isSkillLevelLegal } from '../lib/hakush.js';
const displays = [
  {
    key: 'Basic',
    name: '普通攻击',
    icon: 'basic',
  },
  {
    key: 'Dodge',
    name: '闪避',
    icon: 'dodge',
  },
  {
    key: 'Assist',
    name: '支援技',
    icon: 'assist',
  },
  {
    key: 'Special',
    name: '特殊技',
    icon: 'special',
  },
  {
    key: 'Chain',
    name: '连携技',
    icon: 'chain',
  },
];

export class Abyss extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]wiki',
      dsc: 'zzzWiki',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'wiki', 70),
      rule: [
        {
          reg: `${rulePrefix}(.*)天赋(.*)$`,
          fnc: 'skills',
        },
      ],
    });
  }
  async skills() {
    const reg = new RegExp(`${rulePrefix}(.*)天赋(.*)$`);
    const charname = this.e.msg.match(reg)[4];
    if (!charname) return false;
    const levelsChar = this.e.msg.match(reg)[5];
    const levels = !!levelsChar
      ? levelsChar.split('.').map(x => {
          const _x = Number(x.trim());
          if (!_.isNaN(_x)) return _x;
          if (_.isString(x)) return x.toUpperCase().charCodeAt(0) - 64;
          return null;
        })
      : [];
    const [
      BasicLevel = 12,
      DodgeLevel = 12,
      AssistLevel = 12,
      SpecialLevel = 12,
      ChainLevel = 12,
      CoreLevel = 6,
    ] = levels;
    if (
      !isSkillLevelLegal('BasicLevel', BasicLevel) ||
      !isSkillLevelLegal('DodgeLevel', DodgeLevel) ||
      !isSkillLevelLegal('AssistLevel', AssistLevel) ||
      !isSkillLevelLegal('SpecialLevel', SpecialLevel) ||
      !isSkillLevelLegal('ChainLevel', ChainLevel) ||
      !isSkillLevelLegal('CoreLevel', CoreLevel)
    ) {
      await this.reply(`${charname}天赋等级参数不合法`);
      return false;
    }
    const charData = await getHakushCharacterData(charname);
    charData.Skill.getAllSkillData({
      BasicLevel,
      DodgeLevel,
      AssistLevel,
      SpecialLevel,
      ChainLevel,
    });
    charData.Passive.getPassiveData(CoreLevel);
    await charData.get_assets();
    const finalData = {
      charData,
      displays,
    };
    await this.render('skills/index.html', finalData);
  }
}
