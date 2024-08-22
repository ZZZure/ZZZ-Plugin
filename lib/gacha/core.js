import { ZZZ_GET_GACHA_LOG_API } from '../mysapi/api.js';
import request from '../../utils/request.js';
import { ZZZGachaLogResp } from '../../model/gacha.js';

/**
 * 获取抽卡链接
 * @param {string} authKey 米游社认证密钥
 * @param {string} gachaType 祈愿类型（池子代码）
 * @param {string} initLogGachaBaseType
 * @param {number} page 页数
 * @param {string} endId 最后一个数据的 id
 * @param {string} size 页面数据大小
 * @returns {Promise<string>} 抽卡链接
 */
export const getZZZGachaLink = async (
  authKey,
  gachaType = '2001',
  initLogGachaBaseType = '2',
  page = 1,
  endId = '0',
  size = '20'
) => {
  // 暂时直接写死服务器为国服
  const serverId = 'prod_gf_cn';
  const url = ZZZ_GET_GACHA_LOG_API;
  const timestamp = Math.floor(Date.now() / 1000);
  // 请求参数
  const params = new URLSearchParams({
    authkey_ver: '1',
    sign_type: '2',
    auth_appid: 'webview_gacha',
    init_log_gacha_type: gachaType,
    init_log_gacha_base_type: initLogGachaBaseType,
    gacha_id: '2c1f5692fdfbb733a08733f9eb69d32aed1d37',
    timestamp: timestamp.toString(),
    lang: 'zh-cn',
    device_type: 'mobile',
    plat_type: 'ios',
    region: serverId,
    authkey: authKey,
    game_biz: 'nap_cn',
    gacha_type: gachaType,
    real_gacha_type: initLogGachaBaseType,
    page: page,
    size: size,
    end_id: endId,
  });
  // 完整链接
  return `${url}?${params}`;
};

/**
 * 通过米游社认证密钥获取抽卡记录
 * @param {string} authKey 米游社认证密钥
 * @param {string} gachaType 祈愿类型（池子代码）
 * @param {string} initLogGachaBaseType
 * @param {number} page 页数
 * @param {string} endId 最后一个数据的 id
 * @returns {Promise<ZZZGachaLogResp>} 抽卡记录
 */
export const getZZZGachaLogByAuthkey = async (
  authKey,
  gachaType = '2001',
  initLogGachaBaseType = '2',
  page = 1,
  endId = '0'
) => {
  // 获取抽卡链接
  const link = await getZZZGachaLink(
    authKey,
    gachaType,
    initLogGachaBaseType,
    page,
    endId
  );
  // 发送请求
  const response = await request(link, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    retry: 3,
  });
  // 获取数据
  const data = await response.json();
  if (!data || !data?.data) return null;

  return new ZZZGachaLogResp(data.data);
};
