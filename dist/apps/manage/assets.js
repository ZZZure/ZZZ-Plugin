import fs from 'fs';
import { getRoleImage, getRoleCircleImage, getSmallSquareAvatar, getSquareAvatar, getSuitImage, getWeaponImage, getHakushCharacter, getHakushWeapon, getSquareBangboo, } from '../../lib/download.js';
import { char } from '../../lib/convert.js';
import { getAllSuitID } from '../../lib/convert/equip.js';
import { getAllWeaponID } from '../../lib/convert/weapon.js';
import { getAllBangbooID } from '../../lib/convert/bangboo.js';
import * as LocalURI from '../../lib/download/const.js';
let downloading = false;
export async function downloadAll(e) {
    e ||= this.e;
    if (!e.isMaster)
        return false;
    if (downloading) {
        return e.reply('下载任务正在进行中，请稍后再试', false, { at: true, recallMsg: 100 });
    }
    const charIDs = char.getAllCharactersID();
    const equipSprites = getAllSuitID();
    const weaponSprites = getAllWeaponID();
    const bangbooIDs = getAllBangbooID();
    const result = {
        images: {
            char: {
                success: 0,
                failed: 0,
                total: charIDs.length
            },
            charSmallSquare: {
                success: 0,
                failed: 0,
                total: charIDs.length
            },
            charCircle: {
                success: 0,
                failed: 0,
                total: charIDs.length
            },
            charSquare: {
                success: 0,
                failed: 0,
                total: charIDs.length
            },
            equip: {
                success: 0,
                failed: 0,
                total: equipSprites.length
            },
            weapon: {
                success: 0,
                failed: 0,
                total: weaponSprites.length
            },
            bangboo: {
                success: 0,
                failed: 0,
                total: bangbooIDs.length
            }
        },
        hakush: {
            char: {
                success: 0,
                failed: 0,
                total: charIDs.length
            },
            equip: {
                success: 0,
                failed: 0,
                total: equipSprites.length
            }
        }
    };
    downloading = true;
    await e.reply('开始下载全部资源：代理人、音擎、驱动盘、邦布图片等，请耐心等待……', false, { at: true, recallMsg: 100 });
    const downloadFnc = async (fnc, id, info) => {
        try {
            const res = await fnc(id);
            if (res) {
                info.success++;
            }
            else {
                info.failed++;
            }
        }
        catch (err) {
            info.failed++;
            logger.error(`下载资源错误：${fnc.name}(${id})`, err);
        }
    };
    for (const id of charIDs) {
        await downloadFnc(getSquareAvatar, id, result.images.charSquare);
        await downloadFnc(getSmallSquareAvatar, id, result.images.charSmallSquare);
        await downloadFnc(getRoleImage, id, result.images.char);
        await downloadFnc(getRoleCircleImage, id, result.images.charCircle);
        await downloadFnc(getHakushCharacter, id, result.hakush.char);
    }
    for (const sprite of equipSprites) {
        await downloadFnc(getSuitImage, sprite, result.images.equip);
    }
    for (const sprite of weaponSprites) {
        await downloadFnc(getWeaponImage, sprite, result.images.weapon);
        await downloadFnc(getHakushWeapon, sprite, result.hakush.equip);
    }
    for (const id of bangbooIDs) {
        await downloadFnc(getSquareBangboo, id, result.images.bangboo);
    }
    const generateMsg = (name, data) => `${name}：总数${data.total}，成功${data.success}，失败${data.failed}`;
    const messages = [
        '资源下载完成（成功包含已下载资源）',
        generateMsg('角色图', result.images.char),
        generateMsg('角色头像图', result.images.charSquare),
        generateMsg('角色圆形图', result.images.charCircle),
        generateMsg('角色头像图(练度统计)', result.images.charSmallSquare),
        generateMsg('驱动盘套装图', result.images.equip),
        generateMsg('武器图', result.images.weapon),
        generateMsg('邦布图', result.images.bangboo),
        generateMsg('Hakush角色数据', result.hakush.char),
        generateMsg('Hakush驱动盘数据', result.hakush.equip),
        '注：下载失败可能缘于该资源尚处于内测中'
    ];
    downloading = false;
    await e.reply(messages.join('\n'));
}
export async function deleteAll(e) {
    e ||= this.e;
    if (!e.isMaster)
        return false;
    await e.reply('【注意】正在删除所有资源图片，后续使用需要重新下载！', false, { at: true, recallMsg: 100 });
    for (const dir of Object.values(LocalURI)) {
        logger.debug(`删除文件夹：${dir}`);
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    }
    await e.reply('资源图片已删除！', false, { at: true, recallMsg: 100 });
}
//# sourceMappingURL=assets.js.map