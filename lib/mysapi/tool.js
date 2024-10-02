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
                  device_fp: '38d7faa51d2b6',
                  device_id: '35315696b7071100',
                  ext_fields: `{"proxyStatus":1,"isRoot":1,"romCapacity":"512","deviceName":"${modelName}","productName":"${productName}","romRemain":"456","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"aaid":"${this.uuid}","model":"${modelName}","brand":"${deviceBrand}","hardware":"qcom","deviceType":"${deviceType}","devId":"REL","serialNumber":"unknown","sdCapacity":107433,"buildTime":"1633631032000","buildUser":"BuildUser","simState":1,"ramRemain":"96757","appUpdateTimeDiff":1722171241616,"deviceInfo":"${deviceInfo}","vaid":"${this.uuid}","buildType":"user","sdkVersion":"30","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"chargeStatus":1,"manufacturer":"${deviceBrand}","emulatorStatus":0,"appMemory":"512","osVersion":"${osVersion}","vendor":"unknown","accelerometer":"-0.084346995x8.73799x4.6301117","sdRemain":96600,"buildTags":"release-keys","packageName":"com.mihoyo.hyperion","networkType":"WiFi","oaid":"${oaid}","debugStatus":1,"ramCapacity":"107433","magnetometer":"-13.9125x-17.8875x-5.4750004","display":"${deviceDisplay}","appInstallTimeDiff":1717065300325,"packageVersion":"2.20.2","gyroscope":"0.017714571x-4.5813544E-4x0.0015271181","batteryStatus":77,"hasKeyboard":0,"board":"${board}"}`,
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
                  device_fp: '38d7f2352506c',
                  device_id: '35315696b7071100',
                  ext_fields: `{"proxyStatus":1,"isRoot":1,"romCapacity":"512","deviceName":"${modelName}","productName":"${productName}","romRemain":"474","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"model":"${modelName}","brand":"${deviceBrand}","hardware":"qcom","deviceType":"${deviceType}","devId":"REL","serialNumber":"unknown","sdCapacity":107433,"buildTime":"1633631032000","buildUser":"BuildUser","simState":1,"ramRemain":"96715","appUpdateTimeDiff":1722171191009,"deviceInfo":"${deviceInfo}","buildType":"user","sdkVersion":"30","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"app_set_id":"${this.uuid}","chargeStatus":1,"manufacturer":"${deviceBrand}","emulatorStatus":0,"appMemory":"512","adid":"${this.uuid}","osVersion":"${osVersion}","vendor":"unknown","accelerometer":"-0.22372891x-1.5332011x9.802497","sdRemain":96571,"buildTags":"release-keys","packageName":"com.mihoyo.hoyolab","networkType":"WiFi","debugStatus":1,"ramCapacity":"107433","magnetometer":"3.73125x-10.668751x3.7687502","display":"${deviceDisplay}","appInstallTimeDiff":1716489549794,"packageVersion":"2.20.2","gyroscope":"0.18386503x-0.006413896x-0.008857286","batteryStatus":77,"hasKeyboard":0,"board":"${board}"}`,
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
