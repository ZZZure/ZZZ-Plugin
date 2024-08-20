import { ZZZPlugin } from '../lib/plugin.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import manage from './manage/index.js';
import { rulePrefix } from '../lib/common.js';

export class Panel extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Manage',
      dsc: 'zzzmanage',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'manage', 70),
      rule: [
        {
          reg: `${rulePrefix}下载(全部|所有)资源$`,
          fnc: 'downloadAll',
        },
        {
          reg: `${rulePrefix}删除(全部|所有)资源$`,
          fnc: 'deleteAll',
        },
        {
          reg: `${rulePrefix}设置默认攻略(\\d+|all)$`,
          fnc: 'setDefaultGuide',
        },
        {
          reg: `${rulePrefix}设置所有攻略显示个数(\\d+)$`,
          fnc: 'setMaxForwardGuide',
        },
        {
          reg: `${rulePrefix}设置渲染精度(\\d+)$`,
          fnc: 'setRenderPrecision',
        },
        {
          reg: `${rulePrefix}刷新抽卡间隔(\\d+)$`,
          fnc: 'setRefreshGachaInterval',
        },
        {
          reg: `${rulePrefix}刷新面板间隔(\\d+)$`,
          fnc: 'setRefreshPanelInterval',
        },
        {
          reg: `${rulePrefix}添加(\\S+)别名(\\S+)$`,
          fnc: 'addAlias',
        },
        {
          reg: `${rulePrefix}删除别名(\\S+)$`,
          fnc: 'deleteAlias',
        },
        {
          reg: `${rulePrefix}(上传|添加)(\\S+)(角色|面板)图$`,
          fnc: 'uploadCharacterImg',
        },
        {
          reg: `${rulePrefix}(获取|查看)(\\S+)(角色|面板)图(\\d+)?$`,
          fnc: 'getCharacterImages',
        },
        {
          reg: `${rulePrefix}删除(\\S+)(角色|面板)图(.+)$`,
          fnc: 'deleteCharacterImg',
        },
        {
          reg: `${rulePrefix}(插件)?版本$`,
          fnc: 'getChangeLog',
        },
        {
          reg: `^${rulePrefix}(插件)?更新日志$`,
          fnc: 'getCommitLog',
        },
        {
          reg: `^${rulePrefix}(插件)?检查更新$`,
          fnc: 'hasUpdate',
        },
        {
          reg: `${rulePrefix}设置默认设备`,
          fnc: 'setDefaultDevice',
        },
        {
          reg: `${rulePrefix}(开启|关闭)更新推送$`,
          fnc: 'enableAutoUpdatePush',
        },
        {
          reg: `${rulePrefix}设置检查更新时间(.+)$`,
          fnc: 'setCheckUpdateCron',
        },
      ],
    });

    this.downloadAll = manage.assets.downloadAll;
    this.deleteAll = manage.assets.deleteAll;
    this.setDefaultGuide = manage.guides.setDefaultGuide;
    this.setMaxForwardGuide = manage.guides.setMaxForwardGuide;
    this.setRenderPrecision = manage.config.setRenderPrecision;
    this.setRefreshGachaInterval = manage.config.setRefreshGachaInterval;
    this.setRefreshPanelInterval = manage.config.setRefreshPanelInterval;
    this.addAlias = manage.alias.addAlias;
    this.deleteAlias = manage.alias.deleteAlias;
    this.uploadCharacterImg = manage.panel.uploadCharacterImg;
    this.getCharacterImages = manage.panel.getCharacterImages;
    this.deleteCharacterImg = manage.panel.deleteCharacterImg;
    this.getChangeLog = manage.version.getChangeLog;
    this.getCommitLog = manage.version.getCommitLog;
    this.hasUpdate = manage.version.hasUpdate;
    this.enableAutoUpdatePush = manage.version.enableAutoUpdatePush;
    this.setCheckUpdateCron = manage.version.setCheckUpdateCron;
    this.setDefaultDevice = manage.device.setDefaultDevice;
    this.toSetDefaultDevice = manage.device.toSetDefaultDevice;
  }
}
