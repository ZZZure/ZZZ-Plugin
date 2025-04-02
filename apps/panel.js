import { ZZZPlugin } from '../lib/plugin.js';
import {
  getPanelList,
  refreshPanel as refreshPanelFunction,
  getPanelOrigin,
  updatePanelData,
  formatPanelData,
  getPanelListOrigin,
} from '../lib/avatar.js';
import settings from '../lib/settings.js';
import _ from 'lodash';
import { rulePrefix } from '../lib/common.js';
import { getZzzEnkaData } from '../lib/ekapi/query.js'
import { _enka_data_to_mys_data } from '../lib/ekapi/enka_to_mys.js'

export class Panel extends ZZZPlugin {
  constructor() {
    super({
      name: '[ZZZ-Plugin]Panel',
      dsc: 'zzzpanel',
      event: 'message',
      priority: _.get(settings.getConfig('priority'), 'panel', 70),
      rule: [
        {
          reg: `${rulePrefix}(.*)面板(刷新|更新|列表)?$`,
          fnc: 'handleRule',
        },
        {
          reg: `${rulePrefix}练度(统计)?$`,
          fnc: 'proficiency',
        },
        {
          reg: `${rulePrefix}原图$`,
          fnc: 'getCharOriImage',
        },
      ],
      handler: [
        { key: 'zzz.tool.panel', fn: 'getCharPanelTool' },
        { key: 'zzz.tool.panelList', fn: 'getCharPanelListTool' },
      ],
    });
  }
  async handleRule() {
    if (!this.e.msg) return;
    const reg = new RegExp(`${rulePrefix}(.*)面板(刷新|更新|列表)?$`);
    const pre = this.e.msg.match(reg)[4]?.trim();
    const suf = this.e.msg.match(reg)[5]?.trim();
    if (['刷新', '更新'].includes(pre) || ['刷新', '更新'].includes(suf))
      return await this.refreshPanel();
    if (!pre || suf === '列表') return await this.getCharPanelList();
    const queryPanelReg = new RegExp(`${rulePrefix}(.*)面板$`);
    if (queryPanelReg.test(this.e.msg)) return await this.getCharPanel();
    return false;
  }
// async refreshPanel() {
//     const uid = await this.getUID();
//     // ... 省略获取 lastQueryTime 和冷卻时间判断的代码 ...
//     this.result = null; // 先清空结果
//
//     const useEnka = _.get(settings.getConfig('config'), 'useEnka', false);
//     logger.mark(`[panel.js] useEnka 设置值: ${useEnka}`); // 1. 确认是否启用 Enka 逻辑
//
//     if (useEnka) { // 检查这个 if 是否进入
//       logger.mark('[panel.js] 进入 useEnka 逻辑块');
//       let enkaData = null; // 初始化 enkaData
//       try {
//         logger.mark(`[panel.js] 准备调用 getZzzEnkaData for UID: ${uid}`);
//         enkaData = await getZzzEnkaData(uid);
//         logger.mark('[panel.js] getZzzEnkaData 调用完成');
//
//         // 2. 详细检查 enkaData 的状态
//         if (enkaData === null || enkaData === undefined) {
//            logger.error('[panel.js] getZzzEnkaData 返回了 null 或 undefined');
//            await this.reply('获取Enka数据失败 (返回null/undefined)，请稍后再试');
//            return false;
//         } else if (enkaData === -1) {
//            logger.warn('[panel.js] getZzzEnkaData 返回了 -1 (表示获取失败)');
//            await this.reply('获取Enka数据失败 (返回-1)，请稍后再试');
//            return false;
//         } else if (!enkaData.PlayerInfo || !enkaData.PlayerInfo.ShowcaseDetail || !enkaData.PlayerInfo.ShowcaseDetail.AvatarList) {
//             logger.error('[panel.js] 获取到的 enkaData 结构不完整:', enkaData);
//             await this.reply('获取到的Enka数据结构不完整，无法处理');
//             return false;
//         } else {
//              logger.mark('[panel.js] 成功获取到有效的 enkaData 结构');
//              console.log('[panel.js] enkaData.PlayerInfo.ShowcaseDetail.AvatarList:', enkaData.PlayerInfo.ShowcaseDetail.AvatarList); // 打印角色列表确认
//         }
//
//         // 3. 检查 _enka_data_to_mys_data 函数是否已正确导入
//         if (typeof _enka_data_to_mys_data !== 'function') {
//           logger.error('[panel.js] _enka_data_to_mys_data 不是一个函数! 请检查导入语句和文件是否存在。');
//           await this.reply('内部错误：数据转换函数加载失败');
//           return false;
//         }
//
//         logger.mark('[panel.js] _enka_data_to_mys_data 函数已找到，类型:', typeof _enka_data_to_mys_data);
//         logger.mark('[panel.js] 即将调用 _enka_data_to_mys_data...');
//
//         // 4. 使用 try...catch 包裹调用，捕获可能的内部错误
//         try {
//           this.result = await _enka_data_to_mys_data(enkaData);
//           logger.mark('[panel.js] _enka_data_to_mys_data 调用完成。');
//           // 在这里可以检查 this.result 是否是你期望的格式
//           console.log('[panel.js] 转换后的 result (部分示例):', this.result ? JSON.stringify(this.result[0], null, 2).substring(0, 500) + '...' : 'null or empty');
//         } catch (conversionError) {
//           logger.error('[panel.js] 调用 _enka_data_to_mys_data 时发生严重错误:', conversionError);
//           // 打印详细错误堆栈
//           console.error(conversionError);
//           await this.reply(`处理Enka数据时出错: ${conversionError.message}`);
//           return false; // 出错则不再继续
//         }
//
//       } catch (fetchError) {
//         // 这个 catch 捕获 getZzzEnkaData 自身的 await 可能抛出的错误
//         logger.error('[panel.js] 调用 getZzzEnkaData 时发生错误:', fetchError);
//         console.error(fetchError); // 打印错误堆栈
//         await this.reply(`获取Enka数据时发生网络或API错误: ${fetchError.message}`);
//         return false;
//       }
//
//     } else { // 如果 useEnka 是 false
//       logger.mark('[panel.js] 未启用 useEnka，跳过 Enka 面板逻辑');
//       // 这里可以继续执行原有的 mysapi 逻辑（如果需要的话）
//       // logger.mark('mysapi执行');
//       // ... (原有的 mysapi 刷新逻辑) ...
//       // 注意：如果 useEnka 为 false，this.result 可能需要从 mysapi 获取
//     }
//
//     // ----- 后续处理 this.result 的代码 -----
//     // （确保无论走 Enka 逻辑还是 mysapi 逻辑，this.result 都有合适的值）
//
//     // 例如，原有的 newChar 计算和渲染逻辑:
//     if (this.result && Array.isArray(this.result)) { // 检查 this.result 是否有效
//         const newChar = this.result.filter(item => item.isNew); // 假设 MYS 数据结构中有 isNew
//         const finalData = {
//           newChar: newChar.length,
//           list: this.result, // 使用转换后的或 mysapi 的结果
//         };
//         await this.render('panel/refresh.html', finalData);
//     } else if (!useEnka) {
//         // 如果没用 Enka 且没有执行 mysapi 逻辑（或 mysapi 逻辑没产生 result），可能需要提示
//         logger.warn('[panel.js] 没有可用的面板数据用于渲染 (useEnka=false, result无效)');
//         // 可能需要添加回复告诉用户没有数据？
//     } else if (useEnka && (!this.result || this.result.length === 0)) {
//          logger.warn('[panel.js] Enka 数据转换后结果为空或无效');
//          // 根据需要决定是否回复用户
//     }
//
//   }

  //   async refreshPanel() {
  //   const uid = await this.getUID();
  //   const lastQueryTime = await redis.get(`ZZZ:PANEL:${uid}:LASTTIME`);
  //   const panelSettings = settings.getConfig('panel');
  //   const coldTime = _.get(panelSettings, 'interval', 300);
  //   this.result = null; // Initialize instance result
  //
  //   // --- Enka Path ---
  //   if(_.get(settings.getConfig('config'), 'useEnka', false)){ // Default is false if setting missing
  //     logger.mark('enka面板执行')
  //     const enkaData = await getZzzEnkaData(uid); // Fetch Enka data
  //
  //     // --- Issue 1: Check for failure *before* processing ---
  //     if (enkaData === -1) { // Check for specific failure code
  //       await this.reply('获取enka数据失败，请稍后再试');
  //       return false; // Exit early
  //     }
  //     // Add more checks for null/undefined/incomplete data if needed here
  //
  //     console.log('[panel.js] 获取到 enkaData，准备转换...');
  //     console.log('Enka AvatarList:', enkaData?.PlayerInfo?.ShowcaseDetail?.AvatarList);
  //     console.log('[panel.js] 即将调用 _enka_data_to_mys_data...');
  //
  //     // --- This is where previous errors occurred due to name_convert.js load failure ---
  //     // Assuming name_convert.js path fix is applied, this should now work
  //     this.result = await _enka_data_to_mys_data(enkaData); // Assign to instance variable
  //     logger.mark('[panel.js] _enka_data_to_mys_data 调用完成.'); // Added log for confirmation
  //
  //   // --- MYS API Path ---
  //   } else {
  //     logger.mark('mysapi执行')
  //     if (lastQueryTime && Date.now() - lastQueryTime < 1000 * coldTime) {
  //       await this.reply(`${coldTime}秒内只能刷新一次，请稍后再试`);
  //       return false;
  //     }
  //     const { api } = await this.getAPI();
  //     await redis.set(`ZZZ:PANEL:${uid}:LASTTIME`, Date.now());
  //     await this.reply('正在刷新面板列表，请稍候...');
  //     await this.getPlayerInfo(); // Assumed necessary for MYS panel
  //
  //     // --- Issue 2: Assign result correctly ---
  //     let mysResult = null; // Use a temporary variable for MYS result
  //     try {
  //       mysResult = await refreshPanelFunction(api); // Call the imported MYS refresh
  //       console.dir('MYS API res:', mysResult); // Log MYS result
  //       if (!mysResult) {
  //         await this.reply('面板列表刷新失败 (MYS API)，请稍后再试');
  //         return false;
  //       }
  //       // Assign the successful MYS result to the instance variable
  //       this.result = mysResult; // <<<< IMPORTANT ASSIGNMENT
  //     } catch (e) {
  //        this.reply(e.message);
  //        // Consider logging the full error for debugging
  //        logger.error("MYS API refresh failed:", e);
  //        // Depending on desired behavior, you might return false or re-throw
  //        return false; // Exit on MYS API error
  //     }
  //   } // End if/else
  //
  //   // --- Post-processing: Use this.result consistently ---
  //   // Ensure this.result is an array before proceeding
  //   if (!this.result || !Array.isArray(this.result)) {
  //       logger.error('[panel.js] 最终结果无效或不是数组:', this.result);
  //       // Maybe reply to the user that no data could be processed
  //       await this.reply('未能获取或处理有效的面板数据。');
  //       return false;
  //   }
  //
  //   // --- Issue 3: Use this.result for calculations ---
  //   // Filter based on the unified this.result
  //   const newChar = this.result.filter(item => item && item.isNew); // Added check for item existence
  //
  //   // Prepare final data using the unified this.result
  //   const finalData = {
  //     newChar: newChar.length,
  //     list: this.result, // Use the instance variable
  //   };
  //
  //   // Render the result
  //   await this.render('panel/refresh.html', finalData);
  // }
    async refreshPanel() {
    const uid = await this.getUID();
    // --- 获取玩家信息 (带容错处理) ---
    // ... (这部分代码保持不变，使用带有占位符逻辑的版本) ...
    logger.mark('[panel.js] 准备调用 getPlayerInfo...');
    let playerInfo = null;
    try {
      playerInfo = await this.getPlayerInfo();
      if (!playerInfo) playerInfo = this.e.player;
      if (!playerInfo) {
          logger.warn(`[panel.js] getPlayerInfo 未返回有效信息，使用默认占位。UID: ${uid}`);
          playerInfo = { uid: uid, nickname: `用户${uid}`, level: '??', region_name: '未知服务器' };
      }
      logger.mark('[panel.js] getPlayerInfo 尝试完成.');
    } catch (playerInfoError) {
        logger.error('[panel.js] 调用 getPlayerInfo 时出错 (使用占位):', playerInfoError.message);
        playerInfo = { uid: uid, nickname: `用户${uid}`, level: '??', region_name: '错误', error: playerInfoError.message };
    }
    // --- End 获取玩家信息 ---

    this.result = null; // 初始化结果

    // ----- 选择 Enka 或 MYS API -----
    const useEnka = _.get(settings.getConfig('config'), 'useEnka', true); // 读取配置，Enka 优先
    logger.mark(`[panel.js] useEnka 设置值: ${useEnka}`);
    // ----- End -----

    // --- 数据获取和处理逻辑 ---
    if (useEnka) {
      logger.mark('[panel.js] 进入 Enka 逻辑块');
      try {
        const enkaData = await getZzzEnkaData(uid);

        logger.mark('[panel.js] getZzzEnkaData 调用完成.'); // <-- 日志：调用后

        // ----- !!! 在这里添加打印原始 Enka 数据的日志 !!! -----
        console.log('===== ZZZ Enka Raw Data Start =====');
        // 使用 JSON.stringify 完整打印，null, 2 用于格式化输出
        console.log(JSON.stringify(enkaData, null, 2));
        console.log('===== ZZZ Enka Raw Data End =====');
        // ----- !!! 日志添加结束 !!! -----

        if (!enkaData || enkaData === -1 || !enkaData.PlayerInfo) { throw new Error('获取或验证 Enka 数据失败'); }
        logger.mark('[panel.js] 即将调用 _enka_data_to_mys_data...');
        this.result = await _enka_data_to_mys_data(enkaData); // <<< Enka 结果赋给 this.result
        logger.mark('[panel.js] _enka_data_to_mys_data 调用完成.');

    // ----- !!! 在这里添加打印转换后数据的日志 !!! -----
    console.log('===== Enka Converted Data (First Avatar) Start =====');
    if (this.result && Array.isArray(this.result) && this.result.length > 0) {
        console.log(JSON.stringify(this.result[0], null, 2)); // 打印第一个转换后的角色
    } else {
        console.log('Converted result is empty or invalid.');
    }
    console.log('===== Enka Converted Data (First Avatar) End =====');
    // ----- !!! 日志添加结束 !!! -----
        logger.mark('[panel.js] _enka_data_to_mys_data 调用完成.');
      } catch (enkaError) {
         logger.error('[panel.js] 处理 Enka 逻辑时出错:', enkaError);
         await this.reply(`处理Enka数据时出错: ${enkaError.message}`);
         return false;
      }
    } else {
      logger.mark('[panel.js] 进入 mysapi 逻辑块');
      try {
          const { api } = await this.getAPI(); // MYS 需要 api 对象
          // MYS 逻辑需要冷却判断
          const lastQueryTime = await redis.get(`ZZZ:PANEL:${uid}:LASTTIME`);
          const panelSettings = settings.getConfig('panel');
          const coldTime = _.get(panelSettings, 'interval', 300);
          if (lastQueryTime && Date.now() - lastQueryTime < 1000 * coldTime) {
              await this.reply(`${coldTime}秒内只能刷新一次，请稍后再试`);
              return false;
          }
          await redis.set(`ZZZ:PANEL:${uid}:LASTTIME`, Date.now());
          await this.reply('正在刷新面板列表 (MYS API)，请稍候...');

          const mysResult = await refreshPanelFunction(api); // 调用 MYS 刷新函数
          if (!mysResult) { throw new Error('MYS API 返回空结果'); }
          this.result = mysResult; // <<< MYS 结果赋给 this.result
          logger.mark('[panel.js] MYS API refreshPanelFunction 调用完成.');
      } catch (mysError) {
          logger.error('[panel.js] MYS API 刷新出错:', mysError);
          this.reply(`MYS API 刷新出错: ${mysError.message}`);
          return false;
      }
    }
    // --- End 数据获取和处理逻辑 ---


    // --- !!! 关键步骤：更新面板数据缓存 !!! ---
    if (this.result && Array.isArray(this.result)) { // 确保有有效数据 (非 null, 是数组)
      // 并且至少包含一个角色数据才存，避免存空数组？(可选)
      if (this.result.length > 0) {
          try {
            logger.mark(`[panel.js] 准备调用 updatePanelData 更新缓存，包含 ${this.result.length} 个角色数据...`);
            // 调用导入的 updatePanelData 函数
            await updatePanelData(uid, this.result); // <<< 核心：写入缓存
            logger.mark('[panel.js] updatePanelData 调用完成，缓存已更新。');
          } catch (cacheError) {
            logger.error('[panel.js] 调用 updatePanelData 更新缓存时出错:', cacheError);
            // 记录错误，但可能继续
          }
      } else {
          logger.warn('[panel.js] 获取到的角色列表为空数组，不执行缓存更新。');
          // 如果是 Enka 路径且展示柜为空，这是正常情况
      }
    } else {
      logger.warn('[panel.js] 没有有效的角色列表数据 (this.result)，跳过缓存更新。');
      // 如果之前的步骤没有 return false，这里可能需要提示用户
      if (!useEnka) { // MYS 失败的情况
          await this.reply('未能获取或处理有效的面板列表数据。');
          return false; // 如果 MYS 失败且结果无效，应该退出
      }
      // 如果是 Enka 路径且结果无效/非数组，也提示并退出
      await this.reply('处理后的面板数据格式无效。');
      return false;
    }
    // --- !!! End 更新缓存 !!! ---


    // --- 后续处理：构建 finalData 用于渲染刷新摘要 ---
    const currentResult = this.result || []; // 保证 currentResult 是数组

    // newChar 的计算可能依赖于 MYS 的特定字段，Enka 结果可能没有
    // 保持之前的兼容逻辑，如果 Enka 结果没有 isNew，newCharCount 为 0
    const newCharCount = (currentResult.length > 0 && currentResult[0]?.isNew !== undefined)
                         ? currentResult.filter(item => item && item.isNew).length
                         : 0;

    const finalData = {
      newChar: newCharCount,
      list: currentResult,
      player: playerInfo,
      uid: uid
    };

    logger.mark('[panel.js] 准备渲染 refresh.html 模板...');

    // 渲染刷新摘要页面
    try {
        await this.render('panel/refresh.html', finalData);
    } catch (renderError) {
        logger.error('[panel.js] 渲染 refresh.html 模板失败:', renderError);
        await this.reply(`生成刷新结果图片时出错: ${renderError.message}`);
    }
  }

  async getCharPanelListTool(uid, origin = false) {
    if (!uid) {
      return false;
    }
    if (origin) {
      const result = getPanelListOrigin(uid);
      return result;
    }
    const result = getPanelList(uid);
    return result;
  }

  async getCharPanel() {
    const uid = await this.getUID();
    const reg = new RegExp(`${rulePrefix}(.+)面板$`);
    const match = this.e.msg.match(reg);
    if (!match) return false;
    const name = match[4];
    const data = getPanelOrigin(uid, name);
    if (!data) {
      await this.reply(`未找到角色${name}的面板信息，请先刷新面板`);
      return;
    }
    let handler = this.e.runtime.handler || {};

    if (handler.has('zzz.tool.panel')) {
      await handler.call('zzz.tool.panel', this.e, {
        uid,
        data: data,
        needSave: false,
      });
    }
    return false;
  }

  async getCharPanelTool(e, _data = {}) {
    if (e) this.e = e;
    if (e?.reply) this.reply = e.reply;

    const {
      uid = undefined,
      data = undefined,
      needSave = true,
      reply = true,
      needImg = true
    } = _data;
    if (!uid) {
      await this.reply('UID为空');
      return false;
    }
    if (!data) {
      await this.reply('数据为空');
      return false;
    }
    if (needSave) {
      updatePanelData(uid, [data]);
    }
    const timer = setTimeout(() => {
      const msg = '查询成功，正在下载图片资源，请稍候。'
      if (this?.reply && needImg) {
        this.reply(msg);
      } else {
        logger.mark(msg)
      }
    }, 5000);
    const parsedData = formatPanelData(data);
    await parsedData.get_detail_assets();
    clearTimeout(timer);
    const finalData = {
      uid,
      charData: parsedData,
    };
    const image = needImg ? await this.render('panel/card.html', finalData, {
      retType: 'base64',
    }) : needImg;

    if (reply) {
      const res = await this.reply(image);
      if (res?.message_id && parsedData.role_icon)
        await redis.set(
          `ZZZ:PANEL:IMAGE:${res.message_id}`,
          parsedData.role_icon,
          {
            EX: 3600 * 3,
          }
        );
      return {
        message: res,
        image,
      };
    }

    return image;
  }
  async proficiency() {
    const uid = await this.getUID();
    const result = getPanelList(uid);
    if (!result) {
      await this.reply('未找到面板数据，请先%刷新面板');
      return false;
    }
    await this.getPlayerInfo();
    result.sort((a, b) => {
      return b.proficiency_score - a.proficiency_score;
    });
    const WeaponCount = result.filter(item => item?.weapon).length,
      SWeaponCount = result.filter(
        item => item?.weapon && item.weapon.rarity === 'S'
      ).length;
    const general = {
      total: result.length,
      SCount: result.filter(item => item.rarity === 'S').length,
      SWeaponRate: (SWeaponCount / WeaponCount) * 100,
      SSSCount: result.reduce((acc, item) => {
        if (item.equip) {
          acc += item.equip.filter(
            equip => equip.comment === 'SSS' || equip.comment === 'ACE'
          ).length;
        }
        return acc;
      }, 0),
      highRank: result.filter(item => item.rank > 4).length,
    };
    const timer = setTimeout(() => {
      if (this?.reply) {
        this.reply('查询成功，正在下载图片资源，请稍候。');
      }
    }, 5000);
    for (const item of result) {
      await item.get_small_basic_assets();
    }
    clearTimeout(timer);
    const finalData = {
      general,
      list: result,
    };
    await this.render('proficiency/index.html', finalData);
  }
  async getCharOriImage() {
    let source;
    if (this.e.getReply) {
      source = await this.e.getReply();
    } else if (this.e.source) {
      if (this.e.group?.getChatHistory) {
        // 支持at图片添加，以及支持后发送
        source = (
          await this.e.group.getChatHistory(this.e.source?.seq, 1)
        ).pop();
      } else if (this.e.friend?.getChatHistory) {
        source = (
          await this.e.friend.getChatHistory(this.e.source?.time + 1, 1)
        ).pop();
      }
    }
    const id = source?.message_id;
    if (!id) {
      await this.reply('未找到消息源，请引用要查看的图片');
      return false;
    }
    const image = await redis.get(`ZZZ:PANEL:IMAGE:${id}`);
    if (!image) {
      await this.reply('未找到原图');
      return false;
    }
    await this.reply(segment.image(image));
    return false;
  }
}
