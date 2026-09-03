/// <reference path="./src/@types/yunzai/index.d.ts"/>
import { resourcesPath } from './dist/lib/path.js'
import settings from './dist/lib/settings.js'
import lodash from 'lodash'
import path from 'path'

// 支持锅巴
export function supportGuoba() {
  let allGroup = []
  Bot.gl.forEach((v, k) => {
    allGroup.push({ label: `${v.group_name}(${k})`, value: k })
  })
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
          component: 'SOFT_GROUP_BEGIN',
          label: '通用设置',
        },
        {
          field: 'config.render.scale',
          label: '渲染精度',
          bottomHelpMessage:
            '设置插件的渲染精度，可选值50~200，建议100。设置高精度会提高图片的精细度，但因图片较大可能会影响渲染与发送速度，官方QQBot建议不要超过85，否则可能会因为文件过大发送失败',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: 50,
            max: 200,
            placeholder: '请输入数字',
          },
        },
        {
          field: 'config.recallMsg',
          label: '消息撤回时间',
          bottomHelpMessage:
            '设置提示类消息（权限提示、参数错误、设置成功等）的自动撤回时间，单位为秒，可选值0~120，0为不自动撤回',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: 0,
            max: 120,
            placeholder: '请输入数字，0为不撤回',
          },
        },
        {
          field: 'config.url',
          label: '绑定设备下载url',
          bottomHelpMessage: '设置自定义的绑定绑定设备下载url',
          component: 'Input',
          componentProps: {
            placeholder: '请输入绑定设备apk下载url',
          },
        },
        {
          field: 'config.enkaApi',
          label: '自定义enkaApi地址',
          bottomHelpMessage: '设置自定义的enkaApi地址',
          component: 'Input',
          componentProps: {
            placeholder: '请输入enkaApi地址',
          },
        },
        {
          field: 'config.query.others',
          label: '查询他人信息',
          bottomHelpMessage: '是否允许查询他人信息',
          component: 'Switch',
        },
        {
          field: 'config.update.autoCheck',
          label: '更新推送',
          bottomHelpMessage: '是否开启自动检查更新推送（仅检查，不更新）',
          component: 'Switch',
        },
        {
          field: 'config.update.cron',
          label: '推送时间',
          bottomHelpMessage: '设置自动检查更新推送的时间，cron表达式',
          component: 'EasyCron',
          componentProps: {
            placeholder: '请输入或选择cron表达式',
          },
        },
        {
          field: 'config.mysCode',
          label: '过🐎',
          bottomHelpMessage:
            '设置米游社接口返回的错误码，遇到这些错误码会触发过🐎',
          component: 'Select',
          componentProps: {
            mode: 'multiple',
            options: [
              { label: '1034', value: 1034 },
              { label: '10035', value: 10035 },
              { label: '10102', value: 10102 },
              { label: '10041', value: 10041 },
              { label: '5003', value: 5003 },
            ],
          },
        },
        {
          component: 'SOFT_GROUP_BEGIN',
          label: '抽卡分析设置',
        },
        {
          field: 'gacha.interval',
          label: '冷却时间',
          bottomHelpMessage:
            '设置刷新抽卡记录的冷却时间，单位为秒，取值范围为0～1000',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: 0,
            max: 1000,
            placeholder: '请输入数字',
            addonAfter: "s",
          },
        },
        {
          field: 'gacha.allow_group',
          label: '群聊链接刷新',
          bottomHelpMessage: '是否允许群聊通过发送链接刷新抽卡记录',
          component: 'Switch',
        },
        {
          field: 'gacha.white_list',
          label: '白名单群聊',
          bottomHelpMessage: '在关闭群聊链接刷新时，允许通过链接刷新的群聊',
          component: 'Select',
          componentProps: {
            mode: 'multiple',
            options: allGroup,
          },
        },
        {
          field: 'gacha.black_list',
          label: '黑名单群聊',
          bottomHelpMessage: '在开启群聊链接刷新时，禁止通过链接刷新的群聊',
          component: 'Select',
          componentProps: {
            mode: 'multiple',
            options: allGroup,
          },
        },
        // {
        //   component: 'SOFT_GROUP_BEGIN',
        //   label: '深渊设置',
        // },
        // {
        //   field: 'abyss.interval',
        //   label: '冷却时间',
        //   bottomHelpMessage:
        //     '设置刷新深渊信息的冷却时间，单位为秒，取值范围为0～1000',
        //   component: 'InputNumber',
        //   required: true,
        //   componentProps: {
        //     min: 0,
        //     max: 1000,
        //     placeholder: '请输入数字',
        //     addonAfter: "s",
        //   },
        // },
        {
          component: 'SOFT_GROUP_BEGIN',
          label: '面板设置',
        },
        {
          field: 'panel.interval',
          label: '冷却时间',
          bottomHelpMessage:
            '设置刷新面板的冷却时间，单位为秒，取值范围为0～1000',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: 0,
            max: 1000,
            placeholder: '请输入数字',
            addonAfter: "s",
          },
        },
        {
          field: 'panel.roleInterval',
          label: '冷却时间',
          bottomHelpMessage:
            '设置刷新角色的冷却时间，单位为毫秒，取值范围为100～10000',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: 100,
            max: 10000,
            placeholder: '请输入数字',
            addonAfter: "ms",
          },
        },
        {
          component: 'SOFT_GROUP_BEGIN',
          label: '提醒功能设置',
        },
        {
          field: 'remind.enable',
          label: '开启提醒功能',
          bottomHelpMessage: '是否启用式舆防卫战/危局强袭战的定时提醒功能',
          component: 'Switch',
        },
        {
          field: 'remind.globalRemindTime',
          label: '全局提醒时间',
          bottomHelpMessage: '设置全局默认提醒时间，格式如"每日20时"或"每周一20时40分"',
          component: 'Input',
          componentProps: {
            placeholder: '每日20时',
          },
        },
        {
          field: 'remind.abyssCheckLevel',
          label: '默认式舆S评级阈值',
          bottomHelpMessage: '新用户订阅时，S评级数量低于此值会收到提醒',
          component: 'InputNumber',
          componentProps: {
            min: 1,
            max: 7,
            placeholder: '请输入数字(1-7)',
          },
        },
        {
          field: 'remind.deadlyStars',
          label: '默认危局星星阈值',
          bottomHelpMessage: '新用户订阅时，星星总数低于此值会收到提醒',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            placeholder: '请输入数字',
          },
        },
        {
          component: 'SOFT_GROUP_BEGIN',
          label: '攻略设置',
        },
        {
          field: 'guide.default_guide',
          label: '默认攻略',
          bottomHelpMessage: '设置默认攻略，攻略合集即为多个攻略的合集',
          component: 'Select',
          required: true,
          componentProps: {
            options: [
              {
                value: 0,
                label: '攻略合集',
              },
              {
                value: 1,
                label: '新艾利都快讯',
              },
              {
                value: 2,
                label: '清茶沐沐Kiyotya',
              },
              {
                value: 3,
                label: '小橙子阿',
              },
              {
                value: 4,
                label: '猫冬',
              },
              {
                value: 5,
                label: '月光中心',
              },
              {
                value: 6,
                label: '苦雪的清心花凉糕Suki',
              },
              {
                value: 7,
                label: 'HoYo青枫',
              },
            ],
          },
        },
        {
          field: 'guide.max_forward_guides',
          label: '合集最大数量',
          bottomHelpMessage: '当查询攻略合集时，返回攻略的最大数量',
          component: 'InputNumber',
          required: true,
          componentProps: {
            min: 1,
            max: 7,
            placeholder: '请输入数字1～7',
          },
        },
        {
          label: '其他设置',
          component: 'SOFT_GROUP_BEGIN'
        },
        {
          component: 'Divider',
          label:
            '默认设备信息设置（通过"%设置默认设备"进行设置，如果不知道这是什么请勿修改）',
        },
        {
          field: 'device.productName',
          label: 'productName(deviceProduct)',
          bottomHelpMessage: '设置默认设备productName字段',
          component: 'Input',
          componentProps: {
            placeholder: '请输入productName',
          },
        },
        {
          field: 'device.productType',
          label: 'productType(deviceName)',
          bottomHelpMessage: '设置默认设备productType字段',
          component: 'Input',
          componentProps: {
            placeholder: '请输入productType',
          },
        },
        {
          field: 'device.modelName',
          label: 'modelName(deviceModel)',
          bottomHelpMessage: '设置默认设备modelName字段',
          component: 'Input',
          componentProps: {
            placeholder: '请输入modelName',
          },
        },
        {
          field: 'device.osVersion',
          label: 'osVersion(androidVersion)',
          bottomHelpMessage: '设置默认设备osVersion字段',
          component: 'Input',
          componentProps: {
            placeholder: '请输入osVersion',
          },
        },
        {
          field: 'device.deviceInfo',
          label: 'deviceInfo(deviceFingerprint)',
          bottomHelpMessage: '设置默认设备deviceInfo字段',
          component: 'Input',
          componentProps: {
            placeholder: '请输入deviceInfo',
          },
        },
        {
          field: 'device.board',
          label: 'board(deviceBoard)',
          bottomHelpMessage: '设置默认设备board字段',
          component: 'Input',
          componentProps: {
            placeholder: '请输入board',
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
          field: 'priority.remind',
          label: '挑战提醒',
          bottomHelpMessage: '设置挑战提醒指令优先级',
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
        return settings.merge()
      },
      // 设置配置的方法（前端点确定后调用的方法）
      setConfigData(data, { Result }) {
        let config = {}
        for (let [keyPath, value] of Object.entries(data)) {
          lodash.set(config, keyPath, value)
        }
        config = lodash.merge({}, settings.merge, config)
        settings.analysis(config)
        return Result.ok({}, '保存成功~')
      },
    },
  }
}
