import settings from './lib/settings.js';
import lodash from 'lodash';
import { resourcesPath } from './lib/path.js';
import path from 'path';

// 支持锅巴
export function supportGuoba() {
  let allGroup = [];
  Bot.gl.forEach((v, k) => {
    allGroup.push({ label: `${v.group_name}(${k})`, value: k });
  });
  return {
    pluginInfo: {
      name: 'ZZZ-Plugin',
      title: '绝区零插件',
      author: '@别调P',
      authorLink: 'https://github.com/bietiaop',
      link: 'https://github.com/ZZZure/ZZZ-Plugin',
      isV3: true,
      isV2: false,
      description: '提供绝区零相关查询功能',
      icon: 'bi:box-seam',
      iconColor: '#7ed99e',
      iconPath: path.join(resourcesPath, 'common/images/logo.png'),
    },
    // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [
        {
          component: 'Divider',
          label: '通用设置',
        },
        {
          field: 'config.render.scale',
          label: '渲染精度',
          bottomHelpMessage:
            '设置插件的渲染精度，可选值50~200，建议100。设置高精度会提高图片的精细度，但因图片较大可能会影响渲染与发送速度',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: 50,
            max: 200,
            placeholder: '请输入数字',
          },
        },
        {
          field: 'config.query.others',
          label: '允许查询他人信息',
          bottomHelpMessage: '是否允许查询他人信息',
          component: 'Switch',
        },
        {
          component: 'Divider',
          label: '抽卡设置',
        },
        {
          field: 'gacha.interval',
          label: '冷却时间（单位：秒）',
          bottomHelpMessage:
            '设置刷新抽卡记录的冷却时间，单位为秒，取值范围为0～1000',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: 0,
            max: 1000,
            placeholder: '请输入数字',
          },
        },
        {
          component: 'Divider',
          label: '面板设置',
        },
        {
          field: 'panel.interval',
          label: '冷却时间（单位：秒）',
          bottomHelpMessage:
            '设置刷新面板的冷却时间，单位为秒，取值范围为0～1000',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: 0,
            max: 1000,
            placeholder: '请输入数字',
          },
        },
        {
          component: 'Divider',
          label: '优先级设置（-1000～1000）',
        },
        {
          field: 'priority.card',
          label: '卡片查询',
          bottomHelpMessage: '设置玩家信息卡片查询指令优先级',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: -1000,
            max: 1000,
            placeholder: '请输入数字',
          },
        },
        {
          field: 'priority.abyss',
          label: '深渊查询',
          bottomHelpMessage: '设置深渊查询指令优先级',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: -1000,
            max: 1000,
            placeholder: '请输入数字',
          },
        },
        {
          field: 'priority.gachalog',
          label: '抽卡记录查询',
          bottomHelpMessage: '设置抽卡记录查询指令优先级',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: -1000,
            max: 1000,
            placeholder: '请输入数字',
          },
        },
        {
          field: 'priority.guide',
          label: '攻略查询',
          bottomHelpMessage: '设置攻略查询指令优先级',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: -1000,
            max: 1000,
            placeholder: '请输入数字',
          },
        },
        {
          field: 'priority.help',
          label: '帮助查询',
          bottomHelpMessage: '设置帮助指令优先级',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: -1000,
            max: 1000,
            placeholder: '请输入数字',
          },
        },
        {
          field: 'priority.manage',
          label: '管理',
          bottomHelpMessage: '设置管理指令优先级',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: -1000,
            max: 1000,
            placeholder: '请输入数字',
          },
        },
        {
          field: 'priority.note',
          label: '体力查询',
          bottomHelpMessage: '设置体力查询指令优先级',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: -1000,
            max: 1000,
            placeholder: '请输入数字',
          },
        },
        {
          field: 'priority.panel',
          label: '面板查询',
          bottomHelpMessage: '设置面板查询指令优先级',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: -1000,
            max: 1000,
            placeholder: '请输入数字',
          },
        },
        {
          field: 'priority.update',
          label: '更新插件',
          bottomHelpMessage: '设置更新插件指令优先级',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: -1000,
            max: 1000,
            placeholder: '请输入数字',
          },
        },
      ],
      getConfigData() {
        return settings.merge();
      },
      // 设置配置的方法（前端点确定后调用的方法）
      setConfigData(data, { Result }) {
        let config = {};
        for (let [keyPath, value] of Object.entries(data)) {
          lodash.set(config, keyPath, value);
        }
        config = lodash.merge({}, settings.merge, config);
        settings.analysis(config);
        return Result.ok({}, '保存成功~');
      },
    },
  };
}
