import { generateSeed, randomString } from '../../utils/data.js';
import crypto from 'crypto';
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
    const {
      productName = 'J9110',
      deviceType = 'J9110',
      modelName = 'Sony',
      oaid = 'e3ba65d61709d17074a306072a7c3a2ec70e6d374ca6d29eb6b1b965cbb68e23',
      deviceInfo = `Sony\/J9110\/J9110:11\/55.2.A.4.332\/055002A004033203408384484:user\/release-keys`,
      board = 'msmnile',
    } = data;
    const deviceBrand = deviceInfo.split('/')[0];
    let urlMap = {
      zzz: {
        ...(['prod_gf_cn'].includes(this.server)
          ? {
              getFp: {
                url: `${this.hostPublicData}device-fp/api/getFp`,
                body: {
                  seed_id: `${generateSeed(13)}`,
                  device_id: data.deviceId,
                  platform: '2',
                  seed_time: new Date().getTime() + '',
                  ext_fields: `{"cpuType":"arm64-v8a","romCapacity":"512","productName":"${productName}","romRemain":"422","manufacturer":"${deviceBrand}","appMemory":"512","hostname":"dg02-pool03-kvm87","screenSize":"1264x2640","osVersion":"13","aaid":"${randomString(
                    64
                  )}","vendor":"中国联通","accelerometer":"0.44027936x7.256833x6.422336","buildTags":"release-keys","model":"${modelName}","brand":"XiaoMi","oaid":"${oaid}","hardware":"qcom","deviceType":"${deviceType}","devId":"REL","serialNumber":"unknown","buildTime":"1687848011000","buildUser":"root","ramCapacity":"469679","magnetometer":"20.081251x-27.487501x2.1937501","display":"${modelName}_13.1.0.181(CN01)","ramRemain":"215344","deviceInfo":"${deviceInfo}","gyroscope":"0.030226856x0.014647375x0.010652636","vaid":"${randomString(
                    64
                  )}","buildType":"user","sdkVersion":"33","board":"${board}"}`,
                  bbs_device_id: data.deviceId,
                  app_name: 'bbs_cn',
                  device_fp: '38d7fc717dc22',
                },
                noDs: true,
              },
            }
          : {
              getFp: {
                url: `${this.hostPublicData}device-fp/api/getFp`,
                body: {
                  seed_id: `${this.uuid}`,
                  device_id: '35315696b7071100',
                  hoyolab_device_id: `${this.uuid}`,
                  platform: '2',
                  seed_time: new Date().getTime() + '',
                  ext_fields: `{"proxyStatus":1,"isRoot":1,"romCapacity":"512","deviceName":"Xperia 1","productName":"${productName}","romRemain":"483","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"model":"${modelName}","brand":"${deviceBrand}","hardware":"qcom","deviceType":"${deviceType}","oaid":"${oaid}","devId":"REL","serialNumber":"unknown","sdCapacity":107433,"buildTime":"1633631032000","buildUser":"BuildUser","simState":1,"ramRemain":"98076","appUpdateTimeDiff":1716545162858,"deviceInfo":"${deviceInfo}","buildType":"user","sdkVersion":"30","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"app_set_id":"${this.uuid}","chargeStatus":1,"manufacturer":"${deviceBrand}","emulatorStatus":0,"appMemory":"512","adid":"${this.uuid}","osVersion":"11","vendor":"unknown","accelerometer":"-0.9233304x7.574181x6.472585","sdRemain":97931,"buildTags":"release-keys","packageName":"com.mihoyo.hoyolab","networkType":"WiFi","debugStatus":1,"ramCapacity":"107433","magnetometer":"-9.075001x-27.300001x-3.3000002","display":"${modelName}","appInstallTimeDiff":1716489549794,"packageVersion":"","gyroscope":"0.027029991x-0.04459185x0.032222193","batteryStatus":45,"hasKeyboard":0,"board":"${board}"}`,
                  app_name: 'bbs_oversea',
                  device_fp: '38d7f2352506c',
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
