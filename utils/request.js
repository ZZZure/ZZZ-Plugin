import fetch from 'node-fetch';

/**
 * 请求
 * @param {string} url 请求地址
 * @param {object} options 请求配置
 * @returns {Promise<Response>}
 */
const _request = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  } else if (response.status < 200 || response.status >= 300) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response;
};

/**
 * 请求
 * @param {string} url 请求地址
 * @param {object} options 请求配置
 * @param {number} retry 重试次数
 * @returns {Promise<Response>}
 */
const request = (url, options = {}, retry = 0, timeout = 15000) => {
  let err;
  const controller = new AbortController();
  const { signal } = controller;
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  options.headers = {
    'Content-Type': 'application/json',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Sec-Ch-Ua':
      '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    ...(options?.headers || {}),
  };
  const _fetch = async (url, options, retryCount = 0) => {
    if (retryCount > retry) {
      throw new Error('Retry limit reached', err);
    }
    try {
      return await _request(url, { signal, ...options });
    } catch (error) {
      logger.debug(
        error.name === 'AbortError'
          ? 'Request timed out'
          : `Fetch error: ${error.message}`
      );
      err = error;
      return await _fetch(url, options, retryCount + 1);
    } finally {
      clearTimeout(timeoutId);
    }
  };
  return _fetch(url, options);
};

/**
 * GET 请求
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @param {object} options 请求配置
 * @returns {Promise<Response>}
 */
request.get = async (url, data, options = {}) => {
  const u = new URL(url);
  for (const key in data) {
    u.searchParams.append(key, data[key]);
  }
  const { retry, timeout, ...restOptions } = options;
  return request(
    u.toString(),
    { ...restOptions, method: 'GET' },
    retry,
    timeout
  );
};

/**
 * POST 请求
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @param {object} options 请求配置
 * @returns {Promise<Response>}
 */
request.post = async (url, data, options = {}) => {
  const body = JSON.stringify(data);
  const { retry, timeout, ...restOptions } = options;
  return request(url, { ...restOptions, method: 'POST', body }, retry, timeout);
};

export default request;
