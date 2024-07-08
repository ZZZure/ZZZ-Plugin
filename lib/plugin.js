import MysZZZApi from './mysapi.js';
import { getCk } from './common.js';
import _ from 'lodash';
import NoteUser from '../../genshin/model/mys/NoteUser.js';

export class ZZZPlugin extends plugin {
  async getUID() {
    let user = this.e;
    if (this.e.at) {
      user = this.e.at;
    }
    this.User = await NoteUser.create(user);
    let uid = this.e.msg.match(/\d+/)?.[0];
    uid = uid || this.User?.getUid('zzz');
    if (!uid) {
      await this.reply('uid为空，米游社查询请先绑定cookie，其他查询请携带uid');
      return false;
    }
    return uid;
  }
  async getAPI() {
    let uid = await this.getUID();
    if (!uid) return false;

    const ck = await getCk(this.e);
    if (!ck || Object.keys(ck).filter(k => ck[k].ck).length === 0) {
      await this.reply('尚未绑定cookie，请先绑定cookie');
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
