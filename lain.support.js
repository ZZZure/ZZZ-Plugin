
export default class Button {
  constructor() {
    this.plugin = {
      name: 'zzz-plugin-Miao-support-Button',
      dsc: 'zzz-plugin button support (考古版本)',
      priority: -429,
      rule: [
        { reg: '#绝区零更新面板|#绝区零面板更新|#绝区零刷新面板|#绝区零面板刷新$', fnc: 'profile1' },
        { reg:  '#绝区零(.*)面板(.*)$', fnc: 'handleRule' },
      ]
    }
  }

  profile1(e) {

    const roleList = global.zzzRoleList || [];
    const ifNewChar = global.ifNewChar || false;

    const button = [];

    const staticList = [
      { label: `更新面板`, callback: `%更新面板` },
      { label: '绑定UID', callback: `%绑定` },
      { label: '扫码绑定', callback: `#扫码登录` },
      { label: '绑定设备', callback: `%绑定设备帮助` },
    ];

    button.push(...Bot.Button(staticList));

    if (ifNewChar && roleList.length > 0) {
      const charButtonList = roleList.map(role => ({
        label: role, callback: `%${role}面板`
      }));
      button.push(...Bot.Button(charButtonList, 4));
    } else {
    }

    return button.length > 0 ? button : null;
  }

  handleRule(e) {
    let charName = '';
    if (global.zzzCurrentCharName) {
      charName = global.zzzCurrentCharName;
    } else {
      const match = e.match || e.msg.match(/^(%|＃|#)(.+?)面板$/);
      const parsedName = match?.[2]?.trim();
      if (parsedName && !['更新', '刷新', '列表'].includes(parsedName)) {
        charName = parsedName;
      }
    }


    const buttonRows = [
      [{ label: `更新面板`, callback: `%更新面板` }],
      [
        { label: `${charName}攻略`, callback: `%${charName}攻略` },
        { label: `练度统计`, callback: `%练度统计` },
        { label: `${charName}图鉴`, callback: `%${charName}图鉴` },
      ],
      [{ label: `体力`, callback: `%电量` }, { label: `伤害`, callback: `%${charName}伤害` },{ label: `电量`, callback: `%体力` }]
    ];

    return Bot.Button(buttonRows);
  }
}
