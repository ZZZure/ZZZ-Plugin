import fetch from 'node-fetch';

//暂时先写死罢（
const timeout = 5000

export async function checkLatency(url) {
  const controller = new AbortController()
  const { signal } = controller
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const start = Date.now()

  try {
    await fetch(url, { signal })
    const latency = Date.now() - start
    return { url, latency }
  } catch (err) {
    logger.debug(`下载节点 ${url} 连接失败:`, err.message)
    return { url, latency: Infinity }
  } finally {
    clearTimeout(timeoutId)
  }
}


export async function findLowestLatencyUrl(urls) {
  const results = await Promise.allSettled(urls.map(checkLatency));
  const lowestLatencyResult = results.reduce((prev, curr) =>
    prev.value.latency < curr.value.latency ? prev : curr
  );
  return lowestLatencyResult.value.url;
}

export function getQueryVariable(url, variable) {
  const searchParams = new URLSearchParams(url);
  const key = searchParams.get(variable);
  return key;
}
