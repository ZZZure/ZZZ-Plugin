import NoteUser from '../../../genshin/model/mys/NoteUser.js';
import { pluginName, resourcesPath } from './path.js';
import { getCk, rulePrefix } from './common.js';
import request from '../utils/request.js';
import settings from './settings.js';
import MysZZZApi from './mysapi.js';
import version from './version.js';
import fetch from 'node-fetch';
import path from 'path';
import _ from 'lodash';
export class ZZZPlugin extends plugin {
    User;
    parseMsgPrefix() {
        return this.e.msg?.replace(new RegExp(rulePrefix), '').trim();
    }
    async getUID() {
        let user = this.e;
        const query = settings.getConfig('config').query;
        const allow = _.get(query, 'others', true);
        if (this.e.at && allow) {
            this.e.user_id = this.e.at;
            user = this.e.at;
        }
        this.User = await NoteUser.create(user);
        const uid = this.User?.getUid('zzz');
        if (!uid) {
            await this.reply('uid为空，需要CK的功能请先绑定CK或者#扫码登录，需要SK的功能请#扫码登录，若不清楚需要CK或SK，请查看%帮助');
            throw new Error('UID为空');
        }
        return uid;
    }
    async getLtuid() {
        const uid = await this.getUID();
        const ck = await getCk(this.e);
        if (!ck || Object.keys(ck).filter(k => ck[k].ck).length === 0) {
            await this.reply('尚未绑定cookie，请先绑定cookie，或者#扫码登录');
            throw new Error('CK为空');
        }
        const currentCK = Object.values(ck).find(item => {
            return item.ck && item.uid === uid;
        });
        return currentCK?.ltuid || '';
    }
    async getAPI() {
        this.e.game = 'zzz';
        const uid = await this.getUID();
        const ck = await getCk(this.e);
        if (!ck || Object.keys(ck).filter(k => ck[k].ck).length === 0) {
            await this.reply('尚未绑定cookie，请先绑定cookie，或者#扫码登录');
            throw new Error('CK为空');
        }
        const api = new MysZZZApi(uid, ck, {
            handler: this.e?.runtime?.handler || {},
            e: this.e,
        });
        const ltuid = await this.getLtuid();
        if (!ltuid) {
            this.reply('ltuid为空，请重新绑定CK');
            throw new Error('ltuid为空');
        }
        let deviceFp = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:FP`);
        let data = {};
        if (!deviceFp) {
            const _bindInfo = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:BIND`);
            if (_bindInfo) {
                data = {
                    deviceFp,
                };
                try {
                    const bindInfo = JSON.parse(_bindInfo);
                    data = {
                        productName: bindInfo?.deviceProduct,
                        deviceType: bindInfo?.deviceName,
                        modelName: bindInfo?.deviceModel,
                        oaid: bindInfo?.oaid,
                        osVersion: bindInfo?.androidVersion,
                        deviceInfo: bindInfo?.deviceFingerprint,
                        board: bindInfo?.deviceBoard,
                    };
                }
                catch (error) { }
            }
            const sdk = api.getUrl('getFp', data);
            if (!sdk) {
                this.reply('获取请求数据失败');
                throw new Error('获取请求数据失败');
            }
            let res;
            try {
                res = await fetch(sdk.url, {
                    headers: sdk.headers,
                    method: 'POST',
                    body: sdk.body,
                });
            }
            catch (error) {
                logger.error(error.toString());
                if (!/^(1[0-9])[0-9]{8}/i.test(uid)) {
                    deviceFp = '38d805c20d53d';
                }
                else {
                    deviceFp = '38d7f4c72b736';
                }
                return { api, uid, deviceFp };
            }
            const fpRes = await res.json();
            logger.debug(`[米游社][设备指纹]${JSON.stringify(fpRes)}`);
            deviceFp = fpRes?.data?.device_fp;
            if (!deviceFp) {
                this.reply('获取设备指纹失败');
                throw new Error('获取设备指纹失败');
            }
            await redis.set(`ZZZ:DEVICE_FP:${ltuid}:FP`, deviceFp, {
                EX: 86400 * 7,
            });
            if (!/^(1[0-9])[0-9]{8}/i.test(uid)) {
                data['deviceFp'] = deviceFp;
                const deviceLogin = api.getUrl('deviceLogin', data);
                const saveDevice = api.getUrl('saveDevice', data);
                if (!!deviceLogin && !!saveDevice) {
                    logger.debug(`[米游社][设备登录]保存设备信息`);
                    try {
                        logger.debug(`[米游社][设备登录]${JSON.stringify(deviceLogin)}`);
                        const login = await request(deviceLogin.url, {
                            headers: deviceLogin.headers,
                            method: 'POST',
                            body: deviceLogin.body,
                        });
                        const save = await request(saveDevice.url, {
                            headers: saveDevice.headers,
                            method: 'POST',
                            body: saveDevice.body,
                        });
                        const result = await Promise.all([login.json(), save.json()]);
                        logger.debug(`[米游社][设备登录]${JSON.stringify(result)}`);
                    }
                    catch (error) {
                        logger.error(`[米游社][设备登录]${error.message}`);
                    }
                }
            }
        }
        return { api, uid, deviceFp };
    }
    async getPlayerInfo(playerData = null) {
        let player = null;
        if (!playerData) {
            const { api, uid } = await this.getAPI();
            if (!api) {
                throw new Error('获取米游社API失败');
            }
            playerData = await api.getFinalData('zzzUser').catch(e => {
                this.reply(e.message);
                throw e;
            });
            if (!playerData)
                throw new Error('获取用户数据失败');
            player = playerData?.list?.find(item => item.game_uid == uid) || playerData?.list?.[0];
        }
        else {
            player = playerData.list?.[0] || null;
        }
        if (!player) {
            throw new Error('获取玩家信息失败');
        }
        let avatar = '';
        if (this.e.group?.pickMember) {
            avatar = await this.e.group.pickMember(this.e.user_id).getAvatarUrl();
        }
        else if (this.e.member?.getAvatarUrl) {
            avatar = await this.e.member.getAvatarUrl();
        }
        else if (this.e.friend?.getAvatarUrl) {
            avatar = await this.e.friend.getAvatarUrl();
        }
        else {
            avatar = this.e?.bot?.avatar;
        }
        this.e.playerCard = {
            avatar,
            player,
        };
        return player;
    }
    render(renderPath, renderData = {}, cfg = {}) {
        const e = this.e || cfg?.e;
        if (!e.runtime) {
            logger.error('未找到e.runtime，请升级至最新版Yunzai');
        }
        const renderCfg = _.get(settings.getConfig('config'), 'render', {});
        const scaleCfg = _.get(renderCfg, 'scale', 100);
        const scaleCfgValue = Math.min(2, Math.max(0.5, scaleCfg / 100)) * 2;
        const scale = (cfg?.scale || 1) * scaleCfgValue;
        const pct = `style='transform:scale(${scale})'`;
        const layoutPathFull = path.join(resourcesPath, 'common/layout/');
        return e.runtime.render(pluginName, renderPath, renderData, {
            ...cfg,
            beforeRender({ data }) {
                const resPath = data.pluResPath;
                const layoutPath = data.pluResPath + 'common/layout/';
                const renderPathDir = renderPath.substring(0, renderPath.lastIndexOf('/') + 1);
                const renderPathFull = data.pluResPath + renderPathDir;
                return {
                    player: e?.playerCard?.player,
                    avatar: e?.playerCard?.avatar,
                    ...data,
                    _res_path: resPath,
                    _layout_path: layoutPath,
                    defaultLayout: path.join(layoutPathFull, 'index.html'),
                    sys: {
                        scale: pct,
                        resourcesPath: resPath,
                        currentPath: renderPathFull,
                        playerInfo: path.join(layoutPathFull, 'playerinfo.html'),
                        specialTitle: path.join(layoutPathFull, 'specialtitle.html'),
                        copyright: `Created By ${version.name}<span class="version">${version.yunzai}</span> & ${pluginName}<span class="version">${version.version}</span>`,
                        createdby: `Created By <div class="highlight"><span>${pluginName}</span><div class="version">${version.version}</div></div> & Powered By <div class="highlight">ZZZure</div>`,
                    },
                    quality: 90,
                };
            },
        });
    }
}
