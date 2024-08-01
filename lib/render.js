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
const render = (e, renderPath, renderData = {}, cfg = {}) => {
  // 判断是否存在e.runtime
  if (!e.runtime) {
    logger.error('未找到e.runtime，请升级至最新版Yunzai');
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
    // 合并传入的配置
    ...cfg,
    beforeRender({ data }) {
      // 资源路径
      const resPath = data.pluResPath;
      // 布局路径
      const layoutPath = data.pluResPath + 'common/layout/';
      // 当前的渲染路径
      const renderPathFull = data.pluResPath + renderPath.split('/')[0] + '/';
      // 合并数据
      return {
        // 玩家信息
        player: e?.playerCard?.player,
        // 玩家头像
        avatar: e?.playerCard?.avatar,
        // 传入的数据
        ...data,
        // 资源路径
        _res_path: resPath,
        // 布局路径
        _layout_path: layoutPath,
        // 默认布局路径
        defaultLayout: path.join(layoutPathFull, 'index.html'),
        // 系统配置
        sys: {
          // 缩放比例
          scale: pct,
          // 资源路径
          resourcesPath: resPath,
          // 当前渲染的路径
          currentPath: renderPathFull,
          /**
           * 下面两个模块的作用在于，你可以在你的布局文件中使用这两个模块，就可以显示用户信息和特殊标题，使用方法如下：
           * 1. 展示玩家信息：首先你要在查询的时候调用`this.getPlayerInfo()`，这样，玩家数据就会保存在`e.playerCard`中，然后你就可以在布局文件中使用`{{include sys.playerInfo}}`来展示玩家信息。
           * 2. 展示特殊标题：你可以在布局文件中使用`<% include(sys.specialTitle, {en: 'PROPERTY' , cn: '属性' , count: 6 }) %>`来展示特殊标题，其中`count`为可选参数，默认为9。
           */
          // 玩家信息模块
          playerInfo: path.join(layoutPathFull, 'playerinfo.html'),
          // 特殊标题模块
          specialTitle: path.join(layoutPathFull, 'specialtitle.html'),
          // 版权信息
          copyright: `Created By ${version.name}<span class="version">${version.yunzai}</span> & ${pluginName}<span class="version">${version.version}</span>`,
          // 版权信息（简化版）
          createdby: `Created By <div class="highlight"><span>${pluginName}</span><div class="version">${version.version}</div></div> & Powered By <div class="highlight">ZZZure</div>`,
        },
        quality: 100,
      };
    },
  });
};

export default render;
