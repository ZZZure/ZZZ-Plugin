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
const request = (url, options, retry = 0, timeout = 15000) => {
  let err;
  const controller = new AbortController()
  const { signal } = controller
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const _fetch = async (url, options, retryCount = 0) => {
    if (retryCount > retry) {
      throw new Error('Retry limit reached', err);
    }
    try {
      return await _request(url, { signal, ...options });
    } catch (error) {
      logger.debug(error.name === 'AbortError' ? 'Request timed out' : `Fetch error: ${error.message}`);
      err = error;
      return await _fetch(url, options, retryCount + 1);
    } finally {
      clearTimeout(timeoutId)
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
request.get = async (url, data, options) => {
  const params = new URLSearchParams(data);
  const { retry, timeout, ...restOptions } = options;
  return request(`${url}?${params}`, restOptions, retry, timeout);
};

/**
 * POST 请求
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @param {object} options 请求配置
 * @returns {Promise<Response>}
 */
request.post = async (url, data, options) => {
  const body = JSON.stringify(data);
  const { retry, timeout, ...restOptions } = options;
  return request(url, { ...restOptions, method: 'POST', body }, retry, timeout);
};

export default request;
