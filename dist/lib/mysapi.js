import MysApi from '../../../genshin/model/mys/mysApi.js';
import { randomString } from '../utils/data.js';
import ZZZApiTool from './mysapi/tool.js';
import { MysError } from './error.js';
import settings from './settings.js';
import crypto from 'crypto';
import _ from 'lodash';
import md5 from 'md5';
export default class MysZZZApi extends MysApi {
    handler;
    e;
    uid;
    server;
    apiTool;
    _device;
    constructor(uid, cookie, option) {
        super(uid, cookie, option, true);
        this.uid = uid;
        this.server = this.getServer();
        this.apiTool = new ZZZApiTool(uid, this.server);
        this.handler = option?.handler;
        this.e = option?.e || {};
        if (typeof this.cookie !== 'string' && this.cookie) {
            const cookie = this.cookie;
            const ck = Object.values(cookie).find(item => {
                return item.ck && item.uid === uid;
            });
            if (!ck) {
                throw new Error(`[ZZZ]UID:${uid}未绑定Cookie。若无法更新面板可尝试%更新展柜面板（所更新角色数据与实际不一致时，请提issue）`);
            }
            this._device = ck?.device_id || ck?.device;
            this.cookie = ck?.ck;
        }
        if (!this._device) {
            this._device = crypto.randomUUID();
        }
    }
    getServer() {
        const _uid = this.uid?.toString();
        if (_uid.length < 10) {
            return 'prod_gf_cn';
        }
        switch (_uid.slice(0, -8)) {
            case '10':
                return 'prod_gf_us';
            case '15':
                return 'prod_gf_eu';
            case '13':
                return 'prod_gf_jp';
            case '17':
                return 'prod_gf_sg';
            default:
                return 'prod_gf_cn';
        }
    }
    getUrl(type, data = {}) {
        data.deviceId = this._device;
        const urlMap = this.apiTool.getUrlMap(data);
        const target = urlMap[type];
        if (!target)
            return false;
        let { url, body = '', } = target;
        const { query = '', noDs = false, dsSalt = '', } = target;
        if (query)
            url += `?${query}`;
        if (data.query) {
            let str = '';
            if (typeof data.query === 'object') {
                for (const key in data.query) {
                    if (data.query[key] === undefined)
                        continue;
                    else if (data.query[key] === null)
                        str += `${key}&`;
                    else if (Array.isArray(data.query[key])) {
                        data.query[key].forEach(item => {
                            str += `${key}[]=${item}&`;
                        });
                    }
                    else
                        str += `${key}=${data.query[key]}&`;
                }
                str = str.slice(0, -1);
            }
            else {
                str = String(data.query);
            }
            if (url.includes('?')) {
                url += `&${str}`;
            }
            else {
                url += `?${str}`;
            }
        }
        if (body)
            body = JSON.stringify(body);
        let headers = this.getHeaders(query, body);
        if (data.deviceFp) {
            headers['x-rpc-device_fp'] = data.deviceFp;
            this._device_fp = { data: { device_fp: data.deviceFp } };
        }
        headers.cookie = this.cookie;
        if (this._device) {
            headers['x-rpc-device_id'] = this._device;
        }
        if (data.deviceId) {
            headers['x-rpc-device_id'] = data.deviceId;
        }
        if (data?.deviceInfo && data?.modelName && data?.osVersion) {
            const osVersion = data.osVersion;
            const modelName = data.modelName;
            const deviceBrand = data.deviceInfo?.split('/')[0];
            const deviceDisplay = data.deviceInfo?.split('/')[3];
            try {
                headers['x-rpc-device_name'] = `${deviceBrand} ${modelName}`;
                headers['x-rpc-device_model'] = modelName;
                headers['x-rpc-csm_source'] = 'myself';
                headers['User-Agent'] = `Mozilla/5.0 (Linux; Android ${osVersion}; ${modelName} Build/${deviceDisplay}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 miHoYoBBS/2.73.1`;
            }
            catch (error) {
                logger.error(`[ZZZ]设备信息解析失败：${error.message}`);
            }
        }
        else {
            const deviceCfg = settings.getConfig('device');
            const defDeviceCfg = settings.getdefSet('device');
            const modelName = _.get(deviceCfg, 'modelName') ?? _.get(defDeviceCfg, 'modelName');
            const deviceInfo = _.get(deviceCfg, 'deviceInfo') ?? _.get(defDeviceCfg, 'deviceInfo');
            const deviceBrand = deviceInfo.split('/')[0];
            try {
                headers['x-rpc-device_name'] = `${deviceBrand} ${modelName}`;
                headers['x-rpc-device_model'] = modelName;
                headers['x-rpc-csm_source'] = 'myself';
            }
            catch (error) {
                logger.error(`[ZZZ]设备信息解析失败：${error.message}`);
            }
        }
        switch (dsSalt) {
            case 'web': {
                headers.DS = this.getDS2();
                break;
            }
            default:
        }
        if (type === 'zzzAuthKey') {
            const extra = {
                DS: this.getDS2(),
                Host: 'api-takumi.mihoyo.com',
            };
            headers = Object.assign(headers, extra);
        }
        else {
            headers.DS = this.getDs(query, body);
        }
        if (noDs) {
            Reflect.deleteProperty(headers, 'DS');
            if (this._device) {
                body = JSON.parse(body);
                body.device_id = this._device;
                if (data.deviceId) {
                    body.device_id = data.deviceId;
                }
                body = JSON.stringify(body);
            }
        }
        return { url, headers, body };
    }
    getDs(query = '', body = '') {
        let n = '';
        if (['prod_gf_cn'].includes(this.server)) {
            n = 'xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs';
        }
        else {
            n = 'okr4obncj8bw5a65hbnn5oo6ixjc3l9w';
        }
        const t = Math.round(new Date().getTime() / 1000);
        const r = Math.floor(Math.random() * 900000 + 100000);
        const DS = md5(`salt=${n}&t=${t}&r=${r}&b=${body}&q=${query}`);
        return `${t},${r},${DS}`;
    }
    getDS2() {
        const t = Math.round(new Date().getTime() / 1000);
        const r = randomString(6);
        const sign = md5(`salt=WGtruoQrwczmsjLOPXzJLnaAYycsLavx&t=${t}&r=${r}`);
        return `${t},${r},${sign}`;
    }
    getHeaders(query = '', body = '') {
        const deviceCfg = settings.getConfig('device');
        const defDeviceCfg = settings.getdefSet('device');
        const osVersion = _.get(deviceCfg, 'osVersion') ?? _.get(defDeviceCfg, 'osVersion');
        const modelName = _.get(deviceCfg, 'modelName') ?? _.get(defDeviceCfg, 'modelName');
        const deviceInfo = _.get(deviceCfg, 'deviceInfo') ?? _.get(defDeviceCfg, 'deviceInfo');
        const deviceDisplay = deviceInfo.split('/')[3];
        const cn = {
            app_version: '2.73.1',
            User_Agent: `Mozilla/5.0 (Linux; Android ${osVersion}; ${modelName} Build/${deviceDisplay}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 miHoYoBBS/2.73.1`,
            client_type: '5',
            Origin: 'https://act.mihoyo.com',
            X_Requested_With: 'com.mihoyo.hyperion',
            Referer: 'https://act.mihoyo.com/',
        };
        const os = {
            app_version: '2.57.1',
            User_Agent: `Mozilla/5.0 (Linux; Android ${osVersion}; ${modelName} Build/${deviceDisplay}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 miHoYoBBSOversea/2.57.1`,
            client_type: '2',
            Origin: 'https://act.hoyolab.com',
            X_Requested_With: 'com.mihoyo.hoyolab',
            Referer: 'https://act.hoyolab.com/',
        };
        let client;
        if (['prod_gf_cn'].includes(this.server)) {
            client = cn;
        }
        else {
            client = os;
        }
        return {
            'x-rpc-app_version': client.app_version,
            'User-Agent': client.User_Agent || 'okhttp/4.8.0',
            'x-rpc-sys_version': '12',
            'x-rpc-client_type': '2',
            'x-rpc-channel': 'mihoyo',
            Referer: client.Referer,
            DS: this.getDs(query, body),
            Origin: client.Origin,
        };
    }
    async checkCode(res, type, data = {}) {
        if (!res) {
            throw new Error('米游社接口返回数据为空');
        }
        res.retcode = Number(res.retcode);
        const code = String(res.retcode);
        const config = settings.getConfig('config') || {};
        const _configCode = _.get(config, 'mysCode', []);
        const configCode = !Array.isArray(_configCode)
            ? [String(_configCode)]
            : _configCode.map(item => String(item));
        if (code === '1034' ||
            code === '10035' ||
            code === '10041' ||
            configCode.includes(code)) {
            if (!!this?.handler && this?.handler?.has('mys.req.err')) {
                logger.mark(`[米游社绝区零查询失败][UID:${this.uid}][qq:${this?.e?.user_id || this?.e?.sender?.user_id}] 遇到验证码，尝试调用 Handler mys.req.err`);
                res =
                    (await this.handler.call('mys.req.err', this.e, {
                        mysApi: this,
                        type,
                        res,
                        data,
                        mysInfo: this,
                    })) || res;
            }
        }
        if (Number(res.retcode) === 0) {
            return res;
        }
        throw new MysError(code, this.uid, res);
    }
    async getFinalData(type, data = {}, cached = false) {
        if (!data?.headers)
            data.headers = {};
        if (data.deviceFp) {
            data.headers['x-rpc-device_fp'] = data.deviceFp;
        }
        const ck = this.cookie;
        const m = ck.match(/ltuid=(\d+);/);
        const ltuid = m ? m[1] : null;
        if (ltuid) {
            const _bindInfo = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:BIND`);
            if (_bindInfo) {
                const bindInfo = JSON.parse(_bindInfo);
                try {
                    data = {
                        ...data,
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
            const device_fp = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:FP`);
            const device_id = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:ID`);
            if (device_fp && device_id) {
                data = {
                    ...data,
                    deviceFp: device_fp,
                    deviceId: device_id,
                };
                data.headers ||= {};
                data.headers['x-rpc-device_fp'] = device_fp;
                data.headers['x-rpc-device_id'] = device_id;
            }
        }
        const result = await this.getData(type, data, cached);
        const _data = await this.checkCode(result, type, data);
        if (!_data || _data.retcode !== 0)
            return null;
        return _data.data;
    }
}
//# sourceMappingURL=mysapi.js.map