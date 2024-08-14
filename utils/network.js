import http from 'http';
import https from 'https';
export async function checkLatency(url) {
  let request = http;
  if (url.startsWith('https')) {
    request = https;
  }
  return new Promise(resolve => {
    const start = Date.now();
    request
      .get(url, res => {
        res.on('data', () => {});
        res.on('end', () => {
          const latency = Date.now() - start;
          resolve({ url, latency });
        });
      })
      .on('error', err => {
        logger.debug(`下载节点 ${url} 连接失败:`, err.message);
        resolve({ url, latency: Infinity });
      });
  });
}

export async function findLowestLatencyUrl(urls) {
  const results = await Promise.all(urls.map(checkLatency));
  const lowestLatencyResult = results.reduce((prev, curr) =>
    prev.latency < curr.latency ? prev : curr
  );
  return lowestLatencyResult.url;
}

export function getQueryVariable(url, variable) {
  const searchParams = new URLSearchParams(url);
  const key = searchParams.get(variable);
  return key;
}
