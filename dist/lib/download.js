import * as convert from './convert.js';
import { downloadMysImage, downloadResourceImage, downloadHakushFile, } from './download/download.js';
export const getSquareAvatar = async (charID) => {
    let result = '';
    const sprite = convert.char.idToSprite(charID);
    if (sprite) {
        const filename = `IconRoleCrop${sprite}.webp`;
        result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_SQUARE_AVATAR_PATH', filename);
    }
    if (!result) {
        const filename = `role_square_avatar_${charID}.png`;
        result = await downloadMysImage('ZZZ_SQUARE_AVATAR_V2', 'ZZZ_SQUARE_AVATAR_PATH', filename);
    }
    return result;
};
export const getSmallSquareAvatar = async (charID) => {
    const sprite = convert.char.idToSprite(charID);
    if (!sprite)
        return null;
    let filename = `IconRoleGeneral${sprite}.png`;
    let result = '';
    result = await downloadResourceImage('role_general', 'ZZZ_SMALL_SQUARE_AVATAR_PATH', filename);
    if (!result) {
        filename = `IconRoleSelect${sprite}.webp`;
        result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_SMALL_SQUARE_AVATAR_PATH', filename);
    }
    return result;
};
export const getSquareBangboo = async (bangbooId) => {
    let result = '';
    const sprite = convert.bangboo.idToSprite(bangbooId);
    if (sprite) {
        const filename = `BangbooGarageRole${sprite}.webp`;
        result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_SQUARE_BANGBOO_PATH', filename);
    }
    const filename = `bangboo_rectangle_avatar_${bangbooId}.png`;
    if (!result) {
        result = await downloadResourceImage('square_bangbo', 'ZZZ_SQUARE_BANGBOO_PATH', filename);
    }
    if (!result)
        result = await downloadMysImage('ZZZ_SQUARE_BANGBOO_V2', 'ZZZ_SQUARE_BANGBOO_PATH', filename);
    return result;
};
export const getWeaponImage = async (id) => {
    const name = convert.weapon.idToFileName(id);
    if (!name)
        return null;
    let result = '';
    const filename = `${name}_High.png`;
    result = await downloadResourceImage('weapon', 'ZZZ_WEAPON_PATH', filename);
    if (!result) {
        const filename = `${name}.webp`;
        result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_WEAPON_PATH', filename);
    }
    return result;
};
export const getRoleImage = async (id, skin_id) => {
    const sprite = convert.char.idToSprite(id);
    if (!sprite)
        return null;
    let result = '';
    let filename = `IconRole${sprite}.png`;
    if (!skin_id) {
        result = await downloadResourceImage('role', 'ZZZ_ROLE_PATH', filename);
    }
    if (!result) {
        if (skin_id) {
            filename = `${convert.char.skinIdToFilename(id, skin_id) || `IconRole${sprite}`}.webp`;
        }
        else {
            filename = `IconRole${sprite}.webp`;
        }
        result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_ROLE_PATH', filename);
    }
    return result;
};
export const getRoleCircleImage = async (id) => {
    const sprite = convert.char.idToSprite(id);
    if (!sprite)
        return null;
    let result = '';
    let filename = `IconRoleCircle${sprite}.png`;
    result = await downloadResourceImage('role_circle', 'ZZZ_ROLE_CIRCLE_PATH', filename);
    if (!result) {
        filename = `IconRoleCircle${sprite}.webp`;
        result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_ROLE_CIRCLE_PATH', filename);
    }
    return result;
};
export const getSuitImage = async (suitId) => {
    const suitName = convert.equip.idToSprite(suitId);
    if (!suitName)
        return null;
    const filename = `${suitName}.png`;
    let result = '';
    result = await downloadResourceImage('suit', 'ZZZ_SUIT_PATH', filename);
    if (!result) {
        const filename = `${suitName}.webp`;
        result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_ZZZ_SUIT_PATH', filename);
    }
    return result;
};
export const getSuit3DImage = async (suitId) => {
    const suitName = convert.equip.idToSprite(suitId);
    const filename = `${suitName}_3d.png`;
    const result = await downloadResourceImage('suit_3d', 'ZZZ_SUIT_3D_PATH', filename);
    return result;
};
export const getHakushCharacter = async (charId) => {
    const filename = `${charId}.json`;
    const result = await downloadHakushFile('ZZZ_CHARACTER', 'HAKUSH_CHARACTER_DATA_PATH', filename);
    return result;
};
export const getHakushWeapon = async (weaponId) => {
    const filename = `${weaponId}.json`;
    const result = await downloadHakushFile('ZZZ_WEAPON', 'HAKUSH_WEAPON_DATA_PATH', filename);
    return result;
};
export const getHakushUI = async (filename) => {
    const result = await downloadHakushFile('ZZZ_UI', 'HAKUSH_UI_PATH', filename);
    return result;
};
//# sourceMappingURL=download.js.map