import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAP_PATH = __dirname;
const ALIAS_LIST_DIR = path.join(__dirname, 'alias');
const CHAR_ALIAS_FILE = path.join(ALIAS_LIST_DIR, 'char_alias.json');
const BASE_IMAGE_URL = 'https://enka.network';
const PartnerId2DataFile = 'PartnerId2Data.json';
const WeaponId2DataFile = 'WeaponId2Data.json';
const EquipId2DataFile = 'EquipId2Data.json';
const SkillParamFile = 'PartnerId2SkillParam.json';
const AvatarIconDataFile = 'avatars.json';


let PartnerId2SkillParam = {}; // 初始化技能数据对象
try {
    const skillParamPath = path.join(MAP_PATH, SkillParamFile);
    if (fs.existsSync(skillParamPath)) {
        const skillParamContent = fs.readFileSync(skillParamPath, { encoding: 'utf-8' });
        PartnerId2SkillParam = JSON.parse(skillParamContent);
        logger.debug(`[name_convert.js] 成功加载并解析 ${SkillParamFile}。`);

    } else {
         logger.error(`${SkillParamFile} 文件未找到于: ${skillParamPath}`);

    }
} catch (error) {
    console.error(`读取或解析 ${SkillParamFile} 时出错:`, error);

    PartnerId2SkillParam = {};
}

let char_alias_data = {};
try {
    // Ensure the alias directory exists before trying to read the file
    if (fs.existsSync(ALIAS_LIST_DIR) && fs.existsSync(CHAR_ALIAS_FILE)) {
        const charAliasContent = fs.readFileSync(CHAR_ALIAS_FILE, { encoding: 'utf-8' });
        char_alias_data = JSON.parse(charAliasContent);
    } else {
        console.warn(`Alias file not found at: ${CHAR_ALIAS_FILE}. Aliases will not be loaded.`);
    }
} catch (error) {
    console.error('Error reading or parsing char_alias.json:', error);
}

let partner_data = {};
try {
    const partnerDataPath = path.join(MAP_PATH, PartnerId2DataFile);
    if (fs.existsSync(partnerDataPath)) {
        const partnerDataContent = fs.readFileSync(partnerDataPath, { encoding: 'utf-8' });
        partner_data = JSON.parse(partnerDataContent);
        logger.debug(`[name_convert.js] 成功解析 JSON。`);
logger.debug(`[name_convert.js] 加载了 ${Object.keys(partner_data).length} 个伙伴条目。`);
logger.debug(`[name_convert.js] 加载后是否存在 "1191"? ${partner_data.hasOwnProperty('1191')}`);
logger.debug(`[name_convert.js] 加载后是否存在 "1021"? ${partner_data.hasOwnProperty('1021')}`);

    } else {
         console.error(`Partner data file not found at: ${partnerDataPath}`);
    }
} catch (error) {
    console.error(`Error reading or parsing ${PartnerId2DataFile}:`, error);
}

let weapon_data = {};
try {
    const weaponDataPath = path.join(MAP_PATH, WeaponId2DataFile);
     if (fs.existsSync(weaponDataPath)) {
        const weaponDataContent = fs.readFileSync(weaponDataPath, { encoding: 'utf-8' });
        weapon_data = JSON.parse(weaponDataContent);
    } else {
         console.error(`Weapon data file not found at: ${weaponDataPath}`);
    }
} catch (error) {
    console.error(`Error reading or parsing ${WeaponId2DataFile}:`, error);
}

let equip_data = {};
try {
    const equipDataPath = path.join(MAP_PATH, EquipId2DataFile);
     if (fs.existsSync(equipDataPath)) {
        const equipDataContent = fs.readFileSync(equipDataPath, { encoding: 'utf-8' });
        equip_data = JSON.parse(equipDataContent);
    } else {
         console.error(`Equipment data file not found at: ${equipDataPath}`);
    }
} catch (error) {
    console.error(`Error reading or parsing ${EquipId2DataFile}:`, error);
}

let avatar_icon_data = {}; // <--- 新增：用于存储 avatars.json 的数据
try {
    const avatarIconDataPath = path.join(MAP_PATH, AvatarIconDataFile);
    if (fs.existsSync(avatarIconDataPath)) {
        const avatarIconContent = fs.readFileSync(avatarIconDataPath, { encoding: 'utf-8' });
        avatar_icon_data = JSON.parse(avatarIconContent);
        console.log(`[name_convert.js] 成功加载并解析 ${AvatarIconDataFile}。`);
        console.log(`[name_convert.js] 从 ${AvatarIconDataFile} 加载了 ${Object.keys(avatar_icon_data).length} 个头像图标条目。`);
    } else {
        // 这个文件对于图标URL是必需的，所以用 error 级别
        console.error(`[name_convert.js] ${AvatarIconDataFile} 文件未找到于: ${avatarIconDataPath}。无法生成角色图标 URL。`);
        avatar_icon_data = {}; // 保证是个空对象
    }
} catch (error) {
    console.error(`[name_convert.js] 读取或解析 ${AvatarIconDataFile} 时出错:`, error);
    avatar_icon_data = {};
}

/**
 * Converts a character name alias to the canonical character name.
 * @param {string} char_name - The alias or canonical name entered by the user.
 * @returns {string} The canonical character name, or the original input if no alias is found.
 */

export function alias_to_char_name(char_name) {
    if (!char_name) return char_name; // Handle null/empty input
    const lowerCaseName = char_name.toLowerCase().trim(); // Normalize input

    for (const canonical_name in char_alias_data) {
        // Check if the input matches the canonical name (case-insensitive)
        if (lowerCaseName === canonical_name.toLowerCase()) {
            return canonical_name;
        }
        // Check if the input matches any alias in the array (case-insensitive)
        if (Array.isArray(char_alias_data[canonical_name])) {
            for (const alias of char_alias_data[canonical_name]) {
                if (lowerCaseName === String(alias).toLowerCase()) {
                    return canonical_name;
                }
            }
        }
    }
    // No alias found, return the original (trimmed) name
    return char_name.trim();
}


/**
 * Gets the sprite ID for a given character ID.
 * @param {string|number} char_id - The character ID.
 * @returns {string} The sprite ID, or a default ('28') if not found.
 */
export function char_id_to_sprite(char_id) {
    const charIdStr = String(char_id);
    // Corrected variable name: partner_data
    if (partner_data[charIdStr] && partner_data[charIdStr].sprite_id) {
        return partner_data[charIdStr].sprite_id;
    } else {
        // console.warn(`Sprite ID not found for character ID: ${charIdStr}. Using default.`);
        return '28'; // Default sprite ID (Rope Master?)
    }
}

/**
 * Gets the full name for a given character ID.
 * @param {string|number} char_id - The character ID.
 * @returns {string} The character's full name, or a default ('绳匠') if not found.
 */
export function char_id_to_full_name(char_id) {
    const charIdStr = String(char_id);
    // Corrected variable name: partner_data
    if (partner_data[charIdStr] && partner_data[charIdStr].full_name) {
        return partner_data[charIdStr].full_name;
    } else {
        // console.warn(`Full name not found for character ID: ${charIdStr}. Using default.`);
        return '绳匠'; // Default name (Rope Master)
    }
}

/**
 * Gets the sprite file name for a given equipment ID (relic).
 * @param {string|number} equip_id - The equipment ID.
 * @returns {string|undefined} The sprite file name, or undefined if not found.
 */
export function equip_id_to_sprite(equip_id) {
    const equipIdStr = String(equip_id);
    if (equipIdStr.length === 5) { // Assuming 5-digit IDs for relics
        const suit_id = equipIdStr.slice(0, 3) + '00'; // Derive suit ID
        if (equip_data[suit_id] && equip_data[suit_id].sprite_file) {
            return equip_data[suit_id].sprite_file;
        }
    }
    // console.warn(`Sprite file not found for equipment ID: ${equipIdStr}.`);
    return undefined; // Return undefined if not found
}


/**
 * Gets the short name for a given character ID.
 * @param {string|number} char_id - The character ID.
 * @returns {string|undefined} The character's short name, or undefined if not found.
 */
export function char_id_to_char_name(char_id) {
    const charIdStr = String(char_id);
    // Corrected variable name: partner_data
    if (partner_data[charIdStr] && partner_data[charIdStr].name) {
        return partner_data[charIdStr].name;
    } else {
        // console.warn(`Short name not found for character ID: ${charIdStr}.`);
        return undefined;
    }
}

/**
 * Gets the character ID for a given character name (handles aliases).
 * @param {string} char_name - The character name or alias.
 * @returns {string|undefined} The character ID (as a string), or undefined if not found.
 */
export function char_name_to_char_id(char_name) {
    if (!char_name) return undefined; // Handle null/empty input
    const canonicalName = alias_to_char_name(char_name); // Resolve alias first

    // Corrected variable name: partner_data
    for (const char_id in partner_data) {
        const charData = partner_data[char_id];
        // Compare against the canonical name from alias resolution
        if (charData && charData.name && charData.name === canonicalName) {
            return char_id; // Return the ID (key)
        }
    }
    // console.warn(`Character ID not found for name: "${char_name}" (resolved to: "${canonicalName}").`);
    return undefined; // Not found
}
export function get_char_circle_icon_url(char_id) { // 使用 export function 直接导出
    const charIdStr = String(char_id);

    // 检查新加载的 avatar_icon_data 中是否存在 CircleIcon
    if (avatar_icon_data[charIdStr] && avatar_icon_data[charIdStr].CircleIcon && typeof avatar_icon_data[charIdStr].CircleIcon === 'string') {
        const iconPath = avatar_icon_data[charIdStr].CircleIcon; // <--- 从 avatar_icon_data 获取路径
        // 确保路径以 '/' 开头
        if (iconPath.startsWith('/')) {
            return BASE_IMAGE_URL + iconPath;
        } else {
            // 日志中指明来源文件
            console.warn(`[name_convert.js] ${AvatarIconDataFile} 中角色 ID ${charIdStr} 的 CircleIcon 路径不以 '/' 开头: "${iconPath}". 无法构建 URL.`);
            return undefined;
        }
    } else {

        return undefined; // 数据或路径缺失则返回 undefined
    }
}
// Export the loaded data objects as well
export {
    equip_data,
    weapon_data,
    partner_data,
    char_alias_data,
    PartnerId2SkillParam,

};
