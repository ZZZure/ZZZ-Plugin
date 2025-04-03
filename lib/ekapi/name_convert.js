// name_convert.js
console.log('[name_convert.js] 文件开始执行'); // <--- 加入这行
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url'; // <--- 1. 导入 fileURLToPath

// Use import.meta.url WITH fileURLToPath
const __filename = fileURLToPath(import.meta.url); // <--- 2. 获取当前文件的绝对路径
const __dirname = path.dirname(__filename);       // <--- 3. 获取当前文件所在的目录路径

const MAP_PATH = __dirname; // Data files are in the same directory
const ALIAS_LIST_DIR = path.join(__dirname, 'alias'); // Alias directory path
const CHAR_ALIAS_FILE = path.join(ALIAS_LIST_DIR, 'char_alias.json'); // Alias file path

const PartnerId2DataFile = 'PartnerId2Data.json';
const WeaponId2DataFile = 'WeaponId2Data.json';
const EquipId2DataFile = 'EquipId2Data.json';
const SkillParamFile = 'PartnerId2SkillParam.json'; // 定义技能数据文件名
let PartnerId2SkillParam = {}; // 初始化技能数据对象
try {
    const skillParamPath = path.join(MAP_PATH, SkillParamFile);
    if (fs.existsSync(skillParamPath)) {
        const skillParamContent = fs.readFileSync(skillParamPath, { encoding: 'utf-8' });
        PartnerId2SkillParam = JSON.parse(skillParamContent);
        console.log(`[name_convert.js] 成功加载并解析 ${SkillParamFile}。`);
        // 可以选择性地添加更多日志来确认加载内容
        // console.log(`[name_convert.js] 加载了 ${Object.keys(PartnerId2SkillParam).length} 个角色的技能数据。`);
    } else {
         console.error(`${SkillParamFile} 文件未找到于: ${skillParamPath}`);
         // 或者使用 console.warn 如果你希望即使缺少技能数据也能继续运行
         // console.warn(`${SkillParamFile} 文件未找到于: ${skillParamPath}. 技能名称将使用默认值。`);
    }
} catch (error) {
    console.error(`读取或解析 ${SkillParamFile} 时出错:`, error);
    // 考虑是否在此处设置 PartnerId2SkillParam = {} 以防止后续错误
    PartnerId2SkillParam = {};
}
// --- End 新增：加载技能数据 ---
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
        console.log(`[name_convert.js] 成功解析 JSON。`);
console.log(`[name_convert.js] 加载了 ${Object.keys(partner_data).length} 个伙伴条目。`);
console.log(`[name_convert.js] 加载后是否存在 "1191"? ${partner_data.hasOwnProperty('1191')}`);
console.log(`[name_convert.js] 加载后是否存在 "1021"? ${partner_data.hasOwnProperty('1021')}`);
        // Optional: Keep debug logs if needed during development
        // console.log('--- partner_data loaded successfully ---');
        // console.log(`Loaded ${Object.keys(partner_data).length} partner entries.`);
        // console.log('--- partner_data sample entry ---');
        // const sampleKey = Object.keys(partner_data)[0];
        // if (sampleKey) console.log({ [sampleKey]: partner_data[sampleKey] });
        // console.log('--- partner_data loading end ---');
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

// --- Helper Functions ---

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

// Export the loaded data objects as well
export {
    equip_data,
    weapon_data,
    partner_data,
    char_alias_data,
    PartnerId2SkillParam
    // Optionally export alias data if needed elsewhere
};
// import fs from 'node:fs';
// import path from 'node:path';
//
// const MAP_PATH = path.dirname(new URL(import.meta.url).pathname);
// const ALIAS_LIST = path.join(path.dirname(new URL(import.meta.url).pathname), 'alias');
// const CHAR_ALIAS = path.join(ALIAS_LIST, 'char_alias.json');
// const PartnerId2DataFile = 'PartnerId2Data.json';
// const WeaponId2DataFile = 'WeaponId2Data.json';
// const EquipId2DataFile = 'EquipId2Data.json';
//
// let char_alias_data = {};
// try {
//     const charAliasContent = fs.readFileSync(CHAR_ALIAS, { encoding: 'utf-8' });
//     char_alias_data = JSON.parse(charAliasContent);
// } catch (error) {
//     console.error('Error reading char_alias.json:', error);
// }
//
// let partner_data = {};
// try {
//     const partnerDataContent = fs.readFileSync(path.join(MAP_PATH, PartnerId2DataFile), { encoding: 'utf-8' });
//     partner_data = JSON.parse(partnerDataContent);
//     console.log('--- partner_data 内容开始 ---');
// console.log(partner_data);
// console.log('--- partner_data 内容结束 ---');
// } catch (error) {
//     console.error('Error reading PartnerId2Data.json:', error);
// }
//
// let weapon_data = {};
// try {
//     const weaponDataContent = fs.readFileSync(path.join(MAP_PATH, WeaponId2DataFile), { encoding: 'utf-8' });
//     weapon_data = JSON.parse(weaponDataContent);
// } catch (error) {
//     console.error('Error reading WeaponId2Data.json:', error);
// }
//
// let equip_data = {};
// try {
//     const equipDataContent = fs.readFileSync(path.join(MAP_PATH, EquipId2DataFile), { encoding: 'utf-8' });
//     equip_data = JSON.parse(equipDataContent);
// } catch (error) {
//     console.error('Error reading EquipId2Data.json:', error);
// }
//
// export function char_id_to_sprite(char_id) {
//     const charIdStr = String(char_id);
//     if (partener_data[charIdStr]) {
//         return partener_data[charIdStr].sprite_id;
//     } else {
//         return '28';
//     }
// }
//
// export function char_id_to_full_name(char_id) {
//     const charIdStr = String(char_id);
//     if (partener_data[charIdStr]) {
//         return partener_data[charIdStr].full_name;
//     } else {
//         return '绳匠';
//     }
// }
//
// export function equip_id_to_sprite(equip_id) {
//     const equipIdStr = String(equip_id);
//     if (equipIdStr.length === 5) {
//         const suit_id = equipIdStr.slice(0, 3) + '00';
//         if (equip_data[suit_id]) {
//             return equip_data[suit_id].sprite_file;
//         }
//     }
//     return undefined;
// }
//
// export function alias_to_char_name(char_name) {
//     for (const i in char_alias_data) {
//         if (char_name === i || (Array.isArray(char_alias_data[i]) && char_alias_data[i].includes(char_name))) {
//             return i;
//         }
//     }
//     return char_name;
// }
//
// export function char_id_to_char_name(char_id) {
//     if (partener_data[char_id]) {
//         return partener_data[char_id].name;
//     } else {
//         return undefined;
//     }
// }
//
// export function char_name_to_char_id(char_name) {
//     const aliasConvertedName = alias_to_char_name(char_name);
//     for (const i in partener_data) {
//         const chars = partener_data[i];
//         if (aliasConvertedName === chars.name) {
//             return i;
//         }
//     }
//     return undefined;
// }
//
// export {
//     equip_data,
//     weapon_data,
//     partner_data,
// };
