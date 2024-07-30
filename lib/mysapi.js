import md5 from 'md5';
import _ from 'lodash';
import crypto from 'crypto';
import ZZZApiTool from './mysapi/tool.js';
import { randomString } from '../utils/data.js';
import MysApi from '../../genshin/model/mys/mysApi.js';

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
    this.server = this.getServer(uid);
    this.apiTool = new ZZZApiTool(uid, this.server);
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
    if (!this._device) {
      this._device = crypto.randomUUID();
    }
  }

  /**
   * 获取服务器
   * @returns {string}
   */
  getServer() {
    const _uid = this.uid?.toString();
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
      for (let key in data.query) {
        if (data.query[key] === undefined) continue;
        else if (data.query[key] === null) str += `${key}&`;
        else if (Array.isArray(data.query[key])) {
          data.query[key].forEach(item => {
            str += `${key}[]=${item}&`;
          });
        } else str += `${key}=${data.query[key]}&`;
      }
      str = str.slice(0, -1);
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
    if (data.deviceFp) {
      headers['x-rpc-device_fp'] = data.deviceFp;
      // 兼容喵崽
      this._device_fp = { data: { device_fp: data.deviceFp } };
    }
    // 写入 cookie
    headers.cookie = this.cookie;
    // 写入设备ID
    if (this._device) {
      headers['x-rpc-device_id'] = this._device;
    }
    // 写入DS
    switch (dsSalt) {
      case 'web': {
        headers.DS = this.getDS2();
        break;
      }
      default:
    }
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
        body = JSON.stringify(body);
      }
    }
    logger.debug(`[mysapi]请求url：${url}`);
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
    const cn = {
      app_version: '2.73.1',
      User_Agent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.73.1',
      client_type: '5',
      Origin: 'https://webstatic.mihoyo.com',
      X_Requested_With: 'com.mihoyo.hyperion',
      Referer: 'https://webstatic.mihoyo.com/',
    };
    const os = {
      app_version: '2.55.0',
      User_Agent:
        'Mozilla/5.0 (Linux; Android 11; J9110 Build/55.2.A.4.332; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 miHoYoBBSOversea/2.55.0',
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
  async checkCode(e, res, type, data = {}) {
    if (!res || !e) {
      e.reply('米游社接口请求失败，暂时无法查询');
      return false;
    }
    this.e = e;
    this.e.isZZZ = true;
    res.retcode = Number(res.retcode);
    switch (res.retcode) {
      case 0:
        break;
      case 10035:
      case 1034: {
        let handler = this.e.runtime?.handler || {};

        // 如果有注册的mys.req.err，调用
        if (handler.has('mys.req.err')) {
          logger.mark(
            `[米游社zzz查询失败][uid:${this.uid}][qq:${this.userId}] 遇到验证码，尝试调用 Handler mys.req.err`
          );
          res =
            (await handler.call('mys.req.err', this.e, {
              mysApi: this,
              type,
              res,
              data,
              mysInfo: this,
            })) || res;
        }
        if (!res || res?.retcode === 1034 || res?.retcode === 10035) {
          logger.mark(
            `[米游社zzz查询失败][uid:${this.uid}][qq:${this.userId}] 遇到验证码`
          );
          this.e.reply('米游社zzz查询遇到验证码，请稍后再试');
        }
        break;
      }
      default:
        if (/(登录|login)/i.test(res.message)) {
          logger.mark(`[ck失效][uid:${this.uid}]`);
          this.e.reply(`UID:${this.uid}，米游社cookie已失效`);
        } else {
          this.e.reply(
            `米游社接口报错，暂时无法查询：${res.message || 'error'}`
          );
        }
        break;
    }
    if (res.retcode !== 0) {
      logger.mark(
        `[米游社zzz接口报错]${JSON.stringify(res)}，uid：${this.uid}`
      );
    }
    return res;
  }

  /**
   * 获取米游社数据
   * @param {*} e 消息e
   * @param {keyof ZZZApiTool['zzzUrlMap']} type 请求类型
   * @param {{deviceFp: string; query: Record<string, any>; headers: object;}} data
   * @param {boolean} cached
   */
  async getFinalData(e, type, data = {}, cached = false) {
    const result = await this.getData(type, data, cached);
    const _data = await this.checkCode(e, result, type, {});
    if (!_data || _data.retcode !== 0) return false;
    return _data.data;
  }
}
