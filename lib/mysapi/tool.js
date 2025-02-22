import { generateSeed } from '../../utils/data.js';
import settings from '../settings.js';
import crypto from 'crypto';
import _ from 'lodash';
/**
 * derived from miao-yunzai
 */
export default class ZZZApiTool {
  /**
   *
   * @param {uid} uid
   * @param {server} server
   */
  constructor(uid, server) {
    this.uid = uid;
    this.isZZZ = true;
    this.server = server;
    this.game = 'zzz';
    this.uuid = crypto.randomUUID();
    if (['prod_gf_cn'].includes(this.server)) {
      this.gameBiz = 'nap_cn';
      this.host = 'https://api-takumi.mihoyo.com/';
      this.hostRecord = 'https://api-takumi-record.mihoyo.com/';
      this.hostPublicData = 'https://public-data-api.mihoyo.com/';
      this.hostBbs = 'https://bbs-api.miyoushe.com/';
    } else {
      this.gameBiz = 'nap_global';
      this.host = 'https://sg-public-api.hoyolab.com/';
      this.hostRecord = 'https://sg-act-nap-api.hoyolab.com/';
      this.hostPublicData = 'https://sg-public-data-api.hoyoverse.com/';
    }
    this.zzzUrlMap = {
      zzzUser: {
        url: `${this.host}binding/api/getUserGameRolesByCookie`,
        query: `game_biz=${this.gameBiz}&region=${this.server}&game_uid=${this.uid}`,
      },
      zzzNote: {
        url: `${this.hostRecord}event/game_record_zzz/api/zzz/note`,
        query: `role_id=${this.uid}&server=${this.server}`,
      },
      zzzIndex: {
        url: `${this.hostRecord}event/game_record_zzz/api/zzz/index`,
        query: `lang=zh-cn&role_id=${this.uid}&server=${this.server}`,
      },
      zzzAvatarList: {
        url: `${this.hostRecord}event/game_record_zzz/api/zzz/avatar/basic`,
        query: `lang=zh-cn&role_id=${this.uid}&server=${this.server}`,
      },
      zzzAvatarInfo: {
        url: `${this.hostRecord}event/game_record_zzz/api/zzz/avatar/info`,
        query: `lang=zh-cn&role_id=${this.uid}&server=${this.server}&need_wiki=false`,
      },
      zzzBuddyList: {
        url: `${this.hostRecord}event/game_record_zzz/api/zzz/buddy/info`,
        query: `lang=zh-cn&role_id=${this.uid}&server=${this.server}`,
      },
      zzzChallenge: {
        url: `${this.hostRecord}event/game_record_zzz/api/zzz/challenge`,
        query: `lang=zh-cn&role_id=${this.uid}&server=${this.server}&schedule_type=1`,
      },
      zzzChallengePeriod: {
        url: `${this.hostRecord}event/game_record_zzz/api/zzz/challenge`,
        query: `lang=zh-cn&role_id=${this.uid}&server=${this.server}&schedule_type=2`,
      },
      zzzDeadly: {
        url: `${this.hostRecord}event/game_record_zzz/api/zzz/mem_detail`,
        query: `lang=zh-cn&uid=${this.uid}&region=${this.server}&schedule_type=1`,
      },
      zzzDeadlyPeriod: {
        url: `${this.hostRecord}event/game_record_zzz/api/zzz/mem_detail`,
        query: `lang=zh-cn&uid=${this.uid}&region=${this.server}&schedule_type=2`,
      },
      zzzMonthly: {
        url: `${this.host}event/nap_ledger/month_info`,
        query: `uid=${this.uid}&region=${this.server}`,
      },
      zzzAuthKey: {
        url: `${this.host}binding/api/genAuthKey`,
        body: {
          auth_appid: 'webview_gacha',
          game_biz: this.gameBiz,
          game_uid: this.uid * 1,
          region: this.server,
        },
        dsSalt: 'web',
      },
    };
  }

  getUrlMap = (data = {}) => {
    const deviceCfg = settings.getConfig('device');
    const defDeviceCfg = settings.getdefSet('device');
    const {
      productName = _.get(deviceCfg, 'productName') ??
        _.get(defDeviceCfg, 'productName'),
      deviceType = _.get(deviceCfg, 'productType') ??
        _.get(defDeviceCfg, 'productType'),
      modelName = _.get(deviceCfg, 'modelName') ??
        _.get(defDeviceCfg, 'modelName'),
      oaid = this.uuid,
      osVersion = _.get(deviceCfg, 'osVersion') ??
        _.get(defDeviceCfg, 'osVersion'),
      deviceInfo = _.get(deviceCfg, 'deviceInfo') ??
        _.get(defDeviceCfg, 'deviceInfo'),
      board = _.get(deviceCfg, 'board') ?? _.get(defDeviceCfg, 'board'),
    } = data;
    const deviceBrand = deviceInfo.split('/')[0];
    const deviceDisplay = deviceInfo.split('/')[3];
    let urlMap = {
      zzz: {
        ...(['prod_gf_cn'].includes(this.server)
          ? {
              getFp: {
                url: `${this.hostPublicData}device-fp/api/getFp`,
                body: {
                  app_name: 'bbs_cn',
                  bbs_device_id: `${this.uuid}`,
                  device_fp: '38d802d62e7fb',
                  device_id: 'd927172613ac7594',
                  ext_fields: `{"proxyStatus":1,"isRoot":0,"romCapacity":"512","deviceName":"${modelName}","productName":"${productName}","romRemain":"489","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"aaid":"${this.uuid}","model":"${modelName}","brand":"${deviceBrand}","hardware":"qcom","deviceType":"${deviceType}","devId":"REL","serialNumber":"unknown","sdCapacity":228442,"buildTime":"1653304778000","buildUser":"BuildUser","simState":1,"ramRemain":"221267","appUpdateTimeDiff":1736258293874,"deviceInfo":"${deviceInfo}","vaid":"${this.uuid}","buildType":"user","sdkVersion":"31","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"chargeStatus":1,"manufacturer":"${deviceBrand}","emulatorStatus":0,"appMemory":"512","osVersion":"${osVersion}","vendor":"unknown","accelerometer":"0.24616162x0.44117668x9.934102","sdRemain":221125,"buildTags":"release-keys","packageName":"com.mihoyo.hyperion","networkType":"WiFi","oaid":"${oaid}","debugStatus":1,"ramCapacity":"228442","magnetometer":"-0.93750006x26.456251x-42.693752","display":"${deviceDisplay}","appInstallTimeDiff":1736258293874,"packageVersion":"2.33.0","gyroscope":"4.5813544E-4x-0.0x-7.635591E-4","batteryStatus":66,"hasKeyboard":0,"board":"${board}"}`,
                  platform: '2',
                  seed_id: `${this.uuid}`,
                  seed_time: new Date().getTime() + '',
                },
                noDs: true,
              },
              deviceLogin: {
                url: `${this.hostBbs}apihub/api/deviceLogin`,
                body: {
                  app_version: '2.73.1',
                  device_id: data.deviceId,
                  device_name: `${deviceBrand}${modelName}`,
                  os_version: '33',
                  platform: 'Android',
                  registration_id: generateSeed(19),
                },
              },
              saveDevice: {
                url: `${this.hostBbs}apihub/api/saveDevice`,
                body: {
                  app_version: '2.73.1',
                  device_id: data.deviceId,
                  device_name: `${deviceBrand}${modelName}`,
                  os_version: '33',
                  platform: 'Android',
                  registration_id: generateSeed(19),
                },
              },
            }
          : {
              getFp: {
                url: `${this.hostPublicData}device-fp/api/getFp`,
                body: {
                  app_name: 'bbs_oversea',
                  device_fp: '38d7f469c1319',
                  device_id: 'd927172613ac7594',
                  ext_fields: `{"proxyStatus":1,"isRoot":0,"romCapacity":"512","deviceName":"${modelName}","productName":"${productName}","romRemain":"474","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"model":"${modelName}","brand":"${deviceBrand}","hardware":"qcom","deviceType":"${deviceType}","devId":"REL","serialNumber":"unknown","sdCapacity":228442,"buildTime":"1653304778000","buildUser":"BuildUser","simState":1,"ramRemain":"221344","appUpdateTimeDiff":1736258244054,"deviceInfo":"${deviceInfo}","buildType":"user","sdkVersion":"31","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"app_set_id":"${this.uuid}","chargeStatus":1,"manufacturer":"${deviceBrand}","emulatorStatus":0,"appMemory":"512","adid":"${this.uuid}","osVersion":"${osVersion}","vendor":"unknown","accelerometer":"-1.6262221x3.1136606x9.471091","sdRemain":221216,"buildTags":"release-keys","packageName":"com.mihoyo.hoyolab","networkType":"WiFi","debugStatus":1,"ramCapacity":"228442","magnetometer":"-17.1x-6.6937504x-25.85625","display":"${deviceDisplay}","appInstallTimeDiff":1736258244054,"packageVersion":"2.33.0","gyroscope":"-0.18203248x-0.3193204x0.060321167","batteryStatus":66,"hasKeyboard":0,"board":"${board}"}`,
                  hoyolab_device_id: `${this.uuid}`,
                  platform: '2',
                  seed_id: `${this.uuid}`,
                  seed_time: new Date().getTime() + '',
                },
                noDs: true,
              },
            }),
        ...this.zzzUrlMap,
      },
    };
    return urlMap[this.game];
  };
}
