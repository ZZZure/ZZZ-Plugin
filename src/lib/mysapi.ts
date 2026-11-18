import type Handler from '../../../../lib/plugins/handler.js'
import type { Cookie } from './common.js'
import type { EventType, Mys } from '#interface'
// @ts-ignore
import MysApi from '../../../genshin/model/mys/mysApi.js'
import { randomString } from '../utils/data.js'
import ZZZApiTool from './mysapi/tool.js'
import { MysError } from './error.js'
import settings from './settings.js'
import crypto from 'crypto'
import _ from 'lodash'
import md5 from 'md5'

// const DEVICE_ID = randomString(32).toUpperCase()
// const DEVICE_NAME = randomString(_.random(1, 10));

/**
 * 米游社ZZZAPI（继承自MysApi）
 */
export default class MysZZZApi extends MysApi {
  handler?: typeof Handler
  e?: EventType
  uid: string
  server: string
  apiTool: ZZZApiTool
  _device: string
  declare _device_fp: { data: { device_fp: string } }
  declare getData: (type: any, data: any, cached?: boolean) => Promise<any>
  declare cookie: string

  constructor(uid: string, cookie: string | Record<string, Cookie>, option?: {
    handler?: typeof Handler
    e?: EventType
  }) {
    // @ts-ignore
    super(uid, cookie, option, true)
    // 初始化 uid、server、apiTool
    this.uid = uid
    // 获取玩家的服务器
    this.server = this.getServer()
    // 初始化 apiTool
    this.apiTool = new ZZZApiTool(uid, this.server)
    // 绑定过🐎插件 （如果存在）
    this.handler = option?.handler
    // 绑定yunzai event （如果存在）
    // @ts-ignore
    this.e = option?.e || {}
    // 获取 cookie 和设备 ID
    if (typeof this.cookie !== 'string' && this.cookie) {
      const cookie = this.cookie as Cookie
      const ck = Object.values(cookie).find(item => {
        return item.ck && item.uid === uid
      })
      if (!ck) {
        throw new Error(`[ZZZ]UID:${uid}未绑定Cookie。若无法更新面板可尝试%更新展柜面板（所更新角色数据与实际不一致时，请提issue）`)
      }
      this._device = ck?.device_id || ck?.device
      this.cookie = ck?.ck
    }
    // 如果没有设备ID，生成设备ID
    if (!this._device) {
      this._device = crypto.randomUUID()
    }
  }

  /**
   * 获取服务器
   */
  getServer() {
    // 获取 UID
    const _uid = this.uid?.toString()
    // 如果 UID 长度小于 10，说明是官服
    if (_uid.length < 10) {
      return 'prod_gf_cn' // 官服
    }
    switch (_uid.slice(0, -8)) {
      case '10':
        return 'prod_gf_us' // 美服
      case '15':
        return 'prod_gf_eu' // 欧服
      case '13':
        return 'prod_gf_jp' // 亚服
      case '17':
        return 'prod_gf_sg' // 港澳台服
      default:
        return 'prod_gf_cn' // 官服
    }
  }

  /**
   * 获取请求网址
   * @param type
   * @param data
   */
  getUrl(type: Mys.UrlType, data: any = {}) {
    // 设置设备ID
    data.deviceId = this._device
    // 获取请求地址
    const urlMap = this.apiTool.getUrlMap(data)
    // @ts-expect-error
    const target = urlMap[type]
    if (!target) return false
    // 获取请求参数（即APITool中默认的请求参数，此参数理应是不可获取的，详细请参照 lib/mysapi/tool.js`）
    let {
      url,
      body = '',
    } = target
    const {
      query = '',
      noDs = false,
      dsSalt = '',
    } = target
    // 如果有query，拼接到url上
    if (query) url += `?${query}`
    // 如果传入了 query 参数，将 query 参数拼接到 url 上
    if (data.query) {
      let str = ''
      if (typeof data.query === 'object') {
        // 拼接 query
        for (const key in data.query) {
          if (data.query[key] === undefined) continue
          else if (data.query[key] === null) str += `${key}&`
          else if (Array.isArray(data.query[key])) {
            data.query[key].forEach(item => {
              str += `${key}[]=${item}&`
            })
          } else str += `${key}=${data.query[key]}&`
        }
        // 去除最后一个 &
        str = str.slice(0, -1)
      } else {
        str = String(data.query)
      }
      // 拼接到 url 上
      if (url.includes('?')) {
        url += `&${str}`
      } else {
        url += `?${str}`
      }
    }
    // 写入 body
    if (body) body = JSON.stringify(body)
    // 获取请求头
    let headers = this.getHeaders(query, body)
    // 如果有设备指纹，写入设备指纹
    if (data.deviceFp) {
      headers['x-rpc-device_fp'] = data.deviceFp
      // 兼容喵崽
      this._device_fp = { data: { device_fp: data.deviceFp } }
    }
    // 写入 cookie
    headers.cookie = this.cookie
    // 写入设备ID（默认继承的）
    if (this._device) {
      headers['x-rpc-device_id'] = this._device
    }
    // 如果有设备ID，写入设备ID（传入的，这里是绑定设备方法1中的设备ID）
    if (data.deviceId) {
      headers['x-rpc-device_id'] = data.deviceId
    }
    // 如果有绑定设备信息，写入绑定设备信息，否则写入默认设备信息
    if (data?.deviceInfo && data?.modelName && data?.osVersion) {
      const osVersion = data.osVersion
      const modelName = data.modelName
      const deviceBrand = data.deviceInfo?.split('/')[0]
      const deviceDisplay = data.deviceInfo?.split('/')[3]
      try {
        headers['x-rpc-device_name'] = `${deviceBrand} ${modelName}`
        headers['x-rpc-device_model'] = modelName
        headers['x-rpc-csm_source'] = 'myself'
        // 国际服不需要绑定设备，故写入的'User-Agent'为国服
        headers[
          'User-Agent'
        ] = `Mozilla/5.0 (Linux; Android ${osVersion}; ${modelName} Build/${deviceDisplay}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 miHoYoBBS/2.118.1`
      } catch (error: any) {
        logger.error(`[ZZZ]设备信息解析失败：${error.message}`)
      }
    } else {
      const deviceCfg = settings.getConfig('device')
      const defDeviceCfg = settings.getdefSet('device')
      const modelName =
        _.get(deviceCfg, 'modelName') ?? _.get(defDeviceCfg, 'modelName')
      const deviceInfo =
        _.get(deviceCfg, 'deviceInfo') ?? _.get(defDeviceCfg, 'deviceInfo')
      const deviceBrand = deviceInfo.split('/')[0]
      try {
        headers['x-rpc-device_name'] = `${deviceBrand} ${modelName}`
        headers['x-rpc-device_model'] = modelName
        headers['x-rpc-csm_source'] = 'myself'
      } catch (error: any) {
        logger.error(`[ZZZ]设备信息解析失败：${error.message}`)
      }
    }
    // 写入DS
    switch (dsSalt) {
      case 'web': {
        headers.DS = this.getDS2()
        break
      }
      default:
    }
    // 如果是获取 AuthKey，写入额外参数
    if (type === 'zzzAuthKey') {
      const extra = {
        DS: this.getDS2(),
        Host: 'api-takumi.mihoyo.com',
      }
      headers = Object.assign(headers, extra)
    } else {
      headers.DS = this.getDs(query, body)
    }
    // 如果不需要 DS，删除 DS
    if (noDs) {
      Reflect.deleteProperty(headers, 'DS')
      if (this._device) {
        body = JSON.parse(body)
        body.device_id = this._device
        if (data.deviceId) {
          body.device_id = data.deviceId
        }
        body = JSON.stringify(body)
      }
    }
    // 返回请求参数
    return { url, headers, body }
  }

  /**
   * 获取DS
   */
  getDs(query = '', body = '') {
    let n = ''
    if (['prod_gf_cn'].includes(this.server)) {
      n = 'xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs'
    } else {
      n = 'okr4obncj8bw5a65hbnn5oo6ixjc3l9w'
    }
    const t = Math.round(new Date().getTime() / 1000)
    const r = Math.floor(Math.random() * 900000 + 100000)
    const DS = md5(`salt=${n}&t=${t}&r=${r}&b=${body}&q=${query}`)
    return `${t},${r},${DS}`
  }

  /**
   * 获取DS2
   */
  getDS2() {
    const t = Math.round(new Date().getTime() / 1000)
    const r = randomString(6)
    const sign = md5(`salt=7a047e46eadd8693f09513e55bdf6bd8&t=${t}&r=${r}`)
    return `${t},${r},${sign}`
  }

  /**
   * 获取请求头
   */
  getHeaders(query: string = '', body: string = ''): {
    [key: string]: any
    'x-rpc-app_version': string,
    // 'x-rpc-client_type': client.client_type,
    'User-Agent': string,
    'x-rpc-sys_version': string,
    'x-rpc-client_type': string,
    'x-rpc-channel': string,
    Referer: string,
    DS: string,
    Origin: string,
  } {
    // 此处为默认设备信息，绑定设备信息已在getUrl中写入
    const deviceCfg = settings.getConfig('device')
    const defDeviceCfg = settings.getdefSet('device')
    const osVersion =
      _.get(deviceCfg, 'osVersion') ?? _.get(defDeviceCfg, 'osVersion')
    const modelName =
      _.get(deviceCfg, 'modelName') ?? _.get(defDeviceCfg, 'modelName')
    const deviceInfo =
      _.get(deviceCfg, 'deviceInfo') ?? _.get(defDeviceCfg, 'deviceInfo')
    const deviceDisplay = deviceInfo.split('/')[3]
    const cn = {
      app_version: '2.118.1',
      User_Agent: `Mozilla/5.0 (Linux; Android ${osVersion}; ${modelName} Build/${deviceDisplay}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 miHoYoBBS/2.118.1`,
      client_type: '5',
      Origin: 'https://act.mihoyo.com',
      X_Requested_With: 'com.mihoyo.hyperion',
      Referer: 'https://act.mihoyo.com/',
    }
    const os = {
      app_version: '4.23.0',
      User_Agent: `Mozilla/5.0 (Linux; Android ${osVersion}; ${modelName} Build/${deviceDisplay}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 miHoYoBBSOversea/4.23.0`,
      client_type: '2',
      Origin: 'https://act.hoyolab.com',
      X_Requested_With: 'com.mihoyo.hoyolab',
      Referer: 'https://act.hoyolab.com/',
    }
    let client
    if (['prod_gf_cn'].includes(this.server)) {
      client = cn
    } else {
      client = os
    }
    return {
      'x-rpc-app_version': client.app_version,
      // 'x-rpc-client_type': client.client_type,
      'User-Agent': client.User_Agent || 'okhttp/4.9.3',
      'x-rpc-sys_version': '13',
      'x-rpc-client_type': '2',
      'x-rpc-channel': 'mihoyo',
      Referer: client.Referer,
      DS: this.getDs(query, body),
      Origin: client.Origin,
    }
  }

  /**
   * 校验状态码
   * @param res 请求返回
   * @param type 请求类型 如 srNote
   * @param data 查询请求的数据
   */
  async checkCode(res: any, type: string, data: object = {}) {
    if (!res) {
      throw new Error('米游社接口返回数据为空')
    }
    res.retcode = Number(res.retcode)
    const code = String(res.retcode)
    const config = settings.getConfig('config') || {}
    const _configCode = _.get(config, 'mysCode', [])
    const configCode = !Array.isArray(_configCode)
      ? [String(_configCode)]
      : _configCode.map(item => String(item))
    if (
      code === '1034' ||
      code === '10035' ||
      code === '10041' ||
      configCode.includes(code)
    ) {
      // 如果有注册的mys.req.err，调用
      if (!!this?.handler && this?.handler?.has('mys.req.err')) {
        logger.mark(
          `[米游社绝区零查询失败][UID:${this.uid}][qq:${this?.e?.user_id || this?.e?.sender?.user_id}] 遇到验证码，尝试调用 Handler mys.req.err`
        )
        res =
          (await this.handler.call('mys.req.err', this.e, {
            mysApi: this,
            type,
            res,
            data,
            mysInfo: this,
          })) || res
      }
    }
    if (Number(res.retcode) === 0) {
      return res
    }
    throw new MysError(code, this.uid, res)
  }

  /**
   * 获取米游社数据
   * @param type 请求类型
   * @param data
   * @param cached
   */
  async getFinalData<T extends keyof Mys.KeyValue>(
    type: T,
    data: {
      [key: string]: any
      deviceFp?: string
      query?: Record<string, any>
      headers?: Record<string, any>
      productName?: string
      deviceType?: string
      modelName?: string
      oaid?: string
      osVersion?: string
      deviceInfo?: string
      board?: string
      deviceId?: string
    } = {},
    cached = false
  ): Promise<Mys.KeyValue[T] | null> {
    if (!data?.headers) data.headers = {}
    if (data.deviceFp) {
      data.headers['x-rpc-device_fp'] = data.deviceFp
    }
    // 从 this.cookie 中获取ltuid
    const ck = this.cookie
    const m = ck.match(/ltuid=(\d+);/)
    const ltuid = m ? m[1] : null
    if (ltuid) {
      const _bindInfo = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:BIND`)
      if (_bindInfo) {
        const bindInfo = JSON.parse(_bindInfo)
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
          }
        } catch (error) { }
      }
      const device_fp = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:FP`)
      const device_id = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:ID`)
      if (device_fp && device_id) {
        data = {
          ...data,
          deviceFp: device_fp,
          deviceId: device_id,
        }
        data.headers ||= {}
        data.headers['x-rpc-device_fp'] = device_fp
        data.headers['x-rpc-device_id'] = device_id
      }
    }
    const result = await this.getData(type, data, cached)
    const _data = await this.checkCode(result, type, data)
    if (!_data || _data.retcode !== 0) return null
    return _data.data
  }
}
