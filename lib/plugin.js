import MysZZZApi from './mysapi.js';
import { getCk } from './common.js';
import _ from 'lodash';

export class ZZZPlugin extends plugin {
  async miYoSummerGetUid() {
    const key = `ZZZ:UID:${this.e.user_id}`;
    const ck = await getCk(this.e);
    if (!ck) return false;
    let api = new MysZZZApi('', ck);
    let userData = await api.getData('zzzUser');
    if (!userData?.data || _.isEmpty(userData.data.list)) return false;
    userData = userData.data.list[0];
    let { game_uid: gameUid } = userData;
    await redis.set(key, gameUid);
    await redis.setEx(
      `ZZZ:userData:${gameUid}`,
      60 * 60,
      JSON.stringify(userData)
    );
    return userData;
  }

  async getAPI() {
    let user = this.e.user_id;
    let ats = this.e.message.filter(m => m.type === 'at');
    if (ats.length > 0 && !e.atBot) {
      user = ats[0].qq;
      this.e.user_id = user;
      this.User = new User(this.e);
    }
    let uid = this.e.msg.match(/\d+/)?.[0];
    await this.miYoSummerGetUid();
    uid =
      uid || (await redis.get(`ZZZ:UID:${user}`)) || this.e.user?.getUid('zzz');
    if (!uid) {
      await this.reply('尚未绑定uid,请发送#zzz绑定uid进行绑定');
      return false;
    }
    const ck = await getCk(this.e);
    if (!ck || Object.keys(ck).filter(k => ck[k].ck).length === 0) {
      await this.reply('尚未绑定cookie，请先使用逍遥插件绑定cookie');
      return false;
    }

    const api = new MysZZZApi(uid, ck);
    let deviceFp = await redis.get(`ZZZ:DEVICE_FP:${uid}`);
    if (!deviceFp) {
      let sdk = api.getUrl('getFp');
      let res = await fetch(sdk.url, {
        headers: sdk.headers,
        method: 'POST',
        body: sdk.body,
      });
      let fpRes = await res.json();
      deviceFp = fpRes?.data?.device_fp;
      if (deviceFp) {
        await redis.set(`ZZZ:DEVICE_FP:${uid}`, deviceFp, {
          EX: 86400 * 7,
        });
      }
    }
    return { api, uid, deviceFp };
  }
}
