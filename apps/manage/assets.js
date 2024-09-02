import fs from 'fs';
import {
  getRoleImage,
  getRoleCircleImage,
  getSmallSquareAvatar,
  getSquareAvatar,
  getSuitImage,
  getWeaponImage,
  getHakushCharacter,
  getHakushWeapon,
} from '../../lib/download.js';
import { char } from '../../lib/convert.js';
import { getAllEquipID } from '../../lib/convert/equip.js';
import { getAllWeaponID } from '../../lib/convert/weapon.js';
import * as LocalURI from '../../lib/download/const.js';

export async function downloadAll() {
  if (!this.e.isMaster) return false;
  const charIDs = char.getAllCharactersID();
  const equipSprites = getAllEquipID();
  const weaponSprites = getAllWeaponID();
  const result = {
    images: {
      char: {
        success: 0,
        failed: 0,
        total: charIDs.length,
      },
      charSmallSquare: {
        success: 0,
        failed: 0,
        total: charIDs.length,
      },
      charCircle: {
        success: 0,
        failed: 0,
        total: charIDs.length,
      },
      charSquare: {
        success: 0,
        failed: 0,
        total: charIDs.length,
      },
      equip: {
        success: 0,
        failed: 0,
        total: equipSprites.length,
      },
      weapon: {
        success: 0,
        failed: 0,
        total: weaponSprites.length,
      },
    },
    hakush: {
      char: {
        success: 0,
        failed: 0,
        total: charIDs.length,
      },
      equip: {
        success: 0,
        failed: 0,
        total: equipSprites.length,
      },
    },
  };
  await this.reply(
    '开始下载资源，注意，仅支持下载面板的角色图、武器图、套装图，以及角色卡片的角色头像图。暂不支持下载邦布头像。',
    false,
    { at: true, recallMsg: 100 }
  );
  for (const id of charIDs) {
    try {
      await getSquareAvatar(id);
      result.images.charSquare.success++;
    } catch (error) {
      logger.error('getSquareAvatar', id, error);
      result.images.charSquare.failed++;
    }
    try {
      await getSmallSquareAvatar(id);
      result.images.charSmallSquare.success++;
    } catch (error) {
      logger.error('getSmallSquareAvatar', id, error);
      result.images.charSmallSquare.failed++;
    }
    try {
      await getRoleImage(id);
      result.images.char.success++;
    } catch (error) {
      logger.error('getRoleImage', id, error);
      result.images.char.failed++;
    }
    try {
      await getRoleCircleImage(id);
      result.images.charCircle.success++;
    } catch (error) {
      logger.error('getRoleCircleImage', id, error);
      result.images.charCircle.failed++;
    }
    try {
      await getHakushCharacter(id);
      result.hakush.char.success++;
    } catch (error) {
      logger.error('getHakushCharacter', id, error);
      result.hakush.char.failed++;
    }
  }
  for (const sprite of equipSprites) {
    try {
      await getSuitImage(sprite);
      result.images.equip.success++;
    } catch (error) {
      logger.error('getSuitImage', sprite, error);
      result.images.equip.failed++;
    }
  }
  for (const sprite of weaponSprites) {
    try {
      await getWeaponImage(sprite);
      result.images.weapon.success++;
    } catch (error) {
      logger.error('getWeaponImage', sprite, error);
      result.images.weapon.failed++;
    }
    try {
      await getHakushWeapon(sprite);
      result.hakush.equip.success++;
    } catch (error) {
      logger.error('getHakushWeapon', sprite, error);
      result.hakush.equip.failed++;
    }
  }
  const messages = [
    '资源下载完成（成功的包含先前下载的资源）',
    `角色图需下载${charIDs.length}张，成功${result.images.char.success}张，失败${result.images.char.failed}张`,
    `角色头像图需下载${charIDs.length}张，成功${result.images.charSquare.success}张，失败${result.images.charSquare.failed}张`,
    `角色圆形图需下载${charIDs.length}张，成功${result.images.charCircle.success}张，失败${result.images.charCircle.failed}张`,
    `角色头像图(练度统计)需下载${charIDs.length}张，成功${result.images.charSmallSquare.success}张，失败${result.images.charSmallSquare.failed}张`,
    `驱动盘套装图需下载${equipSprites.length}张，成功${result.images.equip.success}张，失败${result.images.equip.failed}张`,
    `武器图需下载${weaponSprites.length}张，成功${result.images.weapon.success}张，失败${result.images.weapon.failed}张`,
    `Hakush角色数据需下载${charIDs.length}个，成功${result.hakush.char.success}张，失败${result.hakush.char.failed}个`,
    `Hakush驱动盘数据需下载${equipSprites.length}个，成功${result.hakush.equip.success}张，失败${result.hakush.equip.failed}个`,
  ];
  await this.reply(messages.join('\n'));
}
export async function deleteAll() {
  if (!this.e.isMaster) return false;
  await this.reply(
    '【注意】正在删除所有资源图片，后续使用需要重新下载！',
    false,
    { at: true, recallMsg: 100 }
  );
  // 将 localURI 值迭代删除
  for (const dir of Object.values(LocalURI)) {
    logger.debug(`删除文件夹：${dir}`);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
  }
  await this.reply('资源图片已删除！', false, { at: true, recallMsg: 100 });
}
