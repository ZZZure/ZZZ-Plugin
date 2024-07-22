import { ZZZPlugin } from '../lib/plugin.js';
import { rulePrefix } from '../lib/common.js';
import render from '../lib/render.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
/**
 * @typedef {Object} HelpItem
 * @property {string} title
 * @property {string} desc
 * @property {boolean} needCK
 * @property {boolean} needSK
 * @property {string[]} commands
 */
/**
 * @typedef {Object} HelpData
 * @property {string} title
 * @property {'fire'|'ice'|'physdmg'|'thunder'|'dungeon'} icon
 * @property {HelpItem[]} items
 */

/**
 * @type {HelpData[]}
 * @description 帮助数据
 */
const helpData = [
  {
    title: '信息查询',
    icon: 'fire',
    items: [
      {
        title: '基本信息',
        desc: '查看玩家的角色和邦布列表',
        needCK: true,
        needSK: false,
        commands: ['card', '卡片', '个人信息'],
      },
      {
        title: '便签',
        desc: '查看便签',
        needCK: true,
        needSK: false,
        commands: ['note', '便签', '便笺', '体力', '每日'],
      },
    ],
  },
  {
    title: '抽卡记录',
    icon: 'ice',
    items: [
      {
        title: '刷新抽卡记录',
        desc: '刷新抽卡记录',
        needCK: true,
        needSK: true,
        commands: ['刷新/更新抽卡链接', '刷新/更新抽卡记录'],
      },
      {
        title: '获取抽卡记录链接',
        desc: '获取抽卡记录链接',
        needCK: true,
        needSK: true,
        commands: ['获取抽卡链接'],
      },
      {
        title: '查看抽卡记录',
        desc: '查看抽卡记录',
        needCK: false,
        needSK: false,
        commands: ['抽卡分析', '抽卡记录'],
      },
    ],
  },
  {
    title: '角色面板',
    icon: 'thunder',
    items: [
      {
        title: '刷新角色面板',
        desc: '刷新角色面板',
        needCK: true,
        needSK: false,
        commands: ['刷新面板', '更新面板', '面板刷新', '面板更新'],
      },
      {
        title: '查看角色面板列表',
        desc: '查看已保存的角色面板列表',
        needCK: false,
        needSK: false,
        commands: ['面板', '面板列表'],
      },
      {
        title: '查看角色面板',
        desc: '查看角色面板',
        needCK: false,
        needSK: false,
        commands: ['角色名+面板'],
      },
    ],
  },
  {
    title: '式舆防卫战',
    icon: 'dungeon',
    items: [
      {
        title: '查看式舆防卫战',
        desc: '查看式舆防卫战(深渊)信息',
        needCK: false,
        needSK: false,
        commands: ['式舆防卫战', '防卫战', '式舆', '深渊', '防卫'],
      },
    ],
  },
  {
    title: '角色攻略',
    icon: 'physdmg',
    items: [
      {
        title: '查看角色攻略',
        desc: '查看角色攻略',
        needCK: false,
        needSK: false,
        commands: ['角色名+攻略[+来源]'],
      },
    ],
  },
];
export class Help extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Help',
      dsc: 'zzzhelp',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'help', 70),
      rule: [
        {
          reg: `${rulePrefix}(帮助|help)$`,
          fnc: 'help',
        },
      ],
    });
  }
  async help() {
    if (this.e?.isMaster) {
      helpData.push({
        title: '管理功能',
        icon: 'dungeon',
        items: [
          {
            title: '更新',
            desc: '更新绝区零插件',
            needCK: false,
            needSK: false,
            commands: ['[插件][强制]更新'],
          },
          {
            title: '下载资源',
            desc: '提前下载插件所需资源，查询时无需再次下载',
            needCK: false,
            needSK: false,
            commands: ['下载全部/所有资源'],
          },
          {
            title: '删除资源',
            desc: '删除已经下载的资源，查询时需要再次下载（用于删除错误下载缓存）',
            needCK: false,
            needSK: false,
            commands: ['删除全部/所有资源'],
          },
        ],
      });
    }
    await render(this.e, 'help/index.html', {
      helpData,
    });
  }
}
