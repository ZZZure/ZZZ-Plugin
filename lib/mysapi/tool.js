import { generateSeed } from '../../utils/data.js';
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
      this.game_biz = 'nap_cn'
      this.host = 'https://api-takumi.mihoyo.com/';
      this.hostRecord = 'https://api-takumi-record.mihoyo.com/';
      this.hostPublicData = 'https://public-data-api.mihoyo.com/';
    } else {
      this.game_biz = 'nap_global'
      this.host = 'https://sg-public-api.hoyolab.com/';
      this.hostRecord = 'https://sg-act-nap-api.hoyolab.com/';
      this.hostPublicData = 'https://sg-public-data-api.hoyoverse.com/';
    }
    this.zzzUrlMap = {
      zzzUser: {
        url: `${this.host}binding/api/getUserGameRolesByCookie`,
        query: `game_biz=${this.game_biz}&region=${this.server}&game_uid=${this.uid}`,
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
      zzzAuthKey: {
        url: `${this.host}binding/api/genAuthKey`,
        body: {
          auth_appid: 'webview_gacha',
          game_biz: this.game_biz,
          game_uid: this.uid * 1,
          region: this.server,
        },
        dsSalt: 'web',
      },
    };
  }

  getUrlMap = (data = {}) => {
    let urlMap = {
      zzz: {
        ...(['prod_gf_cn'].includes(this.server)
          ? {
              getFp: {
                url: `${this.hostPublicData}device-fp/api/getFp`,
                body: {
                  seed_id: `${generateSeed(16)}`,
                  device_id: data.deviceId,
                  platform: '1',
                  seed_time: new Date().getTime() + '',
                  ext_fields: `{"ramCapacity":"3746","hasVpn":"0","proxyStatus":"0","screenBrightness":"0.550","packageName":"com.miHoYo.mhybbs","romRemain":"100513","deviceName":"iPhone","isJailBreak":"0","magnetometer":"-160.495300x-206.488358x58.534348","buildTime":"1706406805675","ramRemain":"97","accelerometer":"-0.419876x-0.748367x-0.508057","cpuCores":"6","cpuType":"CPU_TYPE_ARM64","packageVersion":"2.20.1","gyroscope":"0.133974x-0.051780x-0.062961","batteryStatus":"45","appUpdateTimeDiff":"1707130080397","appMemory":"57","screenSize":"414×896","vendor":"--","model":"iPhone12,5","IDFV":"${data.deviceId.toUpperCase()}","romCapacity":"488153","isPushEnabled":"1","appInstallTimeDiff":"1696756955347","osVersion":"17.2.1","chargeStatus":"1","isSimInserted":"1","networkType":"WIFI"}`,
                  app_name: 'account_cn',
                  device_fp: '38d7f0fa36179',
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
                  ext_fields: `{"proxyStatus":1,"isRoot":1,"romCapacity":"512","deviceName":"Xperia 1","productName":"J9110","romRemain":"483","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"model":"J9110","brand":"Sony","hardware":"qcom","deviceType":"J9110","devId":"REL","serialNumber":"unknown","sdCapacity":107433,"buildTime":"1633631032000","buildUser":"BuildUser","simState":1,"ramRemain":"98076","appUpdateTimeDiff":1716545162858,"deviceInfo":"Sony\/J9110\/J9110:11\/55.2.A.4.332\/055002A004033203408384484:user\/release-keys","buildType":"user","sdkVersion":"30","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"app_set_id":"${this.uuid}","chargeStatus":1,"manufacturer":"Sony","emulatorStatus":0,"appMemory":"512","adid":"${this.uuid}","osVersion":"11","vendor":"unknown","accelerometer":"-0.9233304x7.574181x6.472585","sdRemain":97931,"buildTags":"release-keys","packageName":"com.mihoyo.hoyolab","networkType":"WiFi","debugStatus":1,"ramCapacity":"107433","magnetometer":"-9.075001x-27.300001x-3.3000002","display":"55.2.A.4.332","appInstallTimeDiff":1716489549794,"packageVersion":"","gyroscope":"0.027029991x-0.04459185x0.032222193","batteryStatus":45,"hasKeyboard":0,"board":"msmnile"}`,
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