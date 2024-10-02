import md5 from 'md5';
import _ from 'lodash';
import crypto from 'crypto';
import ZZZApiTool from './mysapi/tool.js';
import { randomString } from '../utils/data.js';
import MysApi from '../../genshin/model/mys/mysApi.js';
import { MysError } from './error.js';
import settings from './settings.js';

// const DEVICE_ID = randomString(32).toUpperCase()
// const DEVICE_NAME = randomString(_.random(1, 10));

/**
 * 米游社ZZZAPI（继承自MysApi）
 */
export default class MysZZZApi extends MysApi {
  constructor(uid, cookie, option = {}) {
    super(uid, cookie, option, true);
    // 初始化 uid、server、apiTool
    this.uid = uid;
    // 获取玩家的服务器
    this.server = this.getServer(uid);
    // 初始化 apiTool
    this.apiTool = new ZZZApiTool(uid, this.server);
    // 绑定过🐎插件 （如果存在）
    this.handler = option?.handler || {};
    // 绑定yunzai event （如果存在）
    this.e = option?.e || {};
    // 获取 cookie 和设备 ID
    if (typeof this.cookie !== 'string' && this.cookie) {
      const ck = Object.values(this.cookie).find(item => {
        return item.ck && item.uid === uid;
      });
      if (!ck) {
        throw new Error(`[ZZZ]要查询的UID:${uid}未绑定Cookie`);
      }
      this._device = ck?.device_id || ck?.device;
      this.cookie = ck?.ck;
    }
    // 如果没有设备ID，生成设备ID
    if (!this._device) {
      this._device = crypto.randomUUID();
    }
  }

  /**
   * 获取服务器
   * @returns {string}
   */
  getServer() {
    // 获取 UID
    const _uid = this.uid?.toString();
    // 如果 UID 长度小于 10，说明是官服
    if (_uid.length < 10) {
      return 'prod_gf_cn'; // 官服
    }
    switch (_uid.slice(0, -8)) {
      case '10':
        return 'prod_gf_us'; // 美服
      case '15':
        return 'prod_gf_eu'; // 欧服
      case '13':
        return 'prod_gf_jp'; // 亚服
      case '17':
        return 'prod_gf_sg'; // 港澳台服
    }
  }

  /**
   * 获取请求网址
   * @param {string} type
   * @param {object} data
   * @returns {object|boolean}
   */
  getUrl(type, data = {}) {
    // 设置设备ID
    data.deviceId = this._device;
    // 获取请求地址
    const urlMap = this.apiTool.getUrlMap(data);
    if (!urlMap[type]) return false;
    // 获取请求参数（即APITool中默认的请求参数，此参数理应是不可获取的，详细请参照 lib/mysapi/tool.js`）
    let {
      url,
      query = '',
      body = '',
      noDs = false,
      dsSalt = '',
    } = urlMap[type];
    // 如果有query，拼接到url上
    if (query) url += `?${query}`;
    // 如果传入了 query 参数，将 query 参数拼接到 url 上
    if (data.query) {
      let str = '';
      if (typeof data.query === 'object') {
        // 拼接 query
        for (let key in data.query) {
          if (data.query[key] === undefined) continue;
          else if (data.query[key] === null) str += `${key}&`;
          else if (Array.isArray(data.query[key])) {
            data.query[key].forEach(item => {
              str += `${key}[]=${item}&`;
            });
          } else str += `${key}=${data.query[key]}&`;
        }
        // 去除最后一个 &
        str = str.slice(0, -1);
      } else {
        str = String(data.query);
      }
      // 拼接到 url 上
      if (url.includes('?')) {
        url += `&${str}`;
      } else {
        url += `?${str}`;
      }
    }
    // 写入 body
    if (body) body = JSON.stringify(body);
    // 获取请求头
    let headers = this.getHeaders(query, body);
    // 如果有设备指纹，写入设备指纹
    if (data.deviceFp) {
      headers['x-rpc-device_fp'] = data.deviceFp;
      // 兼容喵崽
      this._device_fp = { data: { device_fp: data.deviceFp } };
    }
    // 写入 cookie
    headers.cookie = this.cookie;
    // 写入设备ID（默认继承的）
    if (this._device) {
      headers['x-rpc-device_id'] = this._device;
    }
    // 如果有设备ID，写入设备ID（传入的，这里是绑定设备方法1中的设备ID）
    if (data.deviceId) {
      headers['x-rpc-device_id'] = data.deviceId;
    }
    // 如果有绑定设备信息，写入绑定设备信息，否则写入默认设备信息
    if (data?.deviceInfo && data?.modelName && data?.osVersion) {
      const osVersion = data.osVersion;
      const modelName = data.modelName;
      const deviceBrand = data.deviceInfo?.split('/')[0];
      const deviceDisplay = data.deviceInfo?.split('/')[3];
      try {
        headers['x-rpc-device_name'] = `${deviceBrand} ${modelName}`;
        headers['x-rpc-device_model'] = modelName;
        headers['x-rpc-csm_source'] = 'myself';
        // 国际服不需要绑定设备，故写入的'User-Agent'为国服
        headers[
          'User-Agent'
        ] = `Mozilla/5.0 (Linux; Android ${osVersion}; ${modelName} Build/${deviceDisplay}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 miHoYoBBS/2.73.1`;
      } catch (error) {
        logger.error(`[ZZZ]设备信息解析失败：${error.message}`);
      }
    } else {
      const deviceCfg = settings.getConfig('device');
      const defDeviceCfg = settings.getdefSet('device');
      const modelName =
        _.get(deviceCfg, 'modelName') ?? _.get(defDeviceCfg, 'modelName');
      const deviceInfo =
        _.get(deviceCfg, 'deviceInfo') ?? _.get(defDeviceCfg, 'deviceInfo');
      const deviceBrand = deviceInfo.split('/')[0];
      try {
        headers['x-rpc-device_name'] = `${deviceBrand} ${modelName}`;
        headers['x-rpc-device_model'] = modelName;
        headers['x-rpc-csm_source'] = 'myself';
      } catch (error) {
        logger.error(`[ZZZ]设备信息解析失败：${error.message}`);
      }
    }
    // 写入DS
    switch (dsSalt) {
      case 'web': {
        headers.DS = this.getDS2();
        break;
      }
      default:
    }
    // 如果是获取 AuthKey，写入额外参数
    if (type === 'zzzAuthKey') {
      let extra = {
        DS: this.getDS2(),
        Host: 'api-takumi.mihoyo.com',
      };
      headers = Object.assign(headers, extra);
    } else {
      headers.DS = this.getDs(query, body);
    }
    // 如果不需要 DS，删除 DS
    if (noDs) {
      delete headers.DS;
      if (this._device) {
        body = JSON.parse(body);
        body.device_id = this._device;
        if (data.deviceId) {
          body.device_id = data.deviceId;
        }
        body = JSON.stringify(body);
      }
    }
    // 返回请求参数
    return { url, headers, body };
  }

  /**
   * 获取DS
   * @param {string} q
   * @param {string} b
   * @returns {string}
   */
  getDs(q = '', b = '') {
    let n = '';
    if (['prod_gf_cn'].includes(this.server)) {
      n = 'xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs';
    } else {
      n = 'okr4obncj8bw5a65hbnn5oo6ixjc3l9w';
    }
    const t = Math.round(new Date().getTime() / 1000);
    const r = Math.floor(Math.random() * 900000 + 100000);
    const DS = md5(`salt=${n}&t=${t}&r=${r}&b=${b}&q=${q}`);
    return `${t},${r},${DS}`;
  }

  /**
   * 获取DS2
   * @returns {string}
   */
  getDS2() {
    const t = Math.round(new Date().getTime() / 1000);
    const r = randomString(6);
    const sign = md5(`salt=WGtruoQrwczmsjLOPXzJLnaAYycsLavx&t=${t}&r=${r}`);
    return `${t},${r},${sign}`;
  }

  /**
   * 获取请求头
   * @param {string} query
   * @param {string} body
   * @returns {object}
   */
  getHeaders(query = '', body = '') {
    // 此处为默认设备信息，绑定设备信息已在getUrl中写入
    const deviceCfg = settings.getConfig('device');
    const defDeviceCfg = settings.getdefSet('device');
    const osVersion =
      _.get(deviceCfg, 'osVersion') ?? _.get(defDeviceCfg, 'osVersion');
    const modelName =
      _.get(deviceCfg, 'modelName') ?? _.get(defDeviceCfg, 'modelName');
    const deviceInfo =
      _.get(deviceCfg, 'deviceInfo') ?? _.get(defDeviceCfg, 'deviceInfo');
    const deviceDisplay = deviceInfo.split('/')[3];
    const cn = {
      app_version: '2.73.1',
      User_Agent: `Mozilla/5.0 (Linux; Android ${osVersion}; ${modelName} Build/${deviceDisplay}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 miHoYoBBS/2.73.1`,
      client_type: '5',
      Origin: 'https://act.mihoyo.com',
      X_Requested_With: 'com.mihoyo.hyperion',
      Referer: 'https://act.mihoyo.com/',
    };
    const os = {
      app_version: '2.57.1',
      User_Agent: `Mozilla/5.0 (Linux; Android ${osVersion}; ${modelName} Build/${deviceDisplay}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 miHoYoBBSOversea/2.57.1`,
      client_type: '2',
      Origin: 'https://act.hoyolab.com',
      X_Requested_With: 'com.mihoyo.hoyolab',
      Referer: 'https://act.hoyolab.com/',
    };
    let client;
    if (['prod_gf_cn'].includes(this.server)) {
      client = cn;
    } else {
      client = os;
    }
    return {
      'x-rpc-app_version': client.app_version,
      // 'x-rpc-client_type': client.client_type,
      'User-Agent': 'okhttp/4.8.0',
      'x-rpc-sys_version': '12',
      'x-rpc-client_type': '2',
      'x-rpc-channel': 'mihoyo',
      'User-Agent': client.User_Agent,
      Referer: client.Referer,
      DS: this.getDs(query, body),
      Origin: client.Origin,
    };
  }

  /**
   * 校验状态码
   * @param e 消息e
   * @param res 请求返回
   * @param type 请求类型 如 srNote
   * @param data 查询请求的数据
   * @returns {Promise<*|boolean>}
   */
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
    if (code === '1034' || code === '10035' || configCode.includes(code)) {
      // 如果有注册的mys.req.err，调用
      if (!!this?.handler && this?.handler?.has('mys.req.err')) {
        logger.mark(
          `[米游社绝区零查询失败][UID:${this.uid}][qq:${this?.e?.userId}] 遇到验证码，尝试调用 Handler mys.req.err`
        );
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

  /**
   * 获取米游社数据
   * @param {*} e 消息e
   * @param {keyof ZZZApiTool['zzzUrlMap']} type 请求类型
   * @param {{deviceFp?: string; query: Record<string, any>; headers: object;}} data
   * @param {boolean} cached
   */
  async getFinalData(type, data = {}, cached = false) {
    if (!data?.headers) data.headers = {};
    if (data.deviceFp) {
      data.headers['x-rpc-device_fp'] = data.deviceFp;
    }
    // 从 this.cookie 中获取ltuid
    const ck = this.cookie;
    let ltuid = ck.match(/ltuid=(\d+);/);
    if (ltuid) {
      ltuid = ltuid[1];
    }
    if (ltuid) {
      let bindInfo = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:BIND`);
      if (bindInfo) {
        bindInfo = JSON.parse(bindInfo);
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
        } catch (error) {
          bindInfo = null;
        }
      }
      const device_fp = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:FP`);
      if (device_fp) {
        data.deviceFp = device_fp;
        data.headers['x-rpc-device_fp'] = device_fp;
      }
      const device_id = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:ID`);
      if (device_id) {
        data.deviceId = device_id;
        data.headers['x-rpc-device_id'] = device_id;
      }
    }
    const result = await this.getData(type, data, cached);
    const _data = await this.checkCode(result, type, {});
    if (!_data || _data.retcode !== 0) return false;
    return _data.data;
  }
}
