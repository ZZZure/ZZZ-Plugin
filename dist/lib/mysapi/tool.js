import { generateSeed } from '../../utils/data.js';
import settings from '../settings.js';
import crypto from 'crypto';
import _ from 'lodash';
export default class ZZZApiTool {
    uid;
    isZZZ;
    server;
    game;
    uuid;
    gameBiz;
    host;
    hostRecord;
    hostPublicData;
    hostBbs = '';
    zzzUrlMap;
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
        }
        else {
            this.gameBiz = 'nap_global';
            this.host = 'https://sg-public-api.hoyolab.com/';
            this.hostRecord = 'https://sg-act-public-api.hoyolab.com/';
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
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/hadal_info_v2`,
                query: `lang=zh-cn&role_id=${this.uid}&server=${this.server}&schedule_type=1`,
            },
            zzzChallengePeriod: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/hadal_info_v2`,
                query: `lang=zh-cn&role_id=${this.uid}&server=${this.server}&schedule_type=2`,
            },
            zzzDeadly: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/hadal_mem_detail_v2`,
                query: `lang=zh-cn&uid=${this.uid}&region=${this.server}&schedule_type=1`,
            },
            zzzDeadlyPeriod: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/hadal_mem_detail_v2`,
                query: `lang=zh-cn&uid=${this.uid}&region=${this.server}&schedule_type=2`,
            },
            zzzHoloBoss: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/holo_boss_detail`,
                query: `lang=zh-cn&uid=${this.uid}&region=${this.server}&schedule_type=1`,
            },
            zzzHoloBossPeriod: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/holo_boss_detail`,
                query: `lang=zh-cn&uid=${this.uid}&region=${this.server}&schedule_type=2`,
            },
            zzzClimbingTower: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/climbing_tower_detail`,
                query: `lang=zh-cn&uid=${this.uid}&region=${this.server}`,
            },
            zzzVoidFrontBattleAbstractInfo: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/void_front_battle_abstract_info`,
                query: `lang=zh-cn&uid=${this.uid}&region=${this.server}`,
            },
            zzzVoidFrontBattle: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/void_front_battle_period_detail`,
                query: `lang=zh-cn&uid=${this.uid}&region=${this.server}&schedule_type=1`,
            },
            zzzVoidFrontBattlePeriod: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/void_front_battle_period_detail`,
                query: `lang=zh-cn&uid=${this.uid}&region=${this.server}&schedule_type=2`,
            },
            zzzHollowZero: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/abyss_abstract`,
                query: `lang=zh-cn&role_id=${this.uid}&server=${this.server}`,
            },
            zzzHollowZeroChallenge: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/abyss_detail`,
                query: `lang=zh-cn&role_id=${this.uid}&server=${this.server}&type=3`,
            },
            zzzHollowZeroS2: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/abysss2_abstract`,
                query: `lang=zh-cn&uid=${this.uid}&region=${this.server}`,
            },
            zzzZenkov: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/zenkov_abstract_info`,
                query: `lang=zh-cn&uid=${this.uid}&region=${this.server}`,
            },
            zzzZenkovDetail: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/zenkov_detail`,
                query: `lang=zh-cn&uid=${this.uid}&region=${this.server}`,
            },
            zzzMonthly: {
                url: `${this.host}event/nap_ledger/month_info`,
                query: `uid=${this.uid}&region=${this.server}`,
            },
            zzzExplorationDetail: {
                url: `${this.hostRecord}event/game_record_zzz/api/zzz/exploration_detail`,
                query: `uid=${this.uid}&region=${this.server}`,
            },
        };
    }
    getUrlMap = (data = {}) => {
        const deviceCfg = settings.getConfig('device');
        const defDeviceCfg = settings.getdefSet('device');
        const { productName = _.get(deviceCfg, 'productName') ||
            _.get(defDeviceCfg, 'productName'), deviceType = _.get(deviceCfg, 'productType') ||
            _.get(defDeviceCfg, 'productType'), modelName = _.get(deviceCfg, 'modelName') ||
            _.get(defDeviceCfg, 'modelName'), oaid = this.uuid, osVersion = _.get(deviceCfg, 'osVersion') ||
            _.get(defDeviceCfg, 'osVersion'), deviceInfo = _.get(deviceCfg, 'deviceInfo') ||
            _.get(defDeviceCfg, 'deviceInfo'), board = _.get(deviceCfg, 'board') ||
            _.get(defDeviceCfg, 'board'), } = data;
        const deviceBrand = deviceInfo.split('/')[0];
        const deviceDisplay = deviceInfo.split('/')[3];
        const urlMap = {
            zzz: {
                ...(['prod_gf_cn'].includes(this.server)
                    ? {
                        getFp: {
                            url: `${this.hostPublicData}device-fp/api/getFp`,
                            body: {
                                app_name: 'bbs_cn',
                                bbs_device_id: `${this.uuid}`,
                                device_fp: '38d805c20d53d',
                                device_id: 'cc57c40f763ae4cc',
                                ext_fields: `{"proxyStatus":1,"isRoot":0,"romCapacity":"768","deviceName":"${modelName}","productName":"${productName}","romRemain":"657","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"aaid":"${this.uuid}","model":"${modelName}","brand":"${deviceBrand}","hardware":"qcom","deviceType":"${deviceType}","devId":"REL","serialNumber":"unknown","sdCapacity":224845,"buildTime":"1692775759000","buildUser":"BuildUser","simState":1,"ramRemain":"115803","appUpdateTimeDiff":1794929333391,"deviceInfo":"${deviceInfo}","vaid":"${this.uuid}","buildType":"user","sdkVersion":"33","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"chargeStatus":1,"manufacturer":"${deviceBrand}","emulatorStatus":0,"appMemory":"768","osVersion":"${osVersion}","vendor":"unknown","accelerometer":"1.8478572x6.262017x7.4356966","sdRemain":115675,"buildTags":"release-keys","packageName":"com.mihoyo.hyperion","networkType":"WiFi","oaid":"${oaid}","debugStatus":1,"ramCapacity":"224845","magnetometer":"-28.593752x2.775x80.7375","display":"${deviceDisplay}","appInstallTimeDiff":1740498108042,"packageVersion":"2.44.0","gyroscope":"0.0030543238x-0.004123337x0.007788526","batteryStatus":88,"hasKeyboard":0,"board":"${board}"}`,
                                platform: '2',
                                seed_id: `${this.uuid}`,
                                seed_time: new Date().getTime() + '',
                            },
                            noDs: true,
                        },
                        zzzAuthKey: {
                            url: `${this.host}binding/api/genAuthKey`,
                            body: {
                                auth_appid: 'webview_gacha',
                                game_biz: this.gameBiz,
                                game_uid: +this.uid,
                                region: this.server,
                            },
                            dsSalt: 'web',
                        },
                        deviceLogin: {
                            url: `${this.hostBbs}apihub/api/deviceLogin`,
                            body: {
                                app_version: '2.118.1',
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
                                app_version: '2.118.1',
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
                                device_fp: '38d7f4c72b736',
                                device_id: 'cc57c40f763ae4cc',
                                ext_fields: `{"proxyStatus":1,"isRoot":0,"romCapacity":"768","deviceName":"${modelName}","productName":"${productName}","romRemain":"738","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"model":"${modelName}","brand":"${deviceBrand}","hardware":"qcom","deviceType":"${deviceType}","devId":"REL","serialNumber":"unknown","sdCapacity":224845,"buildTime":"1692775759000","buildUser":"BuildUser","simState":1,"ramRemain":"115710","appUpdateTimeDiff":1794929519098,"deviceInfo":"${deviceInfo}","buildType":"user","sdkVersion":"33","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"app_set_id":"${this.uuid}","chargeStatus":3,"manufacturer":"${deviceBrand}","emulatorStatus":0,"appMemory":"768","adid":"${this.uuid}","osVersion":"${osVersion}","vendor":"unknown","accelerometer":"0.2865405x7.4273214x6.939784","sdRemain":115582,"buildTags":"release-keys","packageName":"com.mihoyo.hoyolab","networkType":"WiFi","debugStatus":1,"ramCapacity":"224845","magnetometer":"13.81875x-14.6625x82.443756","display":"${deviceDisplay}","appInstallTimeDiff":1740498134990,"packageVersion":"2.44.0","gyroscope":"-0.20586143x-0.11514801x-0.019089524","batteryStatus":88,"hasKeyboard":0,"board":"${board}"}`,
                                hoyolab_device_id: `${this.uuid}`,
                                platform: '2',
                                seed_id: `${this.uuid}`,
                                seed_time: new Date().getTime() + '',
                            },
                            noDs: true,
                        },
                    }),
                zzzGacha_Record: {
                    url: `${this.hostRecord}event/game_record_zzz/api/zzz/gacha_record`,
                    query: `lang=zh-cn&uid=${this.uid}&region=${this.server}&gacha_type=${data.type}&end_id=${data.endId}`,
                },
                ...this.zzzUrlMap,
            },
        };
        return urlMap[this.game];
    };
}
//# sourceMappingURL=tool.js.map