import fs from 'fs';
import {
  getRoleImage,
  getSmallSquareAvatar,
  getSquareAvatar,
  getSuitImage,
  getWeaponImage,
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
  };
  await this.reply(
    '开始下载资源，注意，仅支持下载面板的角色图、武器图、套装图，以及角色卡片的角色头像图。暂不支持下载邦布头像。',
    false,
    { at: true, recallMsg: 100 }
  );
  for (const id of charIDs) {
    try {
      await getSquareAvatar(id);
      result.charSquare.success++;
    } catch (error) {
      logger.error('getSquareAvatar', id, error);
      result.charSquare.failed++;
    }
    try {
      await getSmallSquareAvatar(id);
      result.charSmallSquare.success++;
    } catch (error) {
      logger.error('getSmallSquareAvatar', id, error);
      result.charSmallSquare.failed++;
    }
    try {
      await getRoleImage(id);
      result.char.success++;
    } catch (error) {
      logger.error('getRoleImage', id, error);
      result.char.failed++;
    }
  }
  for (const sprite of equipSprites) {
    try {
      await getSuitImage(sprite);
      result.equip.success++;
    } catch (error) {
      logger.error('getSuitImage', sprite, error);
      result.equip.failed++;
    }
  }
  for (const sprite of weaponSprites) {
    try {
      await getWeaponImage(sprite);
      result.weapon.success++;
    } catch (error) {
      logger.error('getWeaponImage', sprite, error);
      result.weapon.failed++;
    }
  }
  const messages = [
    '资源下载完成（成功的包含先前下载的图片）',
    `角色图需下载${charIDs.length}张，成功${result.char.success}张，失败${result.char.failed}张`,
    `角色头像图需下载${charIDs.length}张，成功${esult.charSquare.success}张，失败${result.charSquare.failed}张`,
    `角色头像图(练度统计)需下载${charIDs.length}张，成功${result.charSmallSquare.success}张，失败${result.charSmallSquare.failed}张`,
    `驱动盘套装图需下载${equipSprites.length}张，成功${result.equip.success}张，失败${result.equip.failed}张`,
    `武器图需下载${weaponSprites.length}张，成功${result.weapon.success}张，失败${result.weapon.failed}张`,
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
  for (const dir of LocalURI) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
  }
  await this.reply('资源图片已删除！', false, { at: true, recallMsg: 100 });
}
