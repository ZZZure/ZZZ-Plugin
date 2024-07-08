import path from 'path';
import { pluginName, resourcesPath } from './path.js';
import setting from './settings.js';
import version from './version.js';

/**
 * 渲染函数
 * @param {any} e 消息事件
 * @param {string} renderPath 渲染路径
 * @param {object} renderData 渲染数据
 * @param {object} cfg 配置
 * @returns
 */
function render(e, renderPath, renderData = {}, cfg = {}) {
  // 判断是否存在e.runtime
  if (!e.runtime) {
    console.log('未找到e.runtime，请升级至最新版Yunzai');
  }

  // 获取渲染精度配置
  const scaleCfg = setting.getConfig('config')?.render?.scale || 100;
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
    ...cfg,
    beforeRender({ data }) {
      const resPath = data.pluResPath;
      const layoutPath = data.pluResPath + 'common/layout/';
      const renderPathFull = data.pluResPath + renderPath.split('/')[0] + '/';
      return {
        player: e?.playerCard?.player,
        avatar: e?.playerCard?.avatar,
        ...data,
        _res_path: resPath,
        _layout_path: layoutPath,
        defaultLayout: path.join(layoutPathFull, 'index.html'),
        sys: {
          scale: pct,
          resourcesPath: resPath,
          currentPath: renderPathFull,
          playerInfo: path.join(layoutPathFull, 'playerinfo.html'),
          copyright: `Created By ${version.name}<span class="version">${version.yunzai}</span> & ${pluginName}<span class="version">${version.version}</span>`,
          createdby: `Created By <span class="highlight">${pluginName}</span> & Powered By <span class="highlight">ZZZure</span>`,
        },
        quality: 100,
      };
    },
  });
}

export default render;
