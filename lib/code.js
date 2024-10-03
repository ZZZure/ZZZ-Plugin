/**
 * From ZZZeroUID
 */

import request from '../utils/request.js';

const TZ_OFFSET = 8 * 60 * 60 * 1000;

async function getData(type, data = {}) {
  const urls = {
    activity:
      'https://bbs-api.miyoushe.com/apihub/api/home/new?gids=8&parts=1%2C3%2C4&device=OnePlus%20IN2025&cpu=placeholder&version=3',
    index: 'https://api-takumi.mihoyo.com/event/miyolive/index',
    code: 'https://api-takumi-static.mihoyo.com/event/miyolive/refreshCode',
  };

  try {
    const headers = { 'x-rpc-act_id': data.actId || '' };
    const params = new URLSearchParams({
      version: data.version || '',
      time: Math.floor(Date.now() / 1000).toString(),
    });

    let res;
    if (type === 'index') {
      res = await request(urls[type], { headers });
    } else if (type === 'code') {
      res = await request(`${urls[type]}?${params}`, { headers });
    } else {
      res = await request(urls[type]);
    }

    return await res.json();
  } catch (e) {
    return { error: `[${e.name}] ${type} 接口请求错误` };
  }
}

async function getActId() {
  const ret = await getData('activity');
  if (ret.error || ret.retcode !== 0) return '';

  const keywords = ['前瞻直播'];
  for (const nav of ret.data.navigator) {
    const name = nav.name;
    if (name && keywords.every(word => name.includes(word))) {
      const matched = nav.app_path.match(/act_id=(.*?)&/);
      if (matched) return matched[1];
    }
  }
  return '';
}

async function getLiveData(actId) {
  const ret = await getData('index', { actId });
  if (ret.error || ret.retcode !== 0) {
    return { error: ret.error || '前瞻直播数据异常' };
  }

  const liveRaw = ret.data.live;
  const liveTemp = JSON.parse(ret.data.template);
  const liveData = {
    code_ver: liveRaw.code_ver,
    title: liveRaw.title.replace('特别直播', ''),
    header: liveTemp.kvDesktop,
    room: liveTemp.liveConfig[0].desktop,
  };

  if (liveRaw.is_end) {
    liveData.review = liveTemp.reviewUrl.args.post_id;
  } else {
    const now = new Date(Date.now() + TZ_OFFSET);
    const start = new Date(liveRaw.start + ' GMT+0800');
    if (now < start) {
      liveData.start = liveRaw.start;
    }
  }
  return liveData;
}

async function getCode(version, actId) {
  const ret = await getData('code', { version, actId });
  if (ret.error || ret.retcode !== 0) {
    return { error: ret.error || '兑换码数据异常' };
  }

  return ret.data.code_list.map(codeInfo => ({
    items: codeInfo.title.replace(/<.*?>/g, ''),
    code: codeInfo.code,
  }));
}

export async function getCodeMsg() {
  const actId = await getActId();
  if (!actId) return '暂无前瞻直播资讯';

  const liveData = await getLiveData(actId);
  if (liveData.error) return `获取兑换码失败：\n${liveData.error}`;

  const codeData = await getCode(liveData.code_ver, actId);
  if (Array.isArray(codeData) && codeData.length > 0) {
    const code = codeData[0];
    return `${liveData.title}\n${code.items}:\n${code.code}`;
  }

  return '获取兑换码失败';
}
