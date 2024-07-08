import fs from 'fs';
import { appPath } from './lib/path.js';

logger.info('*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*');
logger.info('ZZZ-Plugin 加载中');
logger.info('仓库地址 https://github.com/ZZZure/ZZZ-plugin');
logger.info('Created By ZZZure Project (MIHOMO)');
logger.info('*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*');

if (!global.segment) global.segment = (await import('oicq')).segment;

if (!global.core) {
  try {
    global.core = (await import('oicq')).core;
  } catch (err) {
    // ignore empty error
  }
}

const files = fs.readdirSync(appPath).filter(file => file.endsWith('.js'));

const ret = [];

files.forEach(file => {
  ret.push(import(`./apps/${file}`));
});

const retPromise = await Promise.allSettled(ret);

const apps = {};

for (const i in files) {
  const name = files[i].replace('.js', '');

  if (retPromise[i].status != 'fulfilled') {
    logger.error(`[ZZZ-Plugin] 载入模块${logger.red(name)}错误`);
    logger.error(retPromise[i].reason);
    continue;
  }

  apps[name] = retPromise[i].value[Object.keys(retPromise[i].value)[0]];
}

export { apps };
