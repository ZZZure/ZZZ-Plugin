import MysZZZApi from './mysapi.js';
import { getCk } from './common.js';
import _ from 'lodash';
import NoteUser from '../../genshin/model/mys/NoteUser.js';
import settings from '../lib/settings.js';
import request from '../utils/request.js';
import path from 'path';
import { pluginName, resourcesPath } from './path.js';
import version from './version.js';
export class ZZZPlugin extends plugin {
  /**
   * 获取用户 UID（如果需要同时获取API，可以直接调用 getAPI）
   * @returns {Promise<string | boolean>}
   */
  async getUID() {
    // 默认为当前用户
    let user = this.e;
    // 获取配置
    const query = settings.getConfig('config').query;
    const allow = _.get(query, 'others', true);
    // 如果 at 存在且允许查看其他用户
    if (this.e.at && allow) {
      // 将当前用户的 user_id 设置为 at 对象的 user_id
      this.e.user_id = this.e.at;
      // 将当前用户设置为 at 对象
      user = this.e.at;
    }
    // 获取用户信息（米游社），因此这里会导致查询一次米游社的信息
    this.User = await NoteUser.create(user);
    // 获取用户 UID
    const uid = this.User?.getUid('zzz');
    // 如果 UID 不存在，说明没有绑定 cookie
    if (!uid) {
      await this.reply(
        'uid为空，需要CK的功能请先绑定CK或者#扫码登录，需要SK的功能请#扫码登录，若不清楚需要CK或SK，请查看%帮助'
      );
      throw new Error('UID为空');
    }
    // 返回 UID
    return uid;
  }

  /**
   * 获取用户 ltuid
   * @returns {Promise<string | boolean>}
   * @memberof ZZZPlugin
   * @description 获取用户 ltuid
   * @returns {Promise<string | boolean>}
   */
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
  /**
   * 获取米游社 API
   * @returns {Promise<{api: MysZZZApi, uid: string, deviceFp: string}>}
   */
  async getAPI() {
    this.e.game = 'zzz';
    // 直接调用获取 UID
    const uid = await this.getUID();
    // 获取用户的 cookie
    const ck = await getCk(this.e);
    // 如果 cookie 不存在或者 cookie 为空，说明没有绑定 cookie
    if (!ck || Object.keys(ck).filter(k => ck[k].ck).length === 0) {
      await this.reply('尚未绑定cookie，请先绑定cookie，或者#扫码登录');
      throw new Error('CK为空');
    }

    // 创建米游社 API 对象
    const api = new MysZZZApi(uid, ck, {
      handler: this.e?.runtime?.handler || {},
      e: this.e,
    });
    const ltuid = await this.getLtuid();
    if (!ltuid) {
      this.reply('ltuid为空，请重新绑定CK');
      throw new Error('ltuid为空');
    }
    // 获取设备指纹
    let deviceFp;
    let bindInfo = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:BIND`);
    if (bindInfo) {
      deviceFp = await redis.get(`ZZZ:DEVICE_FP:${ltuid}:FP`);
      let data = {
        deviceFp,
      };
      try {
        bindInfo = JSON.parse(bindInfo);
        data = {
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
      if (!deviceFp) {
        const sdk = api.getUrl('getFp', data);
        const res = await request(sdk.url, {
          headers: sdk.headers,
          method: 'POST',
          body: sdk.body,
        });
        const fpRes = await res.json();
        logger.debug(`[米游社][设备指纹]${JSON.stringify(fpRes)}`);
        deviceFp = fpRes?.data?.device_fp;
        if (!deviceFp) {
          return { api: null, uid: null, deviceFp: null };
        }
        await redis.set(`ZZZ:DEVICE_FP:${ltuid}:FP`, deviceFp, {
          EX: 86400 * 7,
        });
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
          } catch (error) {
            logger.error(`[米游社][设备登录]${error.message}`);
          }
        }
      }
    } else {
      deviceFp = await redis.get(`ZZZ:DEVICE_FP:${uid}:FP`);
      if (!deviceFp) {
        const sdk = api.getUrl('getFp');
        const res = await request(sdk.url, {
          headers: sdk.headers,
          method: 'POST',
          body: sdk.body,
        });
        const fpRes = await res.json();
        deviceFp = fpRes?.data?.device_fp;
        if (deviceFp) {
          await redis.set(`ZZZ:DEVICE_FP:${uid}:FP`, deviceFp, {
            EX: 86400 * 7,
          });
        }
      }
    }
    // 返回数据（API、UID、设备指纹）
    return { api, uid, deviceFp };
  }

  /**
   * 获取玩家信息（当调用此方法时，会获取用户的玩家信息，并将其保存到`e.playerCard`中，方便渲染用户信息（此部分请查阅`lib/render.js`中两个模块的作用））
   * @returns {Promise<boolean | object>}
   */
  async getPlayerInfo() {
    // 获取 米游社 API
    const { api, uid } = await this.getAPI();
    // 获取用户信息
    let userData = await api.getFinalData('zzzUser').catch(e => {
      this.reply(e.message);
      throw e;
    });

    if (!userData) throw new Error('获取用户数据失败');
    // 取第一个用户信息
    userData =
      userData?.list?.find(item => item.game_uid == uid) || userData?.list?.[0];

    // 获取用户头像
    let avatar = '';
    if (this.e.member?.getAvatarUrl) {
      avatar = await this.e.member.getAvatarUrl();
    } else if (this.e.friend?.getAvatarUrl) {
      avatar = await this.e.friend.getAvatarUrl();
    } else {
      avatar = this.e?.bot?.avatar;
    }
    // 写入数据
    this.e.playerCard = {
      avatar: avatar,
      player: userData,
    };
    // 返回数据
    return userData;
  }

  /**
   * 渲染函数
   * @param {string} renderPath 渲染路径
   * @param {object} renderData 渲染数据
   * @param {object} cfg 配置
   * @returns {Promise<any>}
   */
  render(renderPath, renderData = {}, cfg = {}) {
    const e = this.e || cfg?.e;
    // 判断是否存在e.runtime
    if (!e.runtime) {
      logger.error('未找到e.runtime，请升级至最新版Yunzai');
    }

    // 获取渲染精度配置
    const renderCfg = _.get(settings.getConfig('config'), 'render', {});
    const scaleCfg = _.get(renderCfg, 'scale', 100);
    // 计算配置缩放比例
    const scaleCfgValue = Math.min(2, Math.max(0.5, scaleCfg / 100)) * 2;
    // 将函数参数中的缩放比例与配置缩放比例相乘
    const scale = (cfg?.scale || 1) * scaleCfgValue;
    // 将缩放比例转换为style属性
    const pct = `style='transform:scale(${scale})'`;
    // 获取布局路径
    const layoutPathFull = path.join(resourcesPath, 'common/layout/');

    // 调用e.runtime.render方法渲染
    return e.runtime.render(pluginName, renderPath, renderData, {
      // 合并传入的配置
      ...cfg,
      beforeRender({ data }) {
        // 资源路径
        const resPath = data.pluResPath;
        // 布局路径
        const layoutPath = data.pluResPath + 'common/layout/';
        // 当前的渲染路径
        const renderPathFull = data.pluResPath + renderPath.split('/')[0] + '/';
        // 合并数据
        return {
          // 玩家信息
          player: e?.playerCard?.player,
          // 玩家头像
          avatar: e?.playerCard?.avatar,
          // 传入的数据
          ...data,
          // 资源路径
          _res_path: resPath,
          // 布局路径
          _layout_path: layoutPath,
          // 默认布局路径
          defaultLayout: path.join(layoutPathFull, 'index.html'),
          // 系统配置
          sys: {
            // 缩放比例
            scale: pct,
            // 资源路径
            resourcesPath: resPath,
            // 当前渲染的路径
            currentPath: renderPathFull,
            /**
             * 下面两个模块的作用在于，你可以在你的布局文件中使用这两个模块，就可以显示用户信息和特殊标题，使用方法如下：
             * 1. 展示玩家信息：首先你要在查询的时候调用`this.getPlayerInfo()`，这样，玩家数据就会保存在`e.playerCard`中，然后你就可以在布局文件中使用`{{include sys.playerInfo}}`来展示玩家信息。
             * 2. 展示特殊标题：你可以在布局文件中使用`<% include(sys.specialTitle, {en: 'PROPERTY' , cn: '属性' , count: 6 }) %>`来展示特殊标题，其中`count`为可选参数，默认为9。
             */
            // 玩家信息模块
            playerInfo: path.join(layoutPathFull, 'playerinfo.html'),
            // 特殊标题模块
            specialTitle: path.join(layoutPathFull, 'specialtitle.html'),
            // 版权信息
            copyright: `Created By ${version.name}<span class="version">${version.yunzai}</span> & ${pluginName}<span class="version">${version.version}</span>`,
            // 版权信息（简化版）
            createdby: `Created By <div class="highlight"><span>${pluginName}</span><div class="version">${version.version}</div></div> & Powered By <div class="highlight">ZZZure</div>`,
          },
          quality: 100,
        };
      },
    });
  }
}
